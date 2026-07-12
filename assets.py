import io
from typing import List, Optional

import qrcode
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import (
    Allocation, Asset, AssetStatus, Category, MaintenanceRequest, Role, User,
)
from ..schemas import AssetIn, AssetOut
from ..security import current_user, require
from ..services import current_holder, health_score, log, next_tag

router = APIRouter(prefix="/api/assets", tags=["assets"])
manager = require(Role.ADMIN, Role.ASSET_MANAGER)


@router.post("", response_model=AssetOut, status_code=201)
def register(body: AssetIn, db: Session = Depends(get_db), user: User = Depends(manager)):
    category = db.get(Category, body.category_id)
    if not category:
        raise HTTPException(422, "Pick a category that exists.")
    if body.serial_number and db.scalar(
        select(Asset).where(Asset.serial_number == body.serial_number)
    ):
        raise HTTPException(409, "That serial number is already registered.")

    asset = Asset(**body.model_dump(), tag=next_tag(db, category),
                  status=AssetStatus.AVAILABLE)
    db.add(asset)
    db.flush()
    log(db, user, "ASSET_REGISTERED", "asset", asset.id, f"{asset.tag} {asset.name}")
    db.commit()
    db.refresh(asset)
    return asset


@router.get("", response_model=List[AssetOut])
def search(
    q: Optional[str] = Query(None, description="Matches tag, name or serial number"),
    category_id: Optional[int] = None,
    status: Optional[AssetStatus] = None,
    department_id: Optional[int] = None,
    location: Optional[str] = None,
    bookable: Optional[bool] = None,
    db: Session = Depends(get_db),
    _: User = Depends(current_user),
):
    stmt = select(Asset).order_by(Asset.tag)
    if q:
        like = f"%{q.strip()}%"
        stmt = stmt.where(or_(
            Asset.tag.ilike(like), Asset.name.ilike(like), Asset.serial_number.ilike(like)
        ))
    if category_id:
        stmt = stmt.where(Asset.category_id == category_id)
    if status:
        stmt = stmt.where(Asset.status == status)
    if department_id:
        stmt = stmt.where(Asset.department_id == department_id)
    if location:
        stmt = stmt.where(Asset.location.ilike(f"%{location}%"))
    if bookable is not None:
        stmt = stmt.where(Asset.is_bookable.is_(bookable))
    return db.scalars(stmt).all()


@router.get("/{asset_id}")
def detail(asset_id: int, db: Session = Depends(get_db), _: User = Depends(current_user)):
    asset = db.get(Asset, asset_id)
    if not asset:
        raise HTTPException(404, "Asset not found.")

    holder = current_holder(db, asset.id)
    allocations = db.scalars(
        select(Allocation).where(Allocation.asset_id == asset.id)
        .order_by(Allocation.allocated_at.desc())
    ).all()
    repairs = db.scalars(
        select(MaintenanceRequest).where(MaintenanceRequest.asset_id == asset.id)
        .order_by(MaintenanceRequest.created_at.desc())
    ).all()

    return {
        "asset": AssetOut.model_validate(asset),
        "category": asset.category.name if asset.category else None,
        "held_by": {"id": holder.holder.id, "name": holder.holder.name}
        if holder and holder.holder else None,
        "health": health_score(db, asset),
        "allocation_history": [
            {
                "id": a.id,
                "holder": a.holder.name if a.holder else "Department",
                "from": a.allocated_at,
                "expected_return": a.expected_return,
                "returned_at": a.returned_at,
                "checkin_condition": a.checkin_condition,
            }
            for a in allocations
        ],
        "maintenance_history": [
            {
                "id": m.id, "issue": m.issue, "priority": m.priority,
                "status": m.status.value, "raised": m.created_at, "resolved": m.resolved_at,
            }
            for m in repairs
        ],
    }


@router.get("/{asset_id}/qr")
def qr_label(asset_id: int, db: Session = Depends(get_db)):
    """
    A scannable label for the physical asset. Print it, stick it on the laptop,
    and any phone camera deep-links straight to this asset's page. The auditor
    walking the floor never types a tag by hand.
    """
    asset = db.get(Asset, asset_id)
    if not asset:
        raise HTTPException(404, "Asset not found.")
    img = qrcode.make(f"assetflow://asset/{asset.tag}")
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return StreamingResponse(
        buf, media_type="image/png",
        headers={"Content-Disposition": f'inline; filename="{asset.tag}.png"'},
    )


@router.get("/by-tag/{tag}", response_model=AssetOut)
def lookup_by_tag(tag: str, db: Session = Depends(get_db), _: User = Depends(current_user)):
    """Resolves a scanned QR payload back to an asset."""
    clean = tag.replace("assetflow://asset/", "").strip().upper()
    asset = db.scalar(select(Asset).where(Asset.tag == clean))
    if not asset:
        raise HTTPException(404, f"No asset carries the tag {clean}.")
    return asset

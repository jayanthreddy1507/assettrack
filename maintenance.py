from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import (
    Asset, AssetStatus, MaintenanceRequest, MaintenanceStatus, Role, User,
)
from ..schemas import MaintenanceDecision, MaintenanceIn, MaintenanceOut
from ..security import current_user, require
from ..services import current_holder, log, notify, notify_roles

router = APIRouter(prefix="/api/maintenance", tags=["maintenance"])
approver = require(Role.ADMIN, Role.ASSET_MANAGER)

# Only these hops are legal. Anything else is a 409 with the allowed moves listed,
# which means the workflow cannot be skipped by hand-crafting a request.
NEXT = {
    MaintenanceStatus.APPROVED: {MaintenanceStatus.TECHNICIAN_ASSIGNED},
    MaintenanceStatus.TECHNICIAN_ASSIGNED: {MaintenanceStatus.IN_PROGRESS},
    MaintenanceStatus.IN_PROGRESS: {MaintenanceStatus.RESOLVED},
}


@router.post("", response_model=MaintenanceOut, status_code=201)
def raise_request(body: MaintenanceIn, db: Session = Depends(get_db),
                  user: User = Depends(current_user)):
    asset = db.get(Asset, body.asset_id)
    if not asset:
        raise HTTPException(404, "Asset not found.")
    if asset.status == AssetStatus.UNDER_MAINTENANCE:
        raise HTTPException(409, f"{asset.tag} is already under maintenance.")
    if db.scalar(select(MaintenanceRequest).where(
        MaintenanceRequest.asset_id == asset.id,
        MaintenanceRequest.status.in_([
            MaintenanceStatus.PENDING, MaintenanceStatus.APPROVED,
            MaintenanceStatus.TECHNICIAN_ASSIGNED, MaintenanceStatus.IN_PROGRESS,
        ]),
    )):
        raise HTTPException(409, f"An open maintenance request already exists for {asset.tag}.")

    req = MaintenanceRequest(**body.model_dump(), raised_by_id=user.id,
                             status=MaintenanceStatus.PENDING)
    db.add(req)
    db.flush()

    # The asset status does NOT move here. Raising a request is a request, not a
    # decision. The brief is explicit: approval comes before the flip.
    notify_roles(db, [Role.ASSET_MANAGER], "MAINTENANCE_RAISED",
                 f"{user.name} reported an issue on {asset.tag} ({body.priority}).",
                 "/maintenance")
    log(db, user, "MAINTENANCE_RAISED", "asset", asset.id, f"{asset.tag}: {body.priority}")
    db.commit()
    db.refresh(req)
    return req


@router.get("", response_model=List[MaintenanceOut])
def list_requests(status: Optional[MaintenanceStatus] = None, mine: bool = False,
                  db: Session = Depends(get_db), user: User = Depends(current_user)):
    stmt = select(MaintenanceRequest).order_by(MaintenanceRequest.created_at.desc())
    if status:
        stmt = stmt.where(MaintenanceRequest.status == status)
    if mine:
        stmt = stmt.where(MaintenanceRequest.raised_by_id == user.id)
    return db.scalars(stmt).all()


@router.post("/{req_id}/decide", response_model=MaintenanceOut)
def decide(req_id: int, body: MaintenanceDecision, db: Session = Depends(get_db),
           user: User = Depends(approver)):
    req = db.get(MaintenanceRequest, req_id)
    if not req:
        raise HTTPException(404, "Request not found.")
    if req.status != MaintenanceStatus.PENDING:
        raise HTTPException(409, f"This request is already {req.status.value.lower()}.")

    req.approved_by_id = user.id
    if not body.approve:
        req.status = MaintenanceStatus.REJECTED
        req.resolution_notes = body.note
        notify(db, req.raised_by_id, "MAINTENANCE_REJECTED",
               f"Your maintenance request for {req.asset.tag} was declined.", "/maintenance")
        log(db, user, "MAINTENANCE_REJECTED", "asset", req.asset_id, req.asset.tag)
        db.commit()
        db.refresh(req)
        return req

    req.status = MaintenanceStatus.APPROVED
    # Approval is the moment the asset leaves service. If it was allocated, the
    # allocation stays open — the holder still owns it, it is simply in the shop.
    req.asset.status = AssetStatus.UNDER_MAINTENANCE

    notify(db, req.raised_by_id, "MAINTENANCE_APPROVED",
           f"{req.asset.tag} has been approved for repair.", "/maintenance")
    holder = current_holder(db, req.asset_id)
    if holder and holder.holder_id and holder.holder_id != req.raised_by_id:
        notify(db, holder.holder_id, "MAINTENANCE_APPROVED",
               f"{req.asset.tag}, assigned to you, has gone in for repair.", "/maintenance")
    log(db, user, "MAINTENANCE_APPROVED", "asset", req.asset_id,
        f"{req.asset.tag} -> UNDER_MAINTENANCE")
    db.commit()
    db.refresh(req)
    return req


@router.post("/{req_id}/advance", response_model=MaintenanceOut)
def advance(req_id: int, to: MaintenanceStatus, technician: Optional[str] = None,
            notes: Optional[str] = None, db: Session = Depends(get_db),
            user: User = Depends(approver)):
    req = db.get(MaintenanceRequest, req_id)
    if not req:
        raise HTTPException(404, "Request not found.")

    allowed = NEXT.get(req.status, set())
    if to not in allowed:
        raise HTTPException(409, {
            "message": f"A {req.status.value.lower()} request cannot jump to "
                       f"{to.value.lower()}.",
            "allowed_next": [s.value for s in allowed] or ["nothing — this request is closed"],
        })
    if to == MaintenanceStatus.TECHNICIAN_ASSIGNED and not technician:
        raise HTTPException(422, "Name the technician taking the job.")

    req.status = to
    if technician:
        req.technician = technician

    if to == MaintenanceStatus.RESOLVED:
        req.resolved_at = datetime.now(timezone.utc)
        req.resolution_notes = notes
        # Back to whoever was holding it, or back on the shelf.
        holder = current_holder(db, req.asset_id)
        req.asset.status = AssetStatus.ALLOCATED if holder else AssetStatus.AVAILABLE
        notify(db, req.raised_by_id, "MAINTENANCE_RESOLVED",
               f"{req.asset.tag} is repaired and back in service.", f"/assets/{req.asset_id}")

    log(db, user, f"MAINTENANCE_{to.value}", "asset", req.asset_id, req.asset.tag)
    db.commit()
    db.refresh(req)
    return req

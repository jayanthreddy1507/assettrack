from datetime import date, datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import (
    Allocation, Asset, AssetStatus, Role, TransferRequest, TransferStatus, User,
)
from ..schemas import AllocateIn, ReturnIn, TransferIn, TransferOut
from ..security import current_user, require
from ..services import allocation_alternatives, current_holder, log, notify, notify_roles

router = APIRouter(prefix="/api/allocations", tags=["allocation"])
approver = require(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD)
allocator = require(Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD)


@router.post("", status_code=201)
def allocate(body: AllocateIn, db: Session = Depends(get_db), user: User = Depends(allocator)):
    """
    The conflict rule from the brief, in full.

    Priya holds AF-0114. Raj tries to allocate it. He gets a 409 that names
    Priya, lists the free laptops he could take instead, and hands him a
    ready-to-fire transfer request. He is never left staring at 'Error'.
    """
    asset = db.get(Asset, body.asset_id)
    if not asset:
        raise HTTPException(404, "Asset not found.")
    if not body.holder_id and not body.department_id:
        raise HTTPException(422, "Choose an employee or a department to allocate to.")

    if asset.status in (AssetStatus.UNDER_MAINTENANCE, AssetStatus.LOST,
                        AssetStatus.RETIRED, AssetStatus.DISPOSED):
        raise HTTPException(409, {
            "reason": "unavailable",
            "message": f"{asset.tag} is {asset.status.value.replace('_', ' ').lower()} "
                       f"and cannot be allocated.",
            "alternatives": allocation_alternatives(db, asset),
        })

    held = current_holder(db, asset.id)
    if held:
        holder_name = held.holder.name if held.holder else "another department"
        raise HTTPException(409, {
            "reason": "already_allocated",
            "message": f"{asset.tag} is currently held by {holder_name}.",
            "held_by": {"id": held.holder_id, "name": holder_name},
            "since": held.allocated_at.isoformat() if held.allocated_at else None,
            "can_request_transfer": True,
            "alternatives": allocation_alternatives(db, asset),
        })

    allocation = Allocation(
        asset_id=asset.id, holder_id=body.holder_id, department_id=body.department_id,
        allocated_by_id=user.id, expected_return=body.expected_return,
    )
    db.add(allocation)
    asset.status = AssetStatus.ALLOCATED
    if body.department_id:
        asset.department_id = body.department_id

    try:
        db.flush()
    except IntegrityError:
        # Two allocators clicked at the same instant. Postgres arbitrated; we
        # translate its verdict into the same friendly 409 as above.
        db.rollback()
        raise HTTPException(409, {
            "reason": "already_allocated",
            "message": f"{asset.tag} was claimed a moment ago by someone else.",
            "can_request_transfer": True,
        })

    if body.holder_id:
        notify(db, body.holder_id, "ASSET_ASSIGNED",
               f"{asset.tag} — {asset.name} is now assigned to you.", f"/assets/{asset.id}")
    log(db, user, "ASSET_ALLOCATED", "asset", asset.id,
        f"{asset.tag} -> user {body.holder_id or '-'} / dept {body.department_id or '-'}")
    db.commit()
    return {"id": allocation.id, "asset_id": asset.id, "status": asset.status.value}


@router.post("/{asset_id}/return")
def return_asset(asset_id: int, body: ReturnIn, db: Session = Depends(get_db),
                 user: User = Depends(current_user)):
    asset = db.get(Asset, asset_id)
    if not asset:
        raise HTTPException(404, "Asset not found.")
    held = current_holder(db, asset_id)
    if not held:
        raise HTTPException(409, f"{asset.tag} is not allocated to anyone.")

    # A holder can hand their own asset back; a manager can check in anyone's.
    if held.holder_id != user.id and user.role not in (
        Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD
    ):
        raise HTTPException(403, "You can only return assets allocated to you.")

    held.returned_at = datetime.now(timezone.utc)
    held.checkin_condition = body.checkin_condition
    held.checkin_notes = body.checkin_notes
    asset.condition = body.checkin_condition
    asset.status = AssetStatus.AVAILABLE

    notify_roles(db, [Role.ASSET_MANAGER], "ASSET_RETURNED",
                 f"{asset.tag} returned in {body.checkin_condition} condition.",
                 f"/assets/{asset.id}")
    log(db, user, "ASSET_RETURNED", "asset", asset.id,
        f"{asset.tag} checked in as {body.checkin_condition}")
    db.commit()
    return {"asset_id": asset.id, "status": asset.status.value}


@router.get("/overdue")
def overdue(db: Session = Depends(get_db), _: User = Depends(current_user)):
    rows = db.scalars(
        select(Allocation).where(
            Allocation.returned_at.is_(None),
            Allocation.expected_return.is_not(None),
            Allocation.expected_return < date.today(),
        ).order_by(Allocation.expected_return)
    ).all()
    return [
        {
            "allocation_id": a.id,
            "asset_id": a.asset_id,
            "asset_tag": a.asset.tag,
            "asset_name": a.asset.name,
            "holder": a.holder.name if a.holder else "Department",
            "expected_return": a.expected_return,
            "days_overdue": (date.today() - a.expected_return).days,
        }
        for a in rows
    ]


# ------------------------------------------------------------------- transfers
@router.post("/transfers", response_model=TransferOut, status_code=201)
def request_transfer(body: TransferIn, db: Session = Depends(get_db),
                     user: User = Depends(current_user)):
    asset = db.get(Asset, body.asset_id)
    if not asset:
        raise HTTPException(404, "Asset not found.")
    held = current_holder(db, asset.id)
    if not held:
        raise HTTPException(409, f"{asset.tag} is free — allocate it directly instead.")
    if db.scalar(select(TransferRequest).where(
        TransferRequest.asset_id == asset.id,
        TransferRequest.status == TransferStatus.REQUESTED,
    )):
        raise HTTPException(409, f"A transfer request for {asset.tag} is already awaiting a decision.")

    tr = TransferRequest(
        asset_id=asset.id, from_user_id=held.holder_id, to_user_id=body.to_user_id,
        requested_by_id=user.id, reason=body.reason,
    )
    db.add(tr)
    db.flush()

    notify_roles(db, [Role.ASSET_MANAGER, Role.DEPT_HEAD], "TRANSFER_REQUESTED",
                 f"{user.name} requested a transfer of {asset.tag}.", "/allocations")
    if held.holder_id:
        notify(db, held.holder_id, "TRANSFER_REQUESTED",
               f"{user.name} has asked for {asset.tag}, currently with you.", "/allocations")
    log(db, user, "TRANSFER_REQUESTED", "asset", asset.id, f"{asset.tag} -> user {body.to_user_id}")
    db.commit()
    db.refresh(tr)
    return tr


@router.get("/transfers", response_model=List[TransferOut])
def list_transfers(db: Session = Depends(get_db), _: User = Depends(current_user)):
    return db.scalars(
        select(TransferRequest).order_by(TransferRequest.created_at.desc())
    ).all()


@router.post("/transfers/{transfer_id}/decide")
def decide_transfer(transfer_id: int, approve: bool, db: Session = Depends(get_db),
                    user: User = Depends(approver)):
    """Requested -> Approved -> Re-allocated, with history written automatically."""
    tr = db.get(TransferRequest, transfer_id)
    if not tr:
        raise HTTPException(404, "Transfer request not found.")
    if tr.status != TransferStatus.REQUESTED:
        raise HTTPException(409, f"This request was already {tr.status.value.lower()}.")

    tr.decided_by_id = user.id
    tr.decided_at = datetime.now(timezone.utc)

    if not approve:
        tr.status = TransferStatus.REJECTED
        notify(db, tr.requested_by_id, "TRANSFER_REJECTED",
               f"Your transfer request for {tr.asset.tag} was declined.", "/allocations")
        log(db, user, "TRANSFER_REJECTED", "asset", tr.asset_id, tr.asset.tag)
        db.commit()
        return {"status": tr.status.value}

    # Close the old allocation and open the new one inside one transaction, so the
    # partial unique index never sees two open rows for this asset.
    held = current_holder(db, tr.asset_id)
    if held:
        held.returned_at = datetime.now(timezone.utc)
        held.checkin_notes = f"Transferred to user {tr.to_user_id} by {user.name}"
    db.flush()

    db.add(Allocation(
        asset_id=tr.asset_id, holder_id=tr.to_user_id,
        allocated_by_id=user.id, expected_return=held.expected_return if held else None,
    ))
    tr.status = TransferStatus.COMPLETED
    tr.asset.status = AssetStatus.ALLOCATED

    notify(db, tr.to_user_id, "TRANSFER_APPROVED",
           f"{tr.asset.tag} has been transferred to you.", f"/assets/{tr.asset_id}")
    if tr.from_user_id:
        notify(db, tr.from_user_id, "TRANSFER_APPROVED",
               f"{tr.asset.tag} has moved on from you.", f"/assets/{tr.asset_id}")
    log(db, user, "TRANSFER_APPROVED", "asset", tr.asset_id,
        f"{tr.asset.tag}: user {tr.from_user_id} -> user {tr.to_user_id}")
    db.commit()
    return {"status": tr.status.value}

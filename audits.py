from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import (
    Asset, AssetStatus, AuditAssignment, AuditCycle, AuditCycleStatus, AuditItem,
    AuditResult, Role, User,
)
from ..schemas import AuditCycleIn, AuditCycleOut, AuditMarkIn
from ..security import current_user, require
from ..services import current_holder, log, notify, notify_roles

router = APIRouter(prefix="/api/audits", tags=["audits"])
admin_only = require(Role.ADMIN)
closer = require(Role.ADMIN, Role.ASSET_MANAGER)


@router.post("/cycles", response_model=AuditCycleOut, status_code=201)
def create_cycle(body: AuditCycleIn, db: Session = Depends(get_db),
                 admin: User = Depends(admin_only)):
    """
    Creating a cycle freezes a worklist. Every asset inside the scope becomes an
    AuditItem carrying a snapshot of where the system *thinks* it is and who it
    thinks is holding it — so when the auditor finds something else, the report
    can print expected-vs-found instead of a bare red flag.
    """
    cycle = AuditCycle(
        name=body.name, scope_department_id=body.scope_department_id,
        scope_location=body.scope_location, start_date=body.start_date,
        end_date=body.end_date, created_by_id=admin.id, status=AuditCycleStatus.ACTIVE,
    )
    db.add(cycle)
    db.flush()

    stmt = select(Asset).where(Asset.status.not_in([AssetStatus.DISPOSED, AssetStatus.RETIRED]))
    if body.scope_department_id:
        stmt = stmt.where(Asset.department_id == body.scope_department_id)
    if body.scope_location:
        stmt = stmt.where(Asset.location.ilike(f"%{body.scope_location}%"))
    assets = db.scalars(stmt).all()
    if not assets:
        raise HTTPException(422, "No assets fall inside that scope. Widen it and try again.")

    for asset in assets:
        held = current_holder(db, asset.id)
        db.add(AuditItem(
            cycle_id=cycle.id, asset_id=asset.id, result=AuditResult.PENDING,
            expected_location=asset.location,
            expected_holder=held.holder.name if held and held.holder else None,
        ))

    for auditor_id in set(body.auditor_ids):
        if not db.get(User, auditor_id):
            raise HTTPException(422, f"Auditor {auditor_id} is not a real user.")
        db.add(AuditAssignment(cycle_id=cycle.id, auditor_id=auditor_id))
        notify(db, auditor_id, "AUDIT_ASSIGNED",
               f"You are auditing {len(assets)} assets in '{cycle.name}'.",
               f"/audits/{cycle.id}")

    log(db, admin, "AUDIT_CYCLE_CREATED", "audit_cycle", cycle.id,
        f"{cycle.name}: {len(assets)} assets, {len(set(body.auditor_ids))} auditors")
    db.commit()
    db.refresh(cycle)
    return cycle


@router.get("/cycles", response_model=List[AuditCycleOut])
def list_cycles(db: Session = Depends(get_db), _: User = Depends(current_user)):
    return db.scalars(select(AuditCycle).order_by(AuditCycle.start_date.desc())).all()


@router.get("/cycles/{cycle_id}")
def cycle_detail(cycle_id: int, db: Session = Depends(get_db), _: User = Depends(current_user)):
    cycle = db.get(AuditCycle, cycle_id)
    if not cycle:
        raise HTTPException(404, "Audit cycle not found.")
    items = db.scalars(select(AuditItem).where(AuditItem.cycle_id == cycle_id)).all()
    auditors = db.scalars(
        select(User).join(AuditAssignment, AuditAssignment.auditor_id == User.id)
        .where(AuditAssignment.cycle_id == cycle_id)
    ).all()

    counts = {r.value: 0 for r in AuditResult}
    for item in items:
        counts[item.result.value] += 1

    return {
        "cycle": AuditCycleOut.model_validate(cycle),
        "auditors": [{"id": a.id, "name": a.name} for a in auditors],
        "progress": {
            "checked": len(items) - counts["PENDING"],
            "total": len(items),
            "counts": counts,
        },
        "items": [
            {
                "id": i.id, "asset_id": i.asset_id, "tag": i.asset.tag,
                "name": i.asset.name, "result": i.result.value, "notes": i.notes,
                "expected_location": i.expected_location,
                "expected_holder": i.expected_holder,
            }
            for i in items
        ],
    }


@router.post("/items/{item_id}/mark")
def mark(item_id: int, body: AuditMarkIn, db: Session = Depends(get_db),
         user: User = Depends(current_user)):
    item = db.get(AuditItem, item_id)
    if not item:
        raise HTTPException(404, "Audit line not found.")
    cycle = db.get(AuditCycle, item.cycle_id)
    if cycle.status != AuditCycleStatus.ACTIVE:
        raise HTTPException(409, "This cycle is closed. Its records cannot be edited.")

    assigned = db.scalar(select(AuditAssignment).where(
        AuditAssignment.cycle_id == cycle.id, AuditAssignment.auditor_id == user.id
    ))
    if not assigned and user.role not in (Role.ADMIN, Role.ASSET_MANAGER):
        raise HTTPException(403, "You are not an auditor on this cycle.")

    item.result = body.result
    item.notes = body.notes
    item.checked_by_id = user.id
    item.checked_at = datetime.now(timezone.utc)

    if body.result in (AuditResult.MISSING, AuditResult.DAMAGED):
        notify_roles(db, [Role.ASSET_MANAGER, Role.ADMIN], "AUDIT_DISCREPANCY",
                     f"{item.asset.tag} flagged {body.result.value.lower()} in '{cycle.name}'.",
                     f"/audits/{cycle.id}")
    log(db, user, "AUDIT_MARKED", "asset", item.asset_id,
        f"{item.asset.tag} = {body.result.value}")
    db.commit()
    return {"item_id": item.id, "result": item.result.value}


@router.get("/cycles/{cycle_id}/discrepancies")
def discrepancy_report(cycle_id: int, db: Session = Depends(get_db),
                       _: User = Depends(current_user)):
    """Auto-generated. Nobody types this report; it is a query over what the auditors found."""
    items = db.scalars(
        select(AuditItem).where(
            AuditItem.cycle_id == cycle_id,
            AuditItem.result.in_([AuditResult.MISSING, AuditResult.DAMAGED]),
        )
    ).all()
    return {
        "cycle_id": cycle_id,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "total_flagged": len(items),
        "rows": [
            {
                "tag": i.asset.tag,
                "asset": i.asset.name,
                "finding": i.result.value,
                "expected_location": i.expected_location or "—",
                "expected_holder": i.expected_holder or "Unassigned",
                "auditor_notes": i.notes or "—",
                "value_at_risk": float(i.asset.acquisition_cost or 0),
            }
            for i in items
        ],
        "value_at_risk_total": sum(float(i.asset.acquisition_cost or 0) for i in items),
    }


@router.post("/cycles/{cycle_id}/close")
def close_cycle(cycle_id: int, db: Session = Depends(get_db), user: User = Depends(closer)):
    """
    Closing is the consequential act: confirmed-missing assets become LOST,
    damaged ones drop to Poor condition, and the whole cycle goes read-only.
    """
    cycle = db.get(AuditCycle, cycle_id)
    if not cycle:
        raise HTTPException(404, "Audit cycle not found.")
    if cycle.status == AuditCycleStatus.CLOSED:
        raise HTTPException(409, "This cycle is already closed.")

    items = db.scalars(select(AuditItem).where(AuditItem.cycle_id == cycle_id)).all()
    pending = [i for i in items if i.result == AuditResult.PENDING]
    if pending:
        raise HTTPException(409, {
            "message": f"{len(pending)} assets have not been checked yet.",
            "unchecked": [i.asset.tag for i in pending[:10]],
        })

    lost, damaged = 0, 0
    for item in items:
        if item.result == AuditResult.MISSING:
            item.asset.status = AssetStatus.LOST
            lost += 1
        elif item.result == AuditResult.DAMAGED:
            item.asset.condition = "Poor"
            damaged += 1

    cycle.status = AuditCycleStatus.CLOSED
    cycle.closed_at = datetime.now(timezone.utc)

    notify_roles(db, [Role.ADMIN, Role.ASSET_MANAGER], "AUDIT_CLOSED",
                 f"'{cycle.name}' closed: {lost} lost, {damaged} damaged.",
                 f"/audits/{cycle.id}")
    log(db, user, "AUDIT_CYCLE_CLOSED", "audit_cycle", cycle.id,
        f"{lost} marked LOST, {damaged} marked damaged")
    db.commit()
    return {"status": cycle.status.value, "marked_lost": lost, "marked_damaged": damaged}

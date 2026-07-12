import csv
import io
from datetime import date, datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import (
    ActivityLog, Allocation, Asset, AssetStatus, Booking, BookingStatus, Category,
    Department, MaintenanceRequest, MaintenanceStatus, Notification, Role,
    TransferRequest, TransferStatus, User,
)
from ..security import current_user
from ..services import health_score

router = APIRouter(prefix="/api", tags=["insight"])
LIVE = (BookingStatus.UPCOMING.value, BookingStatus.ONGOING.value)


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db), user: User = Depends(current_user)):
    now = datetime.now(timezone.utc)
    today = date.today()

    def count_assets(status: AssetStatus) -> int:
        return db.scalar(select(func.count(Asset.id)).where(Asset.status == status)) or 0

    overdue = db.scalars(
        select(Allocation).where(
            Allocation.returned_at.is_(None),
            Allocation.expected_return.is_not(None),
            Allocation.expected_return < today,
        ).order_by(Allocation.expected_return)
    ).all()

    upcoming_returns = db.scalars(
        select(Allocation).where(
            Allocation.returned_at.is_(None),
            Allocation.expected_return.between(today, today + timedelta(days=7)),
        ).order_by(Allocation.expected_return)
    ).all()

    kpis = {
        "assets_available": count_assets(AssetStatus.AVAILABLE),
        "assets_allocated": count_assets(AssetStatus.ALLOCATED),
        "under_maintenance": count_assets(AssetStatus.UNDER_MAINTENANCE),
        "maintenance_today": db.scalar(
            select(func.count(MaintenanceRequest.id)).where(
                func.date(MaintenanceRequest.created_at) == today
            )
        ) or 0,
        "active_bookings": db.scalar(
            select(func.count(Booking.id)).where(
                Booking.status.in_(LIVE), Booking.end_ts >= now
            )
        ) or 0,
        "pending_transfers": db.scalar(
            select(func.count(TransferRequest.id)).where(
                TransferRequest.status == TransferStatus.REQUESTED
            )
        ) or 0,
        "pending_maintenance": db.scalar(
            select(func.count(MaintenanceRequest.id)).where(
                MaintenanceRequest.status == MaintenanceStatus.PENDING
            )
        ) or 0,
        "overdue_returns": len(overdue),
        "upcoming_returns": len(upcoming_returns),
    }

    return {
        "kpis": kpis,
        # Overdue is kept in its own list, not folded into "upcoming". The brief
        # asks for it to be highlighted separately, and it reads differently:
        # upcoming is a plan, overdue is a problem.
        "overdue": [
            {
                "asset_tag": a.asset.tag, "asset": a.asset.name,
                "holder": a.holder.name if a.holder else "Department",
                "due": a.expected_return, "days_overdue": (today - a.expected_return).days,
            }
            for a in overdue[:8]
        ],
        "upcoming": [
            {
                "asset_tag": a.asset.tag, "asset": a.asset.name,
                "holder": a.holder.name if a.holder else "Department",
                "due": a.expected_return, "days_left": (a.expected_return - today).days,
            }
            for a in upcoming_returns[:8]
        ],
        "my_assets": [
            {"id": a.asset.id, "tag": a.asset.tag, "name": a.asset.name,
             "due": a.expected_return}
            for a in db.scalars(select(Allocation).where(
                Allocation.holder_id == user.id, Allocation.returned_at.is_(None)
            ))
        ],
    }


@router.get("/reports/retirement-radar")
def retirement_radar(db: Session = Depends(get_db), _: User = Depends(current_user)):
    """
    Every live asset, scored and ranked worst-first. This is the screen a facilities
    manager actually wants: not "here is your data", but "replace these six things
    before they fail on someone".
    """
    rows = []
    for asset in db.scalars(select(Asset).where(
        Asset.status.not_in([AssetStatus.DISPOSED, AssetStatus.RETIRED])
    )):
        h = health_score(db, asset)
        rows.append({
            "id": asset.id, "tag": asset.tag, "name": asset.name,
            "category": asset.category.name if asset.category else None,
            "status": asset.status.value, "location": asset.location,
            "cost": float(asset.acquisition_cost or 0), **h,
        })
    rows.sort(key=lambda r: r["score"])
    return {
        "assets": rows,
        "summary": {
            "retire": sum(1 for r in rows if r["band"] == "retire"),
            "watch": sum(1 for r in rows if r["band"] == "watch"),
            "healthy": sum(1 for r in rows if r["band"] == "healthy"),
            "replacement_value": sum(r["cost"] for r in rows if r["band"] == "retire"),
        },
    }


@router.get("/reports/utilization")
def utilization(db: Session = Depends(get_db), _: User = Depends(current_user)):
    used = db.execute(
        select(Asset.tag, Asset.name, func.count(Allocation.id).label("times"))
        .join(Allocation, Allocation.asset_id == Asset.id)
        .group_by(Asset.id).order_by(func.count(Allocation.id).desc()).limit(8)
    ).all()

    idle = db.scalars(
        select(Asset).outerjoin(Allocation, Allocation.asset_id == Asset.id)
        .where(Asset.status == AssetStatus.AVAILABLE)
        .group_by(Asset.id).having(func.count(Allocation.id) == 0).limit(8)
    ).all()

    by_dept = db.execute(
        select(Department.name, func.count(Asset.id))
        .outerjoin(Asset, Asset.department_id == Department.id)
        .group_by(Department.id).order_by(func.count(Asset.id).desc())
    ).all()

    by_category = db.execute(
        select(Category.name, func.count(MaintenanceRequest.id))
        .join(Asset, Asset.category_id == Category.id)
        .join(MaintenanceRequest, MaintenanceRequest.asset_id == Asset.id)
        .group_by(Category.id).order_by(func.count(MaintenanceRequest.id).desc())
    ).all()

    return {
        "most_used": [{"tag": t, "name": n, "allocations": c} for t, n, c in used],
        "never_allocated": [{"tag": a.tag, "name": a.name} for a in idle],
        "assets_per_department": [{"department": d, "assets": c} for d, c in by_dept],
        "maintenance_by_category": [{"category": c, "requests": n} for c, n in by_category],
    }


@router.get("/reports/booking-heatmap")
def booking_heatmap(db: Session = Depends(get_db), _: User = Depends(current_user)):
    """7 x 13 grid — weekday against hour — of confirmed bookings. Peak windows fall out visually."""
    grid = [[0] * 13 for _ in range(7)]  # 08:00 .. 20:00
    for b in db.scalars(select(Booking).where(Booking.status != BookingStatus.CANCELLED.value)):
        day = b.start_ts.weekday()
        for hour in range(b.start_ts.hour, min(b.end_ts.hour + 1, 21)):
            if 8 <= hour <= 20:
                grid[day][hour - 8] += 1
    return {
        "days": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        "hours": list(range(8, 21)),
        "grid": grid,
    }


@router.get("/reports/export/{report}")
def export_csv(report: str, db: Session = Depends(get_db), _: User = Depends(current_user)):
    buf = io.StringIO()
    writer = csv.writer(buf)

    if report == "assets":
        writer.writerow(["Tag", "Name", "Category", "Status", "Location",
                         "Condition", "Cost", "Health"])
        for a in db.scalars(select(Asset).order_by(Asset.tag)):
            writer.writerow([
                a.tag, a.name, a.category.name if a.category else "", a.status.value,
                a.location or "", a.condition or "", float(a.acquisition_cost or 0),
                health_score(db, a)["score"],
            ])
    elif report == "allocations":
        writer.writerow(["Tag", "Asset", "Holder", "From", "Due", "Returned", "Condition"])
        for al in db.scalars(select(Allocation).order_by(Allocation.allocated_at.desc())):
            writer.writerow([
                al.asset.tag, al.asset.name,
                al.holder.name if al.holder else "Department",
                al.allocated_at, al.expected_return or "", al.returned_at or "OPEN",
                al.checkin_condition or "",
            ])
    elif report == "maintenance":
        writer.writerow(["Tag", "Asset", "Issue", "Priority", "Status", "Technician", "Raised"])
        for m in db.scalars(select(MaintenanceRequest).order_by(
            MaintenanceRequest.created_at.desc()
        )):
            writer.writerow([m.asset.tag, m.asset.name, m.issue, m.priority,
                             m.status.value, m.technician or "", m.created_at])
    else:
        raise HTTPException(404, "Choose one of: assets, allocations, maintenance.")

    buf.seek(0)
    stamp = date.today().isoformat()
    return StreamingResponse(
        iter([buf.getvalue()]), media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="assetflow-{report}-{stamp}.csv"'},
    )


# ------------------------------------------------------------- notifications
@router.get("/notifications")
def my_notifications(unread_only: bool = False, db: Session = Depends(get_db),
                     user: User = Depends(current_user)):
    stmt = select(Notification).where(Notification.user_id == user.id)
    if unread_only:
        stmt = stmt.where(Notification.is_read.is_(False))
    rows = db.scalars(stmt.order_by(Notification.created_at.desc()).limit(50)).all()
    unread = db.scalar(select(func.count(Notification.id)).where(
        Notification.user_id == user.id, Notification.is_read.is_(False)
    )) or 0
    return {
        "unread": unread,
        "items": [
            {"id": n.id, "kind": n.kind, "message": n.message, "link": n.link,
             "is_read": n.is_read, "created_at": n.created_at}
            for n in rows
        ],
    }


@router.post("/notifications/read")
def mark_read(db: Session = Depends(get_db), user: User = Depends(current_user)):
    for n in db.scalars(select(Notification).where(
        Notification.user_id == user.id, Notification.is_read.is_(False)
    )):
        n.is_read = True
    db.commit()
    return {"ok": True}


@router.get("/activity")
def activity(limit: int = 60, action: Optional[str] = None,
             db: Session = Depends(get_db), user: User = Depends(current_user)):
    if user.role not in (Role.ADMIN, Role.ASSET_MANAGER, Role.DEPT_HEAD):
        raise HTTPException(403, "The activity log is open to managers and admins.")
    stmt = select(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(min(limit, 200))
    if action:
        stmt = stmt.where(ActivityLog.action == action)
    return [
        {"id": r.id, "actor": r.actor_name, "action": r.action,
         "entity": f"{r.entity_type}#{r.entity_id}" if r.entity_type else None,
         "detail": r.detail, "at": r.created_at}
        for r in db.scalars(stmt)
    ]

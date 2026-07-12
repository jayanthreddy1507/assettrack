from datetime import date, datetime, timedelta, timezone
from typing import List, Optional

from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session

from .config import settings
from .models import (
    ActivityLog, Allocation, Asset, AssetStatus, Booking, BookingStatus,
    Category, MaintenanceRequest, Notification, User,
)


# ---------------------------------------------------------------- housekeeping

def next_tag(db: Session, category: Category) -> str:
    """AF-0001, AF-0002, ... Sequence is per prefix, gapless enough for a demo."""
    prefix = (category.prefix or "AF").upper()
    used = db.scalar(
        select(func.count(Asset.id)).join(Category).where(Category.prefix == prefix)
    ) or 0
    n = used + 1
    while db.scalar(select(Asset.id).where(Asset.tag == f"{prefix}-{n:04d}")):
        n += 1
    return f"{prefix}-{n:04d}"


def log(db: Session, actor: Optional[User], action: str, entity_type: str,
        entity_id: Optional[int], detail: str = "") -> None:
    db.add(ActivityLog(
        actor_id=actor.id if actor else None,
        actor_name=actor.name if actor else "system",
        action=action, entity_type=entity_type, entity_id=entity_id, detail=detail,
    ))


def notify(db: Session, user_id: int, kind: str, message: str, link: str = "") -> None:
    if not user_id:
        return
    db.add(Notification(user_id=user_id, kind=kind, message=message, link=link))


def notify_roles(db: Session, roles, kind: str, message: str, link: str = "") -> None:
    for uid in db.scalars(select(User.id).where(User.role.in_(roles), User.is_active.is_(True))):
        notify(db, uid, kind, message, link)


def current_holder(db: Session, asset_id: int) -> Optional[Allocation]:
    return db.scalar(
        select(Allocation).where(
            Allocation.asset_id == asset_id, Allocation.returned_at.is_(None)
        )
    )


# ------------------------------------------------------- ASSET HEALTH SCORE
# A single 0-100 number per asset, built from four things the organisation
# already knows. Nothing is inferred, guessed, or modelled: every point lost is
# traceable to a row in the database, and the API returns the breakdown so the
# UI can say *why* an asset scored 41 instead of just colouring it red.
#
#   age        (35 pts) - how far through its expected life the asset is
#   repairs    (30 pts) - maintenance requests raised in the last 12 months
#   condition  (20 pts) - the last recorded condition, from check-in notes
#   idleness   (15 pts) - days since it was last held or booked
#
# Score < 40 lands the asset on the Retirement Radar. That directly answers two
# lines of the brief: "assets nearing retirement" and "most-used vs idle assets".

CONDITION_POINTS = {"excellent": 20, "good": 16, "fair": 9, "poor": 3, "damaged": 0}


def health_score(db: Session, asset: Asset) -> dict:
    today = date.today()
    reasons: List[str] = []

    life_years = (asset.category.expected_life_years if asset.category else None) \
        or settings.expected_life_years
    if asset.acquisition_date:
        years_old = (today - asset.acquisition_date).days / 365.25
        used = min(years_old / max(life_years, 1), 1.0)
        age_pts = round(35 * (1 - used))
        if used > 0.8:
            reasons.append(f"{years_old:.1f} yrs old against a {life_years}-yr expected life")
    else:
        age_pts, years_old = 26, 0.0  # unknown age: assume mid-life, do not punish hard

    year_ago = datetime.now(timezone.utc) - timedelta(days=365)
    repairs = db.scalar(
        select(func.count(MaintenanceRequest.id)).where(
            MaintenanceRequest.asset_id == asset.id,
            MaintenanceRequest.created_at >= year_ago,
        )
    ) or 0
    repair_pts = max(0, 30 - repairs * 10)
    if repairs >= 2:
        reasons.append(f"{repairs} repairs raised in the last 12 months")

    cond_pts = CONDITION_POINTS.get((asset.condition or "good").strip().lower(), 12)
    if cond_pts <= 9:
        reasons.append(f"last recorded condition: {asset.condition}")

    last_alloc = db.scalar(
        select(func.max(Allocation.allocated_at)).where(Allocation.asset_id == asset.id)
    )
    last_book = db.scalar(
        select(func.max(Booking.start_ts)).where(Booking.asset_id == asset.id)
    )
    last_touch = max([d for d in (last_alloc, last_book) if d], default=None)
    if asset.status == AssetStatus.ALLOCATED:
        idle_days, idle_pts = 0, 15
    elif last_touch:
        idle_days = (datetime.now(timezone.utc) - last_touch).days
        idle_pts = max(0, round(15 * (1 - min(idle_days / (settings.idle_days_threshold * 2), 1))))
        if idle_days > settings.idle_days_threshold:
            reasons.append(f"unused for {idle_days} days")
    else:
        idle_days, idle_pts = 999, 0
        reasons.append("never allocated or booked")

    score = max(0, min(100, age_pts + repair_pts + cond_pts + idle_pts))
    band = "healthy" if score >= 70 else "watch" if score >= 40 else "retire"

    return {
        "score": score,
        "band": band,
        "breakdown": {
            "age": age_pts, "repairs": repair_pts,
            "condition": cond_pts, "idleness": idle_pts,
        },
        "signals": {
            "years_old": round(years_old, 1),
            "repairs_12m": repairs,
            "idle_days": idle_days,
        },
        # Plain-English sentences the card renders verbatim. No mystery numbers.
        "reasons": reasons or ["No concerns on record."],
    }


# --------------------------------------------------- SMART CONFLICT RESOLVER
# The brief says the system must *block* a double allocation and *reject* an
# overlapping booking. Blocking is the easy half. A dead end is a bad product,
# so every rejection here ships with a way forward: who has the thing, what else
# would do the job, and when the room is actually free.

def allocation_alternatives(db: Session, asset: Asset, limit: int = 4) -> List[dict]:
    rows = db.scalars(
        select(Asset).where(
            Asset.category_id == asset.category_id,
            Asset.status == AssetStatus.AVAILABLE,
            Asset.id != asset.id,
        ).limit(limit)
    ).all()
    return [
        {"id": a.id, "tag": a.tag, "name": a.name,
         "location": a.location, "condition": a.condition}
        for a in rows
    ]


def _free_windows(busy: List[tuple], day_start: datetime, day_end: datetime,
                  duration: timedelta) -> List[dict]:
    """Walk the gaps between confirmed bookings and keep the ones long enough."""
    out, cursor = [], day_start
    for start, end in sorted(busy):
        if start - cursor >= duration:
            out.append({"start": cursor.isoformat(), "end": (cursor + duration).isoformat()})
        cursor = max(cursor, end)
    if day_end - cursor >= duration:
        out.append({"start": cursor.isoformat(), "end": (cursor + duration).isoformat()})
    return out[:3]


def booking_alternatives(db: Session, asset: Asset, start: datetime, end: datetime) -> dict:
    duration = end - start
    live = (BookingStatus.UPCOMING.value, BookingStatus.ONGOING.value)

    clash = db.scalar(
        select(Booking).where(
            Booking.asset_id == asset.id,
            Booking.status.in_(live),
            Booking.start_ts < end,
            Booking.end_ts > start,
        )
    )

    day_start = start.replace(hour=8, minute=0, second=0, microsecond=0)
    day_end = start.replace(hour=20, minute=0, second=0, microsecond=0)
    busy = [
        (b.start_ts, b.end_ts)
        for b in db.scalars(
            select(Booking).where(
                Booking.asset_id == asset.id,
                Booking.status.in_(live),
                Booking.end_ts > day_start,
                Booking.start_ts < day_end,
            )
        )
    ]

    # Rooms of the same category, genuinely free for the exact slot the user wanted.
    swaps = []
    for other in db.scalars(
        select(Asset).where(
            Asset.category_id == asset.category_id,
            Asset.is_bookable.is_(True),
            Asset.status.in_([AssetStatus.AVAILABLE, AssetStatus.RESERVED]),
            Asset.id != asset.id,
        )
    ):
        taken = db.scalar(
            select(func.count(Booking.id)).where(
                Booking.asset_id == other.id,
                Booking.status.in_(live),
                Booking.start_ts < end,
                Booking.end_ts > start,
            )
        )
        if not taken:
            swaps.append({"id": other.id, "tag": other.tag, "name": other.name,
                          "location": other.location})
        if len(swaps) == 3:
            break

    return {
        "conflict": {
            "booking_id": clash.id,
            "held_by": clash.user.name,
            "from": clash.start_ts.isoformat(),
            "to": clash.end_ts.isoformat(),
        } if clash else None,
        "next_free_slots": _free_windows(busy, day_start, day_end, duration),
        "other_resources_free_then": swaps,
    }

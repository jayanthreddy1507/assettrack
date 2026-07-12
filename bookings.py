from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Asset, AssetStatus, Booking, BookingStatus, Role, User
from ..schemas import BookingIn, BookingOut
from ..security import current_user
from ..services import booking_alternatives, log, notify

router = APIRouter(prefix="/api/bookings", tags=["bookings"])
LIVE = (BookingStatus.UPCOMING.value, BookingStatus.ONGOING.value)


@router.post("", response_model=BookingOut, status_code=201)
def book(body: BookingIn, db: Session = Depends(get_db), user: User = Depends(current_user)):
    """
    Room B2 is held 09:00-10:00.

      09:30-10:30  ->  409. Overlaps.
      10:00-11:00  ->  201. Starts exactly as the other ends.

    Neither outcome is decided by Python. The tstzrange '[)' exclusion constraint
    in db.py decides both, which is why two people clicking Confirm in the same
    millisecond still cannot double-book the room.
    """
    asset = db.get(Asset, body.asset_id)
    if not asset:
        raise HTTPException(404, "Resource not found.")
    if not asset.is_bookable:
        raise HTTPException(422, f"{asset.tag} is not a bookable resource.")
    if asset.status in (AssetStatus.UNDER_MAINTENANCE, AssetStatus.LOST,
                        AssetStatus.RETIRED, AssetStatus.DISPOSED):
        raise HTTPException(409, f"{asset.tag} is {asset.status.value.lower()} right now.")
    if body.start_ts < datetime.now(timezone.utc) - timedelta(minutes=5):
        raise HTTPException(422, "You cannot book a slot in the past.")
    if (body.end_ts - body.start_ts) > timedelta(hours=12):
        raise HTTPException(422, "A single booking cannot run longer than 12 hours.")

    booking = Booking(
        asset_id=asset.id, user_id=user.id, start_ts=body.start_ts,
        end_ts=body.end_ts, purpose=body.purpose, status=BookingStatus.UPCOMING.value,
    )
    db.add(booking)
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        # Rejected — now be useful about it.
        raise HTTPException(409, {
            "reason": "overlap",
            "message": f"{asset.name} is already booked across part of that window.",
            **booking_alternatives(db, asset, body.start_ts, body.end_ts),
        })

    notify(db, user.id, "BOOKING_CONFIRMED",
           f"{asset.name} is yours from {body.start_ts:%d %b %H:%M}.", "/bookings")
    log(db, user, "BOOKING_CREATED", "asset", asset.id,
        f"{asset.tag} {body.start_ts:%d %b %H:%M}-{body.end_ts:%H:%M}")
    db.commit()
    db.refresh(booking)
    return booking


@router.get("", response_model=List[BookingOut])
def list_bookings(asset_id: Optional[int] = None, mine: bool = False,
                  db: Session = Depends(get_db), user: User = Depends(current_user)):
    stmt = select(Booking).order_by(Booking.start_ts)
    if asset_id:
        stmt = stmt.where(Booking.asset_id == asset_id)
    if mine:
        stmt = stmt.where(Booking.user_id == user.id)
    return db.scalars(stmt).all()


@router.get("/availability/{asset_id}")
def availability(asset_id: int, start: datetime, end: datetime,
                 db: Session = Depends(get_db), _: User = Depends(current_user)):
    """Called as the user drags a slot, so the UI can warn *before* they submit."""
    asset = db.get(Asset, asset_id)
    if not asset:
        raise HTTPException(404, "Resource not found.")
    clash = db.scalar(
        select(Booking).where(
            Booking.asset_id == asset_id,
            Booking.status.in_(LIVE),
            Booking.start_ts < end,
            Booking.end_ts > start,
        )
    )
    if not clash:
        return {"free": True}
    return {"free": False, **booking_alternatives(db, asset, start, end)}


@router.post("/{booking_id}/cancel")
def cancel(booking_id: int, db: Session = Depends(get_db), user: User = Depends(current_user)):
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(404, "Booking not found.")
    if booking.user_id != user.id and user.role not in (Role.ADMIN, Role.ASSET_MANAGER):
        raise HTTPException(403, "You can only cancel your own bookings.")
    if booking.status == BookingStatus.COMPLETED.value:
        raise HTTPException(409, "That slot has already finished.")

    booking.status = BookingStatus.CANCELLED.value
    notify(db, booking.user_id, "BOOKING_CANCELLED",
           f"Your booking of {booking.asset.name} was cancelled.", "/bookings")
    log(db, user, "BOOKING_CANCELLED", "booking", booking.id, booking.asset.tag)
    db.commit()
    return {"status": booking.status}


@router.post("/{booking_id}/reschedule", response_model=BookingOut)
def reschedule(booking_id: int, body: BookingIn, db: Session = Depends(get_db),
               user: User = Depends(current_user)):
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(404, "Booking not found.")
    if booking.user_id != user.id and user.role not in (Role.ADMIN, Role.ASSET_MANAGER):
        raise HTTPException(403, "You can only reschedule your own bookings.")

    old_start, old_end = booking.start_ts, booking.end_ts
    booking.start_ts, booking.end_ts = body.start_ts, body.end_ts
    try:
        db.flush()
    except IntegrityError:
        db.rollback()
        booking.start_ts, booking.end_ts = old_start, old_end
        raise HTTPException(409, {
            "reason": "overlap",
            "message": "That new window collides with another booking.",
            **booking_alternatives(db, booking.asset, body.start_ts, body.end_ts),
        })

    log(db, user, "BOOKING_RESCHEDULED", "booking", booking.id, booking.asset.tag)
    db.commit()
    db.refresh(booking)
    return booking

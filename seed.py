"""
Seeds a small but *opinionated* organisation.

This is not random filler. Every row exists so a specific moment in the demo
lands on the first try:

  * AF-0114 sits with Priya, so the double-allocation block can be shown live.
  * Room B2 is held 09:00-10:00 tomorrow, so 09:30-10:30 fails and 10:00-11:00
    passes — the two cases the brief names.
  * A projector is 6 years old with 3 repairs, so the Retirement Radar has
    something red to shout about.
  * One allocation is already 4 days overdue, so the dashboard is not a wall
    of zeroes the moment it loads.

Run:  python seed.py
"""
from datetime import date, datetime, time, timedelta, timezone

from app.db import SessionLocal, init_db
from app.models import (
    Allocation, Asset, AssetStatus, Booking, BookingStatus, Category, Department,
    MaintenanceRequest, MaintenanceStatus, Role, User,
)
from app.security import hash_password

PASSWORD = "Assetflow2026"


def run():
    init_db()
    db = SessionLocal()
    if db.query(User).count():
        print("Database already seeded. Drop it first if you want a clean slate.")
        return

    # -- departments -------------------------------------------------------
    ops = Department(name="Operations")
    it = Department(name="IT")
    facilities = Department(name="Facilities")
    finance = Department(name="Finance")
    db.add_all([ops, it, facilities, finance])
    db.flush()

    # -- people ------------------------------------------------------------
    def person(name, email, role, dept):
        return User(name=name, email=email, password_hash=hash_password(PASSWORD),
                    role=role, department_id=dept.id)

    admin = person("Nandita Rao", "admin@assetflow.io", Role.ADMIN, ops)
    manager = person("Kabir Sheth", "manager@assetflow.io", Role.ASSET_MANAGER, it)
    head = person("Anjali Menon", "head@assetflow.io", Role.DEPT_HEAD, facilities)
    priya = person("Priya Nair", "priya@assetflow.io", Role.EMPLOYEE, it)
    raj = person("Raj Malhotra", "raj@assetflow.io", Role.EMPLOYEE, it)
    dev = person("Devika Iyer", "devika@assetflow.io", Role.EMPLOYEE, finance)
    sam = person("Samuel Fernandes", "samuel@assetflow.io", Role.EMPLOYEE, facilities)
    db.add_all([admin, manager, head, priya, raj, dev, sam])
    db.flush()

    facilities.head_id = head.id

    # -- categories --------------------------------------------------------
    electronics = Category(name="Electronics", prefix="AF", expected_life_years=4,
                           custom_fields=[{"key": "warranty_months",
                                           "label": "Warranty (months)", "type": "number"}])
    furniture = Category(name="Furniture", prefix="FN", expected_life_years=10)
    vehicles = Category(name="Vehicles", prefix="VH", expected_life_years=8,
                        custom_fields=[{"key": "reg_no", "label": "Registration",
                                        "type": "text"}])
    rooms = Category(name="Meeting Rooms", prefix="RM", expected_life_years=25)
    db.add_all([electronics, furniture, vehicles, rooms])
    db.flush()

    # -- assets ------------------------------------------------------------
    def asset(tag, name, cat, **kw):
        return Asset(tag=tag, name=name, category_id=cat.id, **kw)

    today = date.today()
    laptop = asset("AF-0114", "ThinkPad X1 Carbon", electronics,
                   serial_number="TPX1-77213", acquisition_date=today - timedelta(days=400),
                   acquisition_cost=142000, condition="Good", location="IT Store, Level 2",
                   department_id=it.id, custom_values={"warranty_months": 24})
    spare1 = asset("AF-0115", "ThinkPad X1 Carbon", electronics,
                   serial_number="TPX1-77219", acquisition_date=today - timedelta(days=180),
                   acquisition_cost=142000, condition="Excellent",
                   location="IT Store, Level 2", department_id=it.id)
    spare2 = asset("AF-0116", "MacBook Air M3", electronics, serial_number="MBA-90188",
                   acquisition_date=today - timedelta(days=90), acquisition_cost=118000,
                   condition="Excellent", location="IT Store, Level 2", department_id=it.id)
    # The one the Retirement Radar will scream about.
    projector = asset("AF-0031", "Epson EB-2250U Projector", electronics,
                      serial_number="EPS-2250-04",
                      acquisition_date=today - timedelta(days=365 * 6),
                      acquisition_cost=96000, condition="Poor",
                      location="Conference Wing", department_id=facilities.id)
    scanner = asset("AF-0044", "Fujitsu ScanSnap", electronics, serial_number="FJ-SS-3311",
                    acquisition_date=today - timedelta(days=365 * 3),
                    acquisition_cost=32000, condition="Fair", location="Finance Cabin",
                    department_id=finance.id)
    desk = asset("FN-0001", "Standing Desk", furniture, serial_number="SD-4410",
                 acquisition_date=today - timedelta(days=700), acquisition_cost=28000,
                 condition="Good", location="Level 3 Bay A", department_id=ops.id)
    van = asset("VH-0001", "Tata Ace Delivery Van", vehicles, serial_number="MH12AB4410",
                acquisition_date=today - timedelta(days=365 * 4), acquisition_cost=610000,
                condition="Good", location="Basement Parking", department_id=ops.id,
                is_bookable=True, custom_values={"reg_no": "MH12AB4410"})
    room_b2 = asset("RM-0002", "Room B2", rooms, acquisition_date=today - timedelta(days=2000),
                    acquisition_cost=0, condition="Good", location="Level 2",
                    department_id=facilities.id, is_bookable=True)
    room_b3 = asset("RM-0003", "Room B3", rooms, acquisition_date=today - timedelta(days=2000),
                    acquisition_cost=0, condition="Good", location="Level 2",
                    department_id=facilities.id, is_bookable=True)
    auditorium = asset("RM-0009", "Auditorium", rooms,
                       acquisition_date=today - timedelta(days=3000), acquisition_cost=0,
                       condition="Excellent", location="Ground Floor",
                       department_id=facilities.id, is_bookable=True)
    db.add_all([laptop, spare1, spare2, projector, scanner, desk, van,
                room_b2, room_b3, auditorium])
    db.flush()

    # -- allocations -------------------------------------------------------
    # Priya holds AF-0114. This is the row that makes Raj's allocation bounce.
    laptop.status = AssetStatus.ALLOCATED
    db.add(Allocation(asset_id=laptop.id, holder_id=priya.id, allocated_by_id=manager.id,
                      allocated_at=datetime.now(timezone.utc) - timedelta(days=30),
                      expected_return=today + timedelta(days=60)))

    # Overdue by four days: the dashboard's red card.
    scanner.status = AssetStatus.ALLOCATED
    db.add(Allocation(asset_id=scanner.id, holder_id=dev.id, allocated_by_id=manager.id,
                      allocated_at=datetime.now(timezone.utc) - timedelta(days=40),
                      expected_return=today - timedelta(days=4)))

    # A closed loop, so the allocation history table has a returned row in it.
    db.add(Allocation(asset_id=desk.id, holder_id=sam.id, allocated_by_id=manager.id,
                      allocated_at=datetime.now(timezone.utc) - timedelta(days=120),
                      expected_return=today - timedelta(days=20),
                      returned_at=datetime.now(timezone.utc) - timedelta(days=22),
                      checkin_condition="Good", checkin_notes="Returned before the deadline."))

    # -- maintenance history for the projector -----------------------------
    for weeks_ago, issue in [
        (40, "Lamp flickers after twenty minutes of use."),
        (18, "Fan noise, image drifts out of focus."),
        (5, "Will not hold HDMI sync with the podium laptop."),
    ]:
        db.add(MaintenanceRequest(
            asset_id=projector.id, raised_by_id=sam.id, issue=issue, priority="High",
            status=MaintenanceStatus.RESOLVED, approved_by_id=manager.id,
            technician="Zenith Services",
            created_at=datetime.now(timezone.utc) - timedelta(weeks=weeks_ago),
            resolved_at=datetime.now(timezone.utc) - timedelta(weeks=weeks_ago - 1),
            resolution_notes="Serviced and returned.",
        ))

    # A live pending request, so the Asset Manager logs in to something to approve.
    db.add(MaintenanceRequest(
        asset_id=van.id, raised_by_id=sam.id,
        issue="Rear brake pads squealing under load. Needs inspection before the next run.",
        priority="Critical", status=MaintenanceStatus.PENDING,
    ))

    # -- bookings ----------------------------------------------------------
    # Room B2, 09:00-10:00 tomorrow. Try 09:30-10:30 on stage: rejected.
    # Then try 10:00-11:00: accepted. That is the brief's example, live.
    tomorrow = today + timedelta(days=1)
    nine = datetime.combine(tomorrow, time(9, 0), tzinfo=timezone.utc)
    db.add(Booking(asset_id=room_b2.id, user_id=head.id, start_ts=nine,
                   end_ts=nine + timedelta(hours=1), purpose="Facilities stand-up",
                   status=BookingStatus.UPCOMING.value))
    db.add(Booking(asset_id=room_b2.id, user_id=dev.id,
                   start_ts=nine + timedelta(hours=5),
                   end_ts=nine + timedelta(hours=6), purpose="Quarter close review",
                   status=BookingStatus.UPCOMING.value))
    db.add(Booking(asset_id=auditorium.id, user_id=admin.id,
                   start_ts=nine + timedelta(days=1),
                   end_ts=nine + timedelta(days=1, hours=3), purpose="All-hands",
                   status=BookingStatus.UPCOMING.value))
    # Historic bookings so the heatmap is not blank.
    for d in range(1, 15):
        past = datetime.combine(today - timedelta(days=d), time(11, 0), tzinfo=timezone.utc)
        db.add(Booking(asset_id=room_b3.id, user_id=raj.id, start_ts=past,
                       end_ts=past + timedelta(hours=1), purpose="Daily sync",
                       status=BookingStatus.COMPLETED.value))

    db.commit()
    db.close()

    print("Seeded.\n")
    print(f"  Admin          admin@assetflow.io    / {PASSWORD}")
    print(f"  Asset Manager  manager@assetflow.io  / {PASSWORD}")
    print(f"  Dept Head      head@assetflow.io     / {PASSWORD}")
    print(f"  Employee       priya@assetflow.io    / {PASSWORD}   (holds AF-0114)")
    print(f"  Employee       raj@assetflow.io      / {PASSWORD}   (try to take AF-0114)")


if __name__ == "__main__":
    run()

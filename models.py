import enum
from datetime import datetime

from sqlalchemy import (
    Boolean, Column, Date, DateTime, Enum, Float, ForeignKey, Integer,
    JSON, Numeric, String, Text, func,
)
from sqlalchemy.orm import relationship

from .db import Base


class Role(str, enum.Enum):
    ADMIN = "ADMIN"
    ASSET_MANAGER = "ASSET_MANAGER"
    DEPT_HEAD = "DEPT_HEAD"
    EMPLOYEE = "EMPLOYEE"


class AssetStatus(str, enum.Enum):
    AVAILABLE = "AVAILABLE"
    ALLOCATED = "ALLOCATED"
    RESERVED = "RESERVED"
    UNDER_MAINTENANCE = "UNDER_MAINTENANCE"
    LOST = "LOST"
    RETIRED = "RETIRED"
    DISPOSED = "DISPOSED"


class BookingStatus(str, enum.Enum):
    UPCOMING = "UPCOMING"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class MaintenanceStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    TECHNICIAN_ASSIGNED = "TECHNICIAN_ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"


class TransferStatus(str, enum.Enum):
    REQUESTED = "REQUESTED"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    COMPLETED = "COMPLETED"


class AuditResult(str, enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    MISSING = "MISSING"
    DAMAGED = "DAMAGED"


class AuditCycleStatus(str, enum.Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    CLOSED = "CLOSED"


class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True)
    name = Column(String(120), unique=True, nullable=False)
    parent_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    head_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    parent = relationship("Department", remote_side=[id])
    head = relationship("User", foreign_keys=[head_id])


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(120), nullable=False)
    email = Column(String(160), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    # Signup can never write anything but EMPLOYEE here. Promotion happens only
    # through the admin-guarded route in routers/org.py.
    role = Column(Enum(Role), default=Role.EMPLOYEE, nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    department = relationship("Department", foreign_keys=[department_id])


class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True)
    name = Column(String(120), unique=True, nullable=False)
    prefix = Column(String(4), default="AF", nullable=False)
    # e.g. [{"key": "warranty_months", "label": "Warranty (months)", "type": "number"}]
    custom_fields = Column(JSON, default=list)
    expected_life_years = Column(Integer, default=5, nullable=False)


class Asset(Base):
    __tablename__ = "assets"
    id = Column(Integer, primary_key=True)
    tag = Column(String(24), unique=True, nullable=False, index=True)
    name = Column(String(160), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    serial_number = Column(String(120), unique=True, nullable=True, index=True)
    acquisition_date = Column(Date, nullable=True)
    acquisition_cost = Column(Numeric(12, 2), default=0)
    condition = Column(String(40), default="Good")
    location = Column(String(160), nullable=True, index=True)
    photo_url = Column(Text, nullable=True)
    is_bookable = Column(Boolean, default=False, nullable=False)
    status = Column(Enum(AssetStatus), default=AssetStatus.AVAILABLE, nullable=False, index=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    custom_values = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    category = relationship("Category")
    department = relationship("Department")


class Allocation(Base):
    __tablename__ = "allocations"
    id = Column(Integer, primary_key=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False, index=True)
    holder_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    allocated_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    allocated_at = Column(DateTime(timezone=True), server_default=func.now())
    expected_return = Column(Date, nullable=True)
    # NULL here means the allocation is live. The partial unique index in db.py
    # keys off exactly this column.
    returned_at = Column(DateTime(timezone=True), nullable=True)
    checkin_notes = Column(Text, nullable=True)
    checkin_condition = Column(String(40), nullable=True)

    asset = relationship("Asset")
    holder = relationship("User", foreign_keys=[holder_id])


class TransferRequest(Base):
    __tablename__ = "transfer_requests"
    id = Column(Integer, primary_key=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    from_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    to_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    requested_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(Text, nullable=True)
    status = Column(Enum(TransferStatus), default=TransferStatus.REQUESTED, nullable=False)
    decided_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    decided_at = Column(DateTime(timezone=True), nullable=True)

    asset = relationship("Asset")
    to_user = relationship("User", foreign_keys=[to_user_id])
    from_user = relationship("User", foreign_keys=[from_user_id])


class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_ts = Column(DateTime(timezone=True), nullable=False)
    end_ts = Column(DateTime(timezone=True), nullable=False)
    purpose = Column(String(240), nullable=True)
    # Stored as plain text so the Postgres EXCLUDE predicate can read it without
    # a cast. Values mirror BookingStatus.
    status = Column(String(20), default=BookingStatus.UPCOMING.value, nullable=False, index=True)
    reminder_sent = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    asset = relationship("Asset")
    user = relationship("User")


class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"
    id = Column(Integer, primary_key=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False, index=True)
    raised_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    issue = Column(Text, nullable=False)
    priority = Column(String(20), default="Medium")
    photo_url = Column(Text, nullable=True)
    status = Column(Enum(MaintenanceStatus), default=MaintenanceStatus.PENDING, nullable=False)
    approved_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    technician = Column(String(120), nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    asset = relationship("Asset")
    raised_by = relationship("User", foreign_keys=[raised_by_id])


class AuditCycle(Base):
    __tablename__ = "audit_cycles"
    id = Column(Integer, primary_key=True)
    name = Column(String(160), nullable=False)
    scope_department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    scope_location = Column(String(160), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(Enum(AuditCycleStatus), default=AuditCycleStatus.DRAFT, nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    closed_at = Column(DateTime(timezone=True), nullable=True)

    department = relationship("Department")


class AuditAssignment(Base):
    __tablename__ = "audit_assignments"
    id = Column(Integer, primary_key=True)
    cycle_id = Column(Integer, ForeignKey("audit_cycles.id"), nullable=False)
    auditor_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    auditor = relationship("User")


class AuditItem(Base):
    __tablename__ = "audit_items"
    id = Column(Integer, primary_key=True)
    cycle_id = Column(Integer, ForeignKey("audit_cycles.id"), nullable=False, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    result = Column(Enum(AuditResult), default=AuditResult.PENDING, nullable=False)
    notes = Column(Text, nullable=True)
    checked_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    checked_at = Column(DateTime(timezone=True), nullable=True)
    # Snapshot of where the system believed the asset was, so the discrepancy
    # report can show expected-vs-found rather than just a red flag.
    expected_location = Column(String(160), nullable=True)
    expected_holder = Column(String(160), nullable=True)

    asset = relationship("Asset")


class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    kind = Column(String(60), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(200), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    actor_name = Column(String(120), nullable=True)
    action = Column(String(80), nullable=False, index=True)
    entity_type = Column(String(60), nullable=True)
    entity_id = Column(Integer, nullable=True)
    detail = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

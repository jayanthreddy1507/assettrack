from datetime import date, datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from .models import (
    AssetStatus, AuditCycleStatus, AuditResult, MaintenanceStatus, Role, TransferStatus,
)


class ORMModel(BaseModel):
    model_config = {"from_attributes": True}


# ------------------------------------------------------------------ auth
class SignupIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    department_id: Optional[int] = None

    @field_validator("password")
    @classmethod
    def strong_enough(cls, v: str) -> str:
        if v.isalpha() or v.isdigit():
            raise ValueError("Use at least one letter and one number.")
        return v


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(ORMModel):
    id: int
    name: str
    email: EmailStr
    role: Role
    department_id: Optional[int]
    is_active: bool


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ------------------------------------------------------------------ org
class DepartmentIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    parent_id: Optional[int] = None
    head_id: Optional[int] = None
    is_active: bool = True


class DepartmentOut(ORMModel):
    id: int
    name: str
    parent_id: Optional[int]
    head_id: Optional[int]
    is_active: bool


class CategoryIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    prefix: str = Field(default="AF", min_length=2, max_length=4)
    expected_life_years: int = Field(default=5, ge=1, le=30)
    custom_fields: List[Dict[str, Any]] = []


class CategoryOut(ORMModel):
    id: int
    name: str
    prefix: str
    expected_life_years: int
    custom_fields: List[Dict[str, Any]]


class RoleChangeIn(BaseModel):
    role: Role
    department_id: Optional[int] = None

    @field_validator("role")
    @classmethod
    def not_admin(cls, v: Role) -> Role:
        if v == Role.ADMIN:
            raise ValueError("Admin accounts are provisioned, not granted in the app.")
        return v


# ------------------------------------------------------------------ assets
class AssetIn(BaseModel):
    name: str = Field(min_length=2, max_length=160)
    category_id: int
    serial_number: Optional[str] = Field(default=None, max_length=120)
    acquisition_date: Optional[date] = None
    acquisition_cost: float = Field(default=0, ge=0)
    condition: str = "Good"
    location: Optional[str] = None
    photo_url: Optional[str] = None
    is_bookable: bool = False
    department_id: Optional[int] = None
    custom_values: Dict[str, Any] = {}

    @field_validator("acquisition_date")
    @classmethod
    def not_future(cls, v: Optional[date]) -> Optional[date]:
        if v and v > date.today():
            raise ValueError("Acquisition date cannot be in the future.")
        return v


class AssetOut(ORMModel):
    id: int
    tag: str
    name: str
    category_id: int
    serial_number: Optional[str]
    acquisition_date: Optional[date]
    acquisition_cost: float
    condition: Optional[str]
    location: Optional[str]
    photo_url: Optional[str]
    is_bookable: bool
    status: AssetStatus
    department_id: Optional[int]
    custom_values: Dict[str, Any]


# ------------------------------------------------------------------ allocation
class AllocateIn(BaseModel):
    asset_id: int
    holder_id: Optional[int] = None
    department_id: Optional[int] = None
    expected_return: Optional[date] = None

    @field_validator("expected_return")
    @classmethod
    def future_only(cls, v: Optional[date]) -> Optional[date]:
        if v and v < date.today():
            raise ValueError("Expected return date has already passed.")
        return v


class ReturnIn(BaseModel):
    checkin_condition: str = "Good"
    checkin_notes: Optional[str] = None


class TransferIn(BaseModel):
    asset_id: int
    to_user_id: int
    reason: Optional[str] = None


class TransferOut(ORMModel):
    id: int
    asset_id: int
    from_user_id: Optional[int]
    to_user_id: int
    status: TransferStatus
    reason: Optional[str]
    created_at: datetime


# ------------------------------------------------------------------ booking
class BookingIn(BaseModel):
    asset_id: int
    start_ts: datetime
    end_ts: datetime
    purpose: Optional[str] = Field(default=None, max_length=240)

    @field_validator("end_ts")
    @classmethod
    def ordered(cls, v: datetime, info) -> datetime:
        start = info.data.get("start_ts")
        if start and v <= start:
            raise ValueError("The booking must end after it starts.")
        return v


class BookingOut(ORMModel):
    id: int
    asset_id: int
    user_id: int
    start_ts: datetime
    end_ts: datetime
    purpose: Optional[str]
    status: str


# ------------------------------------------------------------------ maintenance
class MaintenanceIn(BaseModel):
    asset_id: int
    issue: str = Field(min_length=5, max_length=2000)
    priority: str = "Medium"
    photo_url: Optional[str] = None

    @field_validator("priority")
    @classmethod
    def known(cls, v: str) -> str:
        if v not in {"Low", "Medium", "High", "Critical"}:
            raise ValueError("Priority must be Low, Medium, High or Critical.")
        return v


class MaintenanceDecision(BaseModel):
    approve: bool
    note: Optional[str] = None


class MaintenanceOut(ORMModel):
    id: int
    asset_id: int
    raised_by_id: int
    issue: str
    priority: str
    status: MaintenanceStatus
    technician: Optional[str]
    created_at: datetime


# ------------------------------------------------------------------ audit
class AuditCycleIn(BaseModel):
    name: str = Field(min_length=3, max_length=160)
    scope_department_id: Optional[int] = None
    scope_location: Optional[str] = None
    start_date: date
    end_date: date
    auditor_ids: List[int] = Field(min_length=1)

    @field_validator("end_date")
    @classmethod
    def after_start(cls, v: date, info) -> date:
        start = info.data.get("start_date")
        if start and v < start:
            raise ValueError("The cycle cannot end before it begins.")
        return v


class AuditMarkIn(BaseModel):
    result: AuditResult
    notes: Optional[str] = None


class AuditCycleOut(ORMModel):
    id: int
    name: str
    start_date: date
    end_date: date
    status: AuditCycleStatus

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Category, Department, Role, User
from ..schemas import (
    CategoryIn, CategoryOut, DepartmentIn, DepartmentOut, RoleChangeIn, UserOut,
)
from ..security import current_user, require
from ..services import log, notify

router = APIRouter(prefix="/api/org", tags=["organization"])
admin_only = require(Role.ADMIN)


# ------------------------------------------------------------- Tab A: departments
@router.get("/departments", response_model=List[DepartmentOut])
def list_departments(db: Session = Depends(get_db), _: User = Depends(current_user)):
    return db.scalars(select(Department).order_by(Department.name)).all()


@router.post("/departments", response_model=DepartmentOut, status_code=201)
def create_department(body: DepartmentIn, db: Session = Depends(get_db),
                      admin: User = Depends(admin_only)):
    if db.scalar(select(Department).where(Department.name == body.name)):
        raise HTTPException(409, "A department with that name already exists.")
    dept = Department(**body.model_dump())
    db.add(dept)
    db.flush()
    log(db, admin, "DEPT_CREATED", "department", dept.id, dept.name)
    db.commit()
    db.refresh(dept)
    return dept


@router.put("/departments/{dept_id}", response_model=DepartmentOut)
def update_department(dept_id: int, body: DepartmentIn, db: Session = Depends(get_db),
                      admin: User = Depends(admin_only)):
    dept = db.get(Department, dept_id)
    if not dept:
        raise HTTPException(404, "Department not found.")
    if body.parent_id == dept_id:
        raise HTTPException(422, "A department cannot be its own parent.")
    # Walk the chain upward to stop A -> B -> A cycles before they are saved.
    seen, cursor = {dept_id}, body.parent_id
    while cursor:
        if cursor in seen:
            raise HTTPException(422, "That parent would create a circular hierarchy.")
        seen.add(cursor)
        parent = db.get(Department, cursor)
        cursor = parent.parent_id if parent else None

    for k, v in body.model_dump().items():
        setattr(dept, k, v)
    if dept.head_id:
        head = db.get(User, dept.head_id)
        if head and head.role == Role.EMPLOYEE:
            head.role = Role.DEPT_HEAD
            notify(db, head.id, "ROLE_CHANGED",
                   f"You now lead {dept.name}.", "/directory")
    log(db, admin, "DEPT_UPDATED", "department", dept.id, dept.name)
    db.commit()
    db.refresh(dept)
    return dept


# ------------------------------------------------------------- Tab B: categories
@router.get("/categories", response_model=List[CategoryOut])
def list_categories(db: Session = Depends(get_db), _: User = Depends(current_user)):
    return db.scalars(select(Category).order_by(Category.name)).all()


@router.post("/categories", response_model=CategoryOut, status_code=201)
def create_category(body: CategoryIn, db: Session = Depends(get_db),
                    admin: User = Depends(admin_only)):
    if db.scalar(select(Category).where(Category.name == body.name)):
        raise HTTPException(409, "That category already exists.")
    cat = Category(**body.model_dump())
    cat.prefix = cat.prefix.upper()
    db.add(cat)
    db.flush()
    log(db, admin, "CATEGORY_CREATED", "category", cat.id, cat.name)
    db.commit()
    db.refresh(cat)
    return cat


@router.put("/categories/{cat_id}", response_model=CategoryOut)
def update_category(cat_id: int, body: CategoryIn, db: Session = Depends(get_db),
                    admin: User = Depends(admin_only)):
    cat = db.get(Category, cat_id)
    if not cat:
        raise HTTPException(404, "Category not found.")
    for k, v in body.model_dump().items():
        setattr(cat, k, v)
    log(db, admin, "CATEGORY_UPDATED", "category", cat.id, cat.name)
    db.commit()
    db.refresh(cat)
    return cat


# ------------------------------------------------------- Tab C: employee directory
@router.get("/employees", response_model=List[UserOut])
def directory(q: Optional[str] = None, department_id: Optional[int] = None,
              db: Session = Depends(get_db), _: User = Depends(current_user)):
    stmt = select(User).order_by(User.name)
    if q:
        stmt = stmt.where(User.name.ilike(f"%{q}%") | User.email.ilike(f"%{q}%"))
    if department_id:
        stmt = stmt.where(User.department_id == department_id)
    return db.scalars(stmt).all()


@router.patch("/employees/{user_id}/role", response_model=UserOut)
def change_role(user_id: int, body: RoleChangeIn, db: Session = Depends(get_db),
                admin: User = Depends(admin_only)):
    """
    The only route in the entire API that writes User.role.

    It is admin-guarded, it refuses to mint another ADMIN (see RoleChangeIn),
    and it writes an activity-log row every time. Ctrl-F the codebase for
    `.role =` and this function and the DEPT_HEAD promotion above are all you
    will find.
    """
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(404, "Employee not found.")
    if target.id == admin.id:
        raise HTTPException(422, "You cannot change your own role.")
    if target.role == Role.ADMIN:
        raise HTTPException(422, "Admin accounts cannot be demoted from the directory.")

    before = target.role.value
    target.role = body.role
    if body.department_id is not None:
        target.department_id = body.department_id

    notify(db, target.id, "ROLE_CHANGED",
           f"Your role is now {body.role.value.replace('_', ' ').title()}.", "/dashboard")
    log(db, admin, "ROLE_CHANGED", "user", target.id, f"{before} -> {body.role.value}")
    db.commit()
    db.refresh(target)
    return target


@router.patch("/employees/{user_id}/status", response_model=UserOut)
def toggle_status(user_id: int, active: bool, db: Session = Depends(get_db),
                  admin: User = Depends(admin_only)):
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(404, "Employee not found.")
    if target.id == admin.id:
        raise HTTPException(422, "You cannot deactivate your own account.")
    target.is_active = active
    log(db, admin, "USER_STATUS", "user", target.id,
        "activated" if active else "deactivated")
    db.commit()
    db.refresh(target)
    return target

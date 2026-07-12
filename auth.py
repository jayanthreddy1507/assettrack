from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Role, User
from ..schemas import LoginIn, SignupIn, TokenOut, UserOut
from ..security import current_user, hash_password, make_token, verify_password
from ..services import log

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def signup(body: SignupIn, db: Session = Depends(get_db)):
    """
    Note what this endpoint does NOT accept: a role.

    SignupIn has no role field, so there is no request body a user can craft that
    reaches the role column. Everyone who signs up is an EMPLOYEE. The only path
    to Department Head or Asset Manager is an admin acting in the Employee
    Directory, which is exactly what the brief demands.
    """
    if db.scalar(select(User).where(User.email == body.email.lower())):
        raise HTTPException(status.HTTP_409_CONFLICT, "That email is already registered.")

    user = User(
        name=body.name.strip(),
        email=body.email.lower(),
        password_hash=hash_password(body.password),
        role=Role.EMPLOYEE,
        department_id=body.department_id,
    )
    db.add(user)
    db.flush()
    log(db, user, "SIGNUP", "user", user.id, f"{user.email} joined as Employee")
    db.commit()
    db.refresh(user)
    return TokenOut(access_token=make_token(user), user=UserOut.model_validate(user))


@router.post("/login", response_model=TokenOut)
def login(body: LoginIn, db: Session = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == body.email.lower()))
    # One message for both branches: a wrong email and a wrong password are
    # indistinguishable to an attacker enumerating accounts.
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Email or password is incorrect.")
    if not user.is_active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This account has been deactivated.")
    return TokenOut(access_token=make_token(user), user=UserOut.model_validate(user))


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(current_user)):
    return user

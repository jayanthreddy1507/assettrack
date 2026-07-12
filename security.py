from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from .config import settings
from .db import get_db
from .models import Role, User

oauth2 = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


# bcrypt is called directly rather than through passlib. passlib 1.7.4 reads a
# private attribute that bcrypt >= 4.1 removed, and the resulting crash only
# shows up the first time anyone hashes a password. Two lines of bcrypt has no
# such trap. The 72-byte cap is bcrypt's own, so the input is clipped here.
def hash_password(raw: str) -> str:
    return bcrypt.hashpw(raw.encode()[:72], bcrypt.gensalt()).decode()


def verify_password(raw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(raw.encode()[:72], hashed.encode())
    except ValueError:
        return False


def make_token(user: User) -> str:
    payload = {
        "sub": str(user.id),
        "role": user.role.value,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def current_user(token: str = Depends(oauth2), db: Session = Depends(get_db)) -> User:
    bad = HTTPException(status.HTTP_401_UNAUTHORIZED, "Session expired. Sign in again.")
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise bad

    user = db.get(User, user_id)
    if not user or not user.is_active:
        raise bad
    # The role is re-read from the database on every request. A token minted
    # before a promotion or demotion cannot outlive the change.
    return user


def require(*roles: Role):
    """Route guard. `Depends(require(Role.ADMIN))` and nothing else gets through."""

    def guard(user: User = Depends(current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                f"This action needs one of: {', '.join(r.value for r in roles)}.",
            )
        return user

    return guard

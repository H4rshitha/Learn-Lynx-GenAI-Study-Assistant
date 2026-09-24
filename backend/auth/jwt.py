import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple
import jwt
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from backend.utils.config import settings
from backend.models.session import UserSession
from backend.models.user import User

def create_access_token(user_id: int, expires_delta: Optional[timedelta] = None) -> Tuple[str, int]:
    """
    Generate a signed JWT access token.
    Returns (token_string, expires_in_seconds).
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    expires_in_seconds = int((expire - now).total_seconds())

    payload: Dict[str, Any] = {
        "sub": str(user_id),
        "type": "access",
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "jti": str(uuid.uuid4()),
    }

    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token, expires_in_seconds

def create_refresh_token(user_id: int, expires_delta: Optional[timedelta] = None) -> Tuple[str, datetime]:
    """
    Generate a signed JWT refresh token.
    Returns (token_string, expires_at_datetime).
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    payload: Dict[str, Any] = {
        "sub": str(user_id),
        "type": "refresh",
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "jti": str(uuid.uuid4()),
    }

    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token, expire

def decode_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate a JWT signature and expiration.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={"verify_exp": True, "verify_iat": True}
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please login again or refresh your session.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or malformed authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

def create_user_session(
    db: Session,
    user_id: int,
    user_agent: Optional[str] = None,
    ip_address: Optional[str] = None
) -> Tuple[str, str, int]:
    """
    Creates an access token + refresh token pair and registers the session in the database.
    Returns (access_token, refresh_token, expires_in_seconds).
    """
    access_token, expires_in = create_access_token(user_id)
    refresh_token, refresh_expires_at = create_refresh_token(user_id)

    # Persist session
    session = UserSession(
        user_id=user_id,
        refresh_token=refresh_token,
        user_agent=user_agent,
        ip_address=ip_address,
        is_revoked=False,
        expires_at=refresh_expires_at.replace(tzinfo=None)
    )
    db.add(session)
    db.commit()

    return access_token, refresh_token, expires_in

def rotate_refresh_token(
    db: Session,
    old_refresh_token: str,
    user_agent: Optional[str] = None,
    ip_address: Optional[str] = None
) -> Tuple[str, str, int, User]:
    """
    Validates the refresh token, revokes the old session, issues a new access token
    and rotated refresh token (prevents token replay attacks).
    """
    # 1. Decode JWT payload
    payload = decode_token(old_refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type for refresh endpoint."
        )

    user_id = int(payload.get("sub"))

    # 2. Check if refresh token exists and is active in database
    session = db.query(UserSession).filter(
        UserSession.refresh_token == old_refresh_token
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session not found or invalid."
        )

    if session.is_revoked:
        # Potential replay attack detected! Invalidate all sessions for this user for security
        db.query(UserSession).filter(UserSession.user_id == user_id).update({"is_revoked": True})
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Revoked refresh token re-used. All active sessions have been terminated for security."
        )

    if session.expires_at < datetime.utcnow():
        session.is_revoked = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token session has expired."
        )

    # 3. Retrieve User
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive or no longer exists."
        )

    # 4. Revoke old refresh token session
    session.is_revoked = True

    # 5. Issue new token pair
    new_access_token, expires_in = create_access_token(user.id)
    new_refresh_token, new_expires_at = create_refresh_token(user.id)

    new_session = UserSession(
        user_id=user.id,
        refresh_token=new_refresh_token,
        user_agent=user_agent or session.user_agent,
        ip_address=ip_address or session.ip_address,
        is_revoked=False,
        expires_at=new_expires_at.replace(tzinfo=None)
    )
    db.add(new_session)
    db.commit()

    return new_access_token, new_refresh_token, expires_in, user

def revoke_session(db: Session, refresh_token: str) -> bool:
    """Revoke an active refresh token session on logout."""
    session = db.query(UserSession).filter(UserSession.refresh_token == refresh_token).first()
    if session:
        session.is_revoked = True
        db.commit()
        return True
    return False

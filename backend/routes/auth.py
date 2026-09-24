from datetime import timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models.user import User
from backend.schemas.auth import (
    UserCreate,
    UserLogin,
    UserOut,
    UserStats,
    TokenResponse,
    RefreshTokenRequest,
    LogoutRequest,
    UserUpdate,
)
from backend.utils.security import verify_password, get_password_hash
from backend.auth.jwt import create_user_session, rotate_refresh_token, revoke_session
from backend.auth.dependencies import get_current_active_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(
    user_in: UserCreate,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Register a new student account and issue initial access + refresh tokens.
    """
    # Check if user with this email already exists
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Hash password
    hashed_pwd = get_password_hash(user_in.password)

    # Create User record
    new_user = User(
        email=user_in.email.lower(),
        hashed_password=hashed_pwd,
        full_name=user_in.get_full_name(),
        college=user_in.college,
        department=user_in.department or "Computer Science & Engineering",
        semester=user_in.semester or "6th Semester",
        avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
        role="Student",
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Extract client IP and user-agent
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    # Issue JWT tokens and register session
    access_token, refresh_token, expires_in = create_user_session(
        db, new_user.id, user_agent=user_agent, ip_address=client_ip
    )

    user_out = UserOut.model_validate(new_user)
    user_out.name = new_user.full_name
    user_out.stats = UserStats()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=expires_in,
        user=user_out
    )

@router.post("/login", response_model=TokenResponse)
def login(
    credentials: UserLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Authenticate with email and password, issuing access + refresh token pair.
    """
    user = db.query(User).filter(User.email == credentials.email.lower()).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support."
        )

    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    access_token, refresh_token, expires_in = create_user_session(
        db, user.id, user_agent=user_agent, ip_address=client_ip
    )

    user_out = UserOut.model_validate(user)
    user_out.name = user.full_name
    user_out.stats = UserStats()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=expires_in,
        user=user_out
    )

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    refresh_data: RefreshTokenRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Perform refresh token rotation: validates refresh token, revokes old session,
    and returns a new access token and rotated refresh token.
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    new_access_token, new_refresh_token, expires_in, user = rotate_refresh_token(
        db=db,
        old_refresh_token=refresh_data.refresh_token,
        user_agent=user_agent,
        ip_address=client_ip
    )

    user_out = UserOut.model_validate(user)
    user_out.name = user.full_name
    user_out.stats = UserStats()

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=expires_in,
        user=user_out
    )

@router.post("/logout")
def logout(
    logout_data: LogoutRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Invalidate active session and revoke the user's refresh token.
    """
    if logout_data.refresh_token:
        revoke_session(db, logout_data.refresh_token)

    return {"message": "Successfully logged out and session revoked."}

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_active_user)):
    """
    Retrieve current authenticated student profile and stats.
    """
    user_out = UserOut.model_validate(current_user)
    user_out.name = current_user.full_name
    user_out.stats = UserStats()
    return user_out

@router.put("/me", response_model=UserOut)
def update_me(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update student profile details.
    """
    name_to_update = update_data.full_name or update_data.name
    if name_to_update:
        current_user.full_name = name_to_update
    if update_data.college is not None:
        current_user.college = update_data.college
    if update_data.department is not None:
        current_user.department = update_data.department
    if update_data.semester is not None:
        current_user.semester = update_data.semester
    if update_data.avatar is not None:
        current_user.avatar = update_data.avatar

    db.commit()
    db.refresh(current_user)

    user_out = UserOut.model_validate(current_user)
    user_out.name = current_user.full_name
    user_out.stats = UserStats()
    return user_out

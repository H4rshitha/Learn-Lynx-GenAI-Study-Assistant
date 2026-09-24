from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=150)
    college: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[str] = None
    avatar: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=72)
    fullName: Optional[str] = None
    full_name: Optional[str] = None
    college: Optional[str] = None
    department: Optional[str] = "Computer Science & Engineering"
    semester: Optional[str] = "6th Semester"

    def get_full_name(self) -> str:
        return self.fullName or self.full_name or self.email.split("@")[0]

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    rememberMe: Optional[bool] = True

class UserStats(BaseModel):
    uploadedDocs: int = 12
    totalQueries: int = 348
    quizAccuracy: float = 88.5
    studyHours: float = 42.5
    streakDays: int = 7
    aiConfidenceAvg: float = 94.2

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    name: Optional[str] = None
    college: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[str] = None
    avatar: Optional[str] = None
    role: str = "Student"
    is_active: bool = True
    created_at: datetime
    stats: Optional[UserStats] = None

    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserOut

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = None

class TokenPayload(BaseModel):
    sub: str
    type: str  # "access" or "refresh"
    exp: int
    iat: int
    jti: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    name: Optional[str] = None
    college: Optional[str] = None
    department: Optional[str] = None
    semester: Optional[str] = None
    avatar: Optional[str] = None

from passlib.context import CryptContext
import bcrypt

# Setup password hashing context using bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the stored bcrypt hash."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Fallback to direct bcrypt verify if needed
        try:
            return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
        except Exception:
            return False

def get_password_hash(password: str) -> str:
    """Generate bcrypt hash from plain password."""
    # Ensure password length is under bcrypt 72-byte truncation limit safely
    if len(password.encode('utf-8')) > 72:
        password = password[:72]
    return pwd_context.hash(password)

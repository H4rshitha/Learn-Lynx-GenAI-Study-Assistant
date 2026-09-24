from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.utils.config import settings

# Configure SQLite thread check if using SQLite
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=settings.DEBUG
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    """Dependency for obtaining a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize all database tables."""
    import backend.models  # Ensure models are imported before create_all
    Base.metadata.create_all(bind=engine)

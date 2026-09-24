from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, Float, ForeignKey
from sqlalchemy.orm import relationship
from backend.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(100), primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=True)
    title = Column(String(255), nullable=False, index=True)
    category = Column(String(100), nullable=False, default="Computer Science", index=True)
    file_size = Column(String(50), default="1.5 MB")
    pages_count = Column(Integer, default=1)
    chunks_count = Column(Integer, default=0)
    embeddings_count = Column(Integer, default=0)
    status = Column(String(50), default="Indexed", index=True)  # Indexed, Processing, Ready, Error
    embedding_model = Column(String(100), default="text-embedding-004")
    tags = Column(JSON, default=list)
    summary = Column(Text, nullable=True)
    file_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="documents")

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "category": self.category,
            "file_size": self.file_size,
            "pages_count": self.pages_count,
            "chunks_count": self.chunks_count,
            "embeddings_count": self.embeddings_count,
            "status": self.status,
            "embedding_model": self.embedding_model,
            "tags": self.tags or [],
            "summary": self.summary or "",
            "uploaded_at": self.created_at.strftime("%Y-%m-%d") if self.created_at else "2026-03-24",
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

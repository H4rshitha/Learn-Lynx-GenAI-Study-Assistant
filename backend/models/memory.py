from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False, default="New AI Study Session")
    doc_source = Column(String(255), nullable=True, default="All Documents")
    is_pinned = Column(Boolean, default=False, index=True)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    messages = relationship("ConversationMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="ConversationMessage.created_at")
    user = relationship("User", backref="conversations")

    def __repr__(self):
        return f"<Conversation(id={self.id}, session_id='{self.session_id}', title='{self.title}', is_pinned={self.is_pinned})>"

class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), nullable=False)  # "user" | "assistant" | "system"
    content = Column(Text, nullable=False)
    confidence = Column(Float, nullable=True)
    citations_json = Column(JSON, nullable=True)  # List of citations
    critic_feedback_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")

    def __repr__(self):
        return f"<ConversationMessage(id={self.id}, role='{self.role}', conv_id={self.conversation_id})>"

class MemoryEmbedding(Base):
    __tablename__ = "memory_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id = Column(String(100), nullable=False, index=True)
    content_summary = Column(Text, nullable=False)
    topic = Column(String(150), nullable=True, index=True)
    key_concepts = Column(JSON, nullable=True)  # list of strings
    chroma_vector_id = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<MemoryEmbedding(id={self.id}, topic='{self.topic}', session_id='{self.session_id}')>"

class QuizHistory(Base):
    __tablename__ = "quiz_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    topic = Column(String(200), nullable=False, index=True)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    accuracy = Column(Float, nullable=False)
    difficulty = Column(String(50), default="Medium")
    weak_concepts_json = Column(JSON, nullable=True)  # list of weak concepts from wrong answers
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<QuizHistory(id={self.id}, topic='{self.topic}', score={self.score}/{self.total_questions}, accuracy={self.accuracy}%)>"

class StudyPreference(Base):
    __tablename__ = "study_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    weak_topics_json = Column(JSON, default=list)  # list of identified weak topics
    mastered_topics_json = Column(JSON, default=list)  # list of mastered topics
    preferred_persona = Column(String(100), default="Socratic Academic Tutor")
    preferred_model = Column(String(100), default="Gemini 1.5 Pro (RAG Enhanced)")
    target_weekly_hours = Column(Float, default=40.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<StudyPreference(user_id={self.user_id}, weak_topics_count={len(self.weak_topics_json or [])})>"

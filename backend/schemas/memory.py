from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class MessageItem(BaseModel):
    role: str
    content: str
    confidence: Optional[float] = None
    citations: Optional[List[Dict[str, Any]]] = None
    critic_feedback: Optional[Dict[str, Any]] = None

class SaveMemoryRequest(BaseModel):
    session_id: str
    title: Optional[str] = None
    doc_source: Optional[str] = "All Documents"
    user_message: str
    assistant_message: str
    confidence: Optional[float] = 95.0
    citations: Optional[List[Dict[str, Any]]] = None
    critic_feedback: Optional[Dict[str, Any]] = None
    is_pinned: Optional[bool] = False

class ConversationMessageOut(BaseModel):
    id: int
    role: str
    content: str
    confidence: Optional[float] = None
    citations_json: Optional[List[Dict[str, Any]]] = None
    critic_feedback_json: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationOut(BaseModel):
    id: int
    session_id: str
    title: str
    doc_source: Optional[str] = None
    is_pinned: bool = False
    summary: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    messages_count: int = 0
    last_message_preview: Optional[str] = None
    messages: Optional[List[ConversationMessageOut]] = None

    model_config = ConfigDict(from_attributes=True)

class PinConversationRequest(BaseModel):
    session_id: str
    is_pinned: bool

class DeleteSessionRequest(BaseModel):
    session_id: str

class QuizRecordRequest(BaseModel):
    topic: str
    score: int
    total_questions: int
    accuracy: float
    difficulty: Optional[str] = "Medium"
    weak_concepts: Optional[List[str]] = None

class QuizHistoryOut(BaseModel):
    id: int
    topic: str
    score: int
    total_questions: int
    accuracy: float
    difficulty: str
    weak_concepts_json: Optional[List[str]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class RecommendationItem(BaseModel):
    topic: str
    reason: str
    action_type: str  # "quiz_drill" | "ai_deep_dive" | "review_notes"
    suggested_action: str

class PersonalizedRecommendationOut(BaseModel):
    weak_topics: List[str]
    mastered_topics: List[str]
    recommendations: List[RecommendationItem]
    study_streak_days: int
    target_weekly_hours: float
    coach_summary: str

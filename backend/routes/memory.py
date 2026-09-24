from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.auth.dependencies import get_current_user
from backend.models.user import User
from backend.schemas.memory import (
    SaveMemoryRequest,
    ConversationOut,
    PinConversationRequest,
    DeleteSessionRequest,
    QuizRecordRequest,
    QuizHistoryOut,
    PersonalizedRecommendationOut,
)
from backend.memory.service import memory_service

router = APIRouter(prefix="/memory", tags=["Persistent AI Memory"])

@router.get("/history", response_model=List[ConversationOut])
def get_history(
    session_id: Optional[str] = Query(None, description="Fetch specific conversation by session_id"),
    search: Optional[str] = Query(None, description="Search conversations by keywords"),
    pinned_only: bool = Query(False, description="Filter only pinned conversations"),
    limit: int = Query(50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves stored conversation history with search, pinning, and message breakdown.
    """
    return memory_service.get_conversation_history(
        db=db,
        user_id=current_user.id,
        session_id=session_id,
        search_query=search,
        pinned_only=pinned_only,
        limit=limit,
    )

@router.post("/save", response_model=ConversationOut)
def save_memory(
    data: SaveMemoryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Persists a multi-turn conversation exchange into long-term SQL and semantic memory.
    """
    conv = memory_service.save_conversation_turn(db, current_user.id, data)
    history = memory_service.get_conversation_history(db, current_user.id, session_id=conv.session_id)
    return history[0]

@router.post("/pin")
def pin_conversation(
    data: PinConversationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Pins or unpins a conversation session to keep it at the top of the sidebar.
    """
    success = memory_service.toggle_pin(db, current_user.id, data.session_id, data.is_pinned)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation session not found."
        )
    return {"message": f"Conversation '{data.session_id}' pin state updated to {data.is_pinned}."}

@router.delete("/session")
def delete_session(
    data: DeleteSessionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Permanently removes a conversation thread and its messages from memory.
    """
    success = memory_service.delete_session(db, current_user.id, data.session_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found."
        )
    return {"message": f"Session '{data.session_id}' deleted successfully."}

@router.post("/quiz-result", response_model=QuizHistoryOut)
def record_quiz(
    data: QuizRecordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Logs quiz performance and automatically updates the student's weak/mastered concepts.
    """
    quiz_rec = memory_service.record_quiz_performance(db, current_user.id, data)
    return quiz_rec

@router.get("/recommendations", response_model=PersonalizedRecommendationOut)
def get_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Generates personalized study recommendations based on persistent memory of weak topics and quiz history.
    """
    return memory_service.get_personalized_recommendations(db, current_user.id)

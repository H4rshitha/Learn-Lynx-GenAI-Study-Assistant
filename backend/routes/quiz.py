from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.auth.dependencies import get_current_active_user, get_optional_current_user
from backend.models.user import User

from backend.schemas.quiz import (
    QuizStartRequest,
    QuizStartResponse,
    QuizSubmitRequest,
    QuizSubmitResponse,
    QuizHistoryItem,
    QuizAnalyticsResponse,
)
from backend.quiz.service import quiz_service

router = APIRouter(prefix="/quiz", tags=["AI Quiz Studio"])

@router.post("/start", response_model=QuizStartResponse)
def start_quiz(
    request: QuizStartRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Initializes a new AI Quiz Studio session with questions generated using
    RAG-grounded syllabus notes and course materials. Supports MCQ, True/False, and Short Answer formats.
    """
    user_id = current_user.id if current_user else None
    return quiz_service.start_quiz(request, user_id=user_id)

@router.post("/submit", response_model=QuizSubmitResponse)
def submit_quiz(
    request: QuizSubmitRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Submits user answers for instant AI grading. Calculates accuracy, provides
    grounded explanations, updates weak topic memory, and yields revision suggestions.
    """
    user_id = current_user.id if current_user else 1
    return quiz_service.submit_quiz(db, user_id=user_id, request=request)

@router.get("/history", response_model=List[QuizHistoryItem])
def get_quiz_history(
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Retrieves chronological quiz attempts, scores, accuracy, and detected weak concepts for the logged-in student.
    """
    user_id = current_user.id if current_user else 1
    return quiz_service.get_history(db, user_id=user_id, limit=limit)

@router.get("/analytics", response_model=QuizAnalyticsResponse)
def get_quiz_analytics(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Fetches aggregate quiz metrics, topic mastery distribution, weak topic alerts,
    smart revision recommendations, and live leaderboard rankings.
    """
    user_id = current_user.id if current_user else 1
    return quiz_service.get_analytics(db, user_id=user_id)

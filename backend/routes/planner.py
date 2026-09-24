from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.auth.dependencies import get_optional_current_user
from backend.models.user import User

from backend.schemas.planner import (
    PlannerGenerateRequest,
    PlannerAdaptRequest,
    TaskToggleRequest,
    StudyPlanResponse,
)
from backend.planner.service import planner_service

router = APIRouter(prefix="/planner", tags=["AI Study Planner Agent"])

@router.post("/generate", response_model=StudyPlanResponse)
def generate_study_plan(
    request: PlannerGenerateRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Synthesizes an intelligent multi-week exam preparation plan using LangGraph Planner Agent.
    Generates daily checklist tasks, spaced repetition revision intervals, and Pomodoro blocks.
    """
    user_id = current_user.id if current_user else 1
    return planner_service.generate_plan(db, user_id=user_id, request=request)

@router.post("/adapt", response_model=StudyPlanResponse)
def adapt_study_plan(
    request: PlannerAdaptRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Dynamically adjusts the student's study plan in response to recent quiz performance
    and detected weak topics.
    """
    user_id = current_user.id if current_user else 1
    return planner_service.adapt_plan(db, user_id=user_id, request=request)

@router.post("/toggle-task", response_model=StudyPlanResponse)
def toggle_task_status(
    request: TaskToggleRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Marks a study task as completed or incomplete and recalculates completion metrics in real time.
    """
    user_id = current_user.id if current_user else 1
    return planner_service.toggle_task(user_id=user_id, task_id=request.task_id, completed=request.completed)

@router.get("/current", response_model=StudyPlanResponse)
def get_current_plan(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Retrieves the student's currently active study plan and progress state.
    """
    user_id = current_user.id if current_user else 1
    return planner_service.get_current_plan(db, user_id=user_id)

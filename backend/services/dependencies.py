from fastapi import Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.rag.pipeline import hybrid_rag_engine, HybridRAGEngine
from backend.memory.service import PersistentMemoryService, memory_service
from backend.quiz.service import QuizService
from backend.planner.service import PlannerService, planner_service
from backend.evaluation.service import EvaluationService, eval_service
from backend.guardrails.service import GuardrailsService, guardrails_service
from backend.analytics.service import AnalyticsService


def get_memory_service(db: Session = Depends(get_db)) -> PersistentMemoryService:
    """Dependency Provider for MemoryService"""
    return memory_service


def get_quiz_service(db: Session = Depends(get_db)) -> QuizService:
    """Dependency Provider for QuizService"""
    return QuizService(db)


def get_planner_service(db: Session = Depends(get_db)) -> PlannerService:
    """Dependency Provider for PlannerService"""
    return planner_service


def get_evaluation_service(db: Session = Depends(get_db)) -> EvaluationService:
    """Dependency Provider for EvaluationService"""
    return eval_service


def get_guardrails_service(db: Session = Depends(get_db)) -> GuardrailsService:
    """Dependency Provider for GuardrailsService"""
    return guardrails_service


def get_analytics_service(db: Session = Depends(get_db)) -> AnalyticsService:
    """Dependency Provider for AnalyticsService"""
    return AnalyticsService(db)


def get_rag_engine() -> HybridRAGEngine:
    """Dependency Provider for HybridRAGEngine"""
    return hybrid_rag_engine

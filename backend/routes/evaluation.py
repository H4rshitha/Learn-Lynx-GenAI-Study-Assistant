from typing import List, Optional
from fastapi import APIRouter, HTTPException, status

from backend.schemas.evaluation import (
    EvaluationRunRequest,
    EvaluationRunResponse,
    EvaluationHistoryItem,
)
from backend.evaluation.service import evaluation_service

router = APIRouter(prefix="/evaluation", tags=["Enterprise LLM Evaluation Dashboard"])

@router.post("/run", response_model=EvaluationRunResponse)
def run_llm_evaluation(request: EvaluationRunRequest):
    """
    Executes an enterprise LLM evaluation run on a benchmark query.
    Evaluates Context Relevance, Answer Relevance, Faithfulness, Hallucination Risk,
    Retrieval Quality, Latency, Token Usage, and returns comparative baseline analysis.
    """
    return evaluation_service.run_evaluation(request)

@router.get("/history", response_model=List[EvaluationHistoryItem])
def get_evaluation_history(limit: int = 25):
    """
    Retrieves chronological audit log of all evaluation benchmark runs with metric grades.
    """
    return evaluation_service.get_history(limit=limit)

@router.get("/query/{id}", response_model=EvaluationRunResponse)
def get_evaluation_by_id(id: str):
    """
    Fetches full evaluation trace, judge critique, citations, and comparative metrics for a specific evaluation ID.
    """
    res = evaluation_service.get_query_evaluation(id)
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Evaluation run with ID '{id}' not found."
        )
    return res

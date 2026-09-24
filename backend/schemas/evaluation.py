from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class EvaluationRunRequest(BaseModel):
    query: str = Field(default="Explain the critical section problem and Peterson's algorithm invariants.", description="Evaluation benchmark query")
    document_id: Optional[str] = Field(default=None, description="Optional document filter")
    custom_context: Optional[str] = Field(default=None, description="Optional manual context passage")
    model_name: str = Field(default="Gemini 1.5 Pro (Hybrid RAG + LangGraph)", description="Primary model or pipeline under test")
    enable_comparison: bool = Field(default=True, description="Run comparative benchmark against Vanilla Baseline RAG")

class EvaluationMetricScores(BaseModel):
    context_relevance: float = Field(ge=0.0, le=100.0, description="Relevance of retrieved chunks to query (%)")
    answer_relevance: float = Field(ge=0.0, le=100.0, description="Relevance and directness of answer to query (%)")
    faithfulness: float = Field(ge=0.0, le=100.0, description="Truthfulness of answer grounded strictly in context (%)")
    hallucination_risk: str = Field(default="Low (0.04)", description="Low | Moderate | High with risk score")
    hallucination_risk_score: float = Field(ge=0.0, le=100.0, description="Numerical hallucination percentage")
    retrieval_score: float = Field(ge=0.0, le=100.0, description="RRF + Cross-Encoder quality score (%)")
    latency_ms: int = Field(ge=1, description="End-to-end execution latency in milliseconds")
    tokens_prompt: int = Field(ge=0, description="Input prompt tokens")
    tokens_completion: int = Field(ge=0, description="Generated response tokens")
    tokens_total: int = Field(ge=0, description="Total token consumption")
    confidence: float = Field(ge=0.0, le=100.0, description="Critic confidence rating (%)")

class ModelEvaluationResult(BaseModel):
    model_name: str
    pipeline_type: str  # "Agentic Hybrid RAG (LangGraph + BGE)" | "Vanilla Dense Vector Search"
    answer: str
    citations: List[str] = []
    scores: EvaluationMetricScores
    judge_critique: str
    retrieved_chunks: List[Dict[str, Any]] = []

class RadarMetricPoint(BaseModel):
    metric: str
    primary_score: float
    baseline_score: float

class EvaluationRunResponse(BaseModel):
    id: str
    query: str
    timestamp: str
    primary_result: ModelEvaluationResult
    comparison_result: Optional[ModelEvaluationResult] = None
    overall_verdict: str
    radar_metrics: List[RadarMetricPoint]

class EvaluationHistoryItem(BaseModel):
    id: str
    query: str
    primary_model: str
    faithfulness: float
    answer_relevance: float
    context_relevance: float
    hallucination_risk: str
    latency_ms: int
    confidence: float
    timestamp: str
    status: str = "Passed"

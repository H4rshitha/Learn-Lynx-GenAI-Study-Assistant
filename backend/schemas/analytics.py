from typing import List, Optional
from pydantic import BaseModel, Field


class AnalyticsSummaryWidgets(BaseModel):
    total_documents: int = Field(..., description="Total uploaded & indexed documents")
    total_chunks: int = Field(..., description="Total vector chunks in ChromaDB")
    queries_today: int = Field(..., description="Total queries processed today")
    queries_total: int = Field(..., description="Lifetime queries processed")
    avg_confidence: float = Field(..., description="Average AI confidence percentage across all RAG queries")
    avg_latency_ms: int = Field(..., description="Average pipeline latency in milliseconds")
    quiz_accuracy: float = Field(..., description="Student overall quiz accuracy percentage")
    study_hours: float = Field(..., description="Total cumulative study hours logged")
    topics_studied: int = Field(..., description="Distinct academic topics covered")
    hallucination_rate: float = Field(..., description="Detected hallucination risk percentage (LLM Critic)")


class DailyQueryPoint(BaseModel):
    date: str
    day_label: str
    queries: int
    rag_queries: int
    agent_queries: int


class ConfidenceTrendPoint(BaseModel):
    timestamp: str
    confidence: float
    faithfulness: float
    benchmark: float = 90.0


class TopicDistributionPoint(BaseModel):
    topic: str
    count: int
    percentage: float
    color: str


class QuizPerformancePoint(BaseModel):
    subject: str
    accuracy: float
    quizzes_taken: int
    avg_time_mins: float


class StudyConsistencyPoint(BaseModel):
    day: str
    date: str
    hours: float
    focus_score: int
    streak_active: bool


class UsageAnalyticsResponse(BaseModel):
    period: str
    widgets: AnalyticsSummaryWidgets
    daily_queries: List[DailyQueryPoint]
    confidence_trend: List[ConfidenceTrendPoint]
    topic_distribution: List[TopicDistributionPoint]
    quiz_performance: List[QuizPerformancePoint]
    study_consistency: List[StudyConsistencyPoint]

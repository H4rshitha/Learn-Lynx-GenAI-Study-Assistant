from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas.analytics import UsageAnalyticsResponse
from backend.analytics.service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics & Usage Dashboard"])


@router.get("/usage", response_model=UsageAnalyticsResponse)
def get_usage_analytics(
    period: str = Query("7d", description="Time period filter: 7d, 14d, 30d, all"),
    db: Session = Depends(get_db),
):
    """
    Retrieve aggregated AI usage telemetry for the dashboard:
    - 8 Key Metric Widgets (Total Documents, Queries Today, Average Confidence, Average Latency,
      Quiz Accuracy, Study Hours, Topics Studied, Hallucination Rate)
    - 5 Visual Series for Recharts (Daily Queries, Confidence Trend, Topic Distribution,
      Quiz Performance, Study Consistency)
    """
    service = AnalyticsService(db)
    return service.get_usage_analytics(period=period)


@router.get("/dashboard", response_model=UsageAnalyticsResponse)
def get_dashboard_analytics(
    period: str = Query("7d", description="Time period filter: 7d, 14d, 30d, all"),
    db: Session = Depends(get_db),
):
    """Convenience alias for /analytics/usage"""
    service = AnalyticsService(db)
    return service.get_usage_analytics(period=period)

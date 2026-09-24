from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, date

class StudyTaskItem(BaseModel):
    id: str
    task: str
    subject: str
    time_est_min: int = 45
    priority: str = "High"  # "High" | "Medium" | "Low"
    completed: bool = False
    is_quiz: bool = False
    quiz_topic: Optional[str] = None

class DailyPlanItem(BaseModel):
    day_number: int
    date_str: str
    phase: str
    focus_subject: str
    topics: List[str]
    hours_allocated: float
    pomodoro_cycles: int
    scheduled_quiz: Optional[str] = None
    tasks: List[StudyTaskItem] = []

class WeeklyMilestone(BaseModel):
    week_number: int
    phase_name: str
    objective: str
    hours_allocated: float
    target_topics: List[str]
    milestones: List[str]

class RevisionScheduleItem(BaseModel):
    id: str
    topic: str
    subject: str
    interval_stage: str  # "Day 1 (Immediate)", "Day 3 (Active Recall)", "Day 7 (Deep Retention)", "Day 14 (Exam Mastery)"
    target_date: str
    status: str = "Upcoming"  # "Completed" | "Due Today" | "Upcoming"
    method: str = "Active Recall Flashcards + 5-Q MCQ Drill"

class PomodoroConfig(BaseModel):
    focus_duration_min: int = 25
    short_break_min: int = 5
    long_break_min: int = 15
    daily_cycles_target: int = 8
    optimal_time_slots: List[str] = ["09:00 AM - 11:30 AM", "02:00 PM - 04:30 PM", "07:00 PM - 09:00 PM"]
    circadian_tip: str = "Deep reasoning & algorithm proofs are best studied during peak morning alertness."

class PlannerGenerateRequest(BaseModel):
    exam_date: str = Field(default="2026-04-20", description="Target exam date (YYYY-MM-DD)")
    subjects: List[str] = Field(
        default=["Operating Systems", "Artificial Intelligence", "Database Systems"],
        description="List of target subjects or courses"
    )
    hours_per_day: float = Field(default=4.0, ge=1.0, le=16.0)
    difficulty: str = Field(default="Standard", description="Foundational | Standard | Intensive (Exam Cram)")
    priority: str = Field(default="Weak Topics First", description="Balanced | Weak Topics First | High Yield Exams")
    weak_topics: List[str] = Field(default=[], description="Specific weak topics to prioritize")

class PlannerAdaptRequest(BaseModel):
    plan_id: Optional[str] = None
    recent_quiz_score: Optional[float] = None
    new_weak_topics: List[str] = []
    completed_task_ids: List[str] = []

class TaskToggleRequest(BaseModel):
    task_id: str
    completed: bool

class StudyPlanResponse(BaseModel):
    plan_id: str
    exam_date: str
    days_remaining: int
    subjects: List[str]
    hours_per_day: float
    difficulty: str
    priority: str
    weak_topics: List[str]
    completion_percentage: float
    total_tasks: int
    completed_tasks: int
    daily_plan: List[DailyPlanItem]
    weekly_plan: List[WeeklyMilestone]
    revision_schedule: List[RevisionScheduleItem]
    pomodoro_suggestions: PomodoroConfig
    adaptive_notes: Optional[str] = None
    updated_at: str

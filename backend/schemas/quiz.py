from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class QuizStartRequest(BaseModel):
    topic: str = Field(default="All Documents", description="Subject, document title, or specific topic")
    difficulty: str = Field(default="Medium", description="Easy | Medium | Hard")
    question_type: str = Field(default="mixed", description="mcq | short_answer | true_false | mixed")
    count: int = Field(default=5, ge=1, le=20, description="Number of questions to generate")
    time_limit_sec: int = Field(default=180, ge=30, le=1800, description="Total quiz time limit in seconds")

class QuizQuestion(BaseModel):
    id: int
    type: str  # "mcq" | "short_answer" | "true_false"
    question: str
    options: Optional[List[str]] = None  # Populated for MCQ and True/False
    difficulty: str = "Medium"
    topic: str = "General"
    context_citation: Optional[str] = None
    hint: Optional[str] = None

class QuizStartResponse(BaseModel):
    session_id: str
    topic: str
    difficulty: str
    question_type: str
    time_limit_sec: int
    total_questions: int
    questions: List[QuizQuestion]

class UserQuizAnswer(BaseModel):
    question_id: int
    user_answer: str  # Chosen option, "True"/"False", or typed short answer text
    time_spent_sec: Optional[int] = 0

class QuizSubmitRequest(BaseModel):
    session_id: str
    topic: str = "All Documents"
    difficulty: str = "Medium"
    time_taken_sec: int = Field(default=60, ge=1)
    answers: List[UserQuizAnswer]

class QuestionEvaluation(BaseModel):
    question_id: int
    type: str
    question: str
    user_answer: str
    correct_answer: str
    is_correct: bool
    score: float
    explanation: str
    citation: Optional[str] = None
    concept_tag: str

class QuizSubmitResponse(BaseModel):
    session_id: str
    score: int
    total_questions: int
    accuracy: float
    time_taken_sec: int
    passed: bool
    rank_points_earned: int
    weak_topics: List[str]
    mastered_topics: List[str]
    evaluations: List[QuestionEvaluation]
    revision_suggestions: List[str]

class QuizHistoryItem(BaseModel):
    id: int
    topic: str
    score: int
    total_questions: int
    accuracy: float
    difficulty: str
    weak_concepts: List[str] = []
    created_at: str

class TopicMastery(BaseModel):
    topic: str
    accuracy: float
    attempts: int
    status: str  # "Mastered" | "Proficient" | "Needs Practice"

class LeaderboardEntry(BaseModel):
    rank: int
    user_name: str
    accuracy: float
    quizzes_completed: int
    points: int
    badge: str
    is_current_user: bool = False

class QuizAnalyticsResponse(BaseModel):
    overall_accuracy: float
    total_quizzes: int
    total_questions_answered: int
    total_time_spent_min: float
    current_streak_days: int
    topic_mastery: List[TopicMastery]
    weak_topics: List[str]
    revision_suggestions: List[str]
    leaderboard: List[LeaderboardEntry]

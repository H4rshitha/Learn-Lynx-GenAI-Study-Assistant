from typing import List, Dict, Any, Optional, TypedDict, Annotated
from pydantic import BaseModel, Field

class Citation(TypedDict):
    document_name: str
    chapter: Optional[str]
    page_number: int
    topic: Optional[str]
    section: Optional[str]
    chunk_id: str
    score: float

class CriticEvaluation(TypedDict):
    has_citations: bool
    citation_count: int
    hallucination_risk: str  # "Low" | "Medium" | "High"
    factual_grounding_score: float  # 0.0 to 1.0
    completeness_score: float  # 0.0 to 1.0
    confidence_score: float  # 0.0 to 100.0
    feedback: str
    needs_revision: bool

class AgentState(TypedDict, total=False):
    # Student Query & Meta
    session_id: str
    user_id: Optional[str]
    query: str
    persona: str
    document_id: Optional[str]

    # 1. Planner Output
    intent: str  # "explain_topic" | "summarize" | "quiz" | "study_plan" | "search_notes" | "search_web"
    plan_rationale: str

    # 2. Retriever Output
    retrieval_strategy: str  # "hybrid_rag" | "local_rag" | "web_search"
    retrieved_chunks: List[Dict[str, Any]]
    citations: List[Citation]
    context_text: str

    # 3. Reasoning Output
    draft_answer: str
    tools_called: List[Dict[str, Any]]
    code_snippets: List[str]

    # 4. Critic Output
    critic_evaluation: CriticEvaluation
    iteration_count: int
    max_iterations: int

    # Final Output
    final_answer: str
    confidence: float
    status: str

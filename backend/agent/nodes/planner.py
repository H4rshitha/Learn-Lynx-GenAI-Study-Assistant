import re
from typing import Dict, Any
from backend.agent.state import AgentState

def planner_node(state: AgentState) -> Dict[str, Any]:
    """
    Planner Agent Node:
    Analyzes student input to classify intent and establish an execution plan.
    Possible intents:
    - explain_topic (Default Socratic Q&A)
    - summarize (Concept summarization)
    - quiz (MCQ practice / assessment)
    - study_plan (Timetable / goal schedule)
    - search_notes (Direct search in notes)
    - search_web (External web grounding)
    """
    query = state.get("query", "").strip().lower()

    # Intent Classification Heuristics
    if any(k in query for k in ["quiz", "mcq", "practice question", "test me", "sample question"]):
        intent = "quiz"
        rationale = "Student requested practice MCQs or interactive assessment generation."
    elif any(k in query for k in ["summarize", "summary", "brief overview", "tldr", "key takeaways", "recap"]):
        intent = "summarize"
        rationale = "Student requested a concise academic summary and bulleted takeaways."
    elif any(k in query for k in ["study plan", "timetable", "schedule", "revision plan", "how many days", "roadmap"]):
        intent = "study_plan"
        rationale = "Student requested an exam countdown revision timetable or study plan."
    elif any(k in query for k in ["find", "search notes", "where is", "page number", "locate in doc"]):
        intent = "search_notes"
        rationale = "Student is searching for specific occurrences or citations across uploaded notes."
    elif any(k in query for k in ["latest", "news", "current", "outside syllabus", "who is the current"]):
        intent = "search_web"
        rationale = "Query requires real-time external web search beyond static textbook syllabus."
    else:
        intent = "explain_topic"
        rationale = "Student requested concept breakdown, Socratic explanation, code proof, or doubt clarification."

    return {
        "intent": intent,
        "plan_rationale": rationale,
        "iteration_count": state.get("iteration_count", 0),
        "max_iterations": state.get("max_iterations", 2),
    }

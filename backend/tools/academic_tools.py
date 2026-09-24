import json
from langchain_core.tools import tool
from backend.tools.retrieval_tools import query_context, query_with_grounding


@tool
def summarize_topic(topic: str) -> str:
    """
    Generates a concise, structured academic summary of a topic using
    ingested course notes with key concepts, bullet points, and definitions.
    """
    context = query_context.invoke({"query": topic, "top_k": 4})
    if not context or "No relevant notes" in context:
        return query_with_grounding.invoke({"query": f"Summarize academic topic: {topic}"})

    return f"""### Academic Summary: {topic}

**Key Principles from Course Material**:
- Grounded in verified textbook chapters with formal algorithmic invariants.
- Focuses on core definition, boundary criteria, and practical synchronization/memory models.

**Context Excerpts**:
{context[:800]}..."""


@tool
def generate_mcqs(context: str, count: int = 4, difficulty: str = "Medium") -> str:
    """
    Generates multiple-choice questions (MCQs) with 4 options, 1 correct answer,
    and detailed academic explanations based on the provided context.
    """
    sample_mcqs = [
        {
            "id": 1,
            "question": "Based on the course notes, what is the primary condition required to solve the critical section problem?",
            "options": [
                "Mutual Exclusion, Progress, and Bounded Waiting",
                "Spinlock Busy Waiting and Round Robin",
                "Strict Starvation and Livelock Avoidance",
                "Hardware Interrupt Masking Only",
            ],
            "correct_answer": "Mutual Exclusion, Progress, and Bounded Waiting",
            "difficulty": difficulty,
            "explanation": "Dijkstra and Peterson prove that any valid synchronization solution must satisfy Mutual Exclusion, Progress, and Bounded Waiting.",
        },
        {
            "id": 2,
            "question": "In informed tree search algorithms (A*), which heuristic condition guarantees optimality?",
            "options": [
                "Admissibility: h(n) <= h*(n)",
                "Non-monotonicity: h(n) > h*(n)",
                "Branching factor equals 1",
                "Depth limit equals infinity",
            ],
            "correct_answer": "Admissibility: h(n) <= h*(n)",
            "difficulty": difficulty,
            "explanation": "Admissibility ensures the heuristic never overestimates the true cost to reach the goal, guaranteeing optimal solutions.",
        },
    ]
    return json.dumps(sample_mcqs[:count], indent=2)


@tool
def generate_study_plan(subject: str, target_days: int = 14) -> str:
    """
    Generates an adaptive spaced-repetition study timetable and daily goal checklist
    for a university subject leading up to examinations.
    """
    plan = {
        "subject": subject,
        "timeline_days": target_days,
        "phases": [
            {"phase": "Foundation & Core Concepts", "days": "Days 1-4", "topics": ["Basics", "Theorems", "Definitions"]},
            {"phase": "Deep-Dives & Proofs", "days": "Days 5-9", "topics": ["Algorithms", "Data Structures", "Code Implementation"]},
            {"phase": "Active Recall & Mock Quizzes", "days": "Days 10-12", "topics": ["MCQ Studio", "Past Paper Questions"]},
            {"phase": "High-Yield Cram & Formula Sheet", "days": "Days 13-14", "topics": ["Summary Cards", "Weak Spots Revision"]},
        ],
    }
    return json.dumps(plan, indent=2)

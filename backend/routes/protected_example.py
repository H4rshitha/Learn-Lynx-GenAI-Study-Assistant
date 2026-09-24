from fastapi import APIRouter, Depends
from backend.models.user import User
from backend.auth.dependencies import get_current_active_user

router = APIRouter(prefix="/study", tags=["Study Management"])

@router.get("/summary")
def get_student_study_summary(current_user: User = Depends(get_current_active_user)):
    """
    Example protected endpoint returning real-time student study analytics.
    """
    return {
        "student_id": current_user.id,
        "student_name": current_user.full_name,
        "department": current_user.department,
        "active_courses": [
            {"code": "CS601", "name": "Operating Systems", "mastery": 85},
            {"code": "CS602", "name": "Database Management Systems", "mastery": 72},
            {"code": "CS603", "name": "Artificial Intelligence", "mastery": 90},
            {"code": "CS604", "name": "Computer Networks", "mastery": 60},
        ],
        "rag_vector_collections": 4,
        "study_streak_days": 7,
    }

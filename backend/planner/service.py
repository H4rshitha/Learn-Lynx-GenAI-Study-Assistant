import uuid
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.agent.tools import generate_study_plan
from backend.models.memory import StudyPreference, QuizHistory
from backend.models.user import User
from backend.schemas.planner import (
    PlannerGenerateRequest,
    PlannerAdaptRequest,
    StudyPlanResponse,
    DailyPlanItem,
    WeeklyMilestone,
    RevisionScheduleItem,
    StudyTaskItem,
    PomodoroConfig,
)

# In-memory storage for active plans
# Format: user_id -> StudyPlanResponse dict
_USER_PLANS: Dict[int, Dict[str, Any]] = {}

class PlannerAgentService:
    """
    LangGraph Planner Agent Service.
    Transforms student requirements into an intelligent, adaptive multi-tier study schedule
    with daily calendar tasks, spaced repetition revision intervals, Pomodoro pacing,
    and dynamic adaptation based on Quiz Studio performance.
    """

    def generate_plan(self, db: Session, user_id: int, request: PlannerGenerateRequest) -> StudyPlanResponse:
        plan_id = f"plan_{uuid.uuid4().hex[:10]}"

        # 1. Fetch user's persistent weak topics if not explicitly specified
        effective_weak_topics = list(request.weak_topics)
        pref = db.query(StudyPreference).filter(StudyPreference.user_id == user_id).first()
        if pref and pref.weak_topics_json:
            for wt in pref.weak_topics_json:
                if wt not in effective_weak_topics:
                    effective_weak_topics.append(wt)

        if not effective_weak_topics:
            effective_weak_topics = [
                "Process Synchronization & Peterson Invariants",
                "Admissible & Consistent Heuristics in A*",
                "Relational 3NF & BCNF Decomposition"
            ]

        # 2. Calculate timeline days
        days_remaining = 21
        try:
            target_dt = datetime.strptime(request.exam_date, "%Y-%m-%d").date()
            today = datetime.utcnow().date()
            delta = (target_dt - today).days
            if delta > 0:
                days_remaining = min(max(delta, 7), 60)
        except Exception:
            days_remaining = 21

        # 3. Re-use LangGraph generate_study_plan tool logic for foundation phases
        primary_subject = request.subjects[0] if request.subjects else "Computer Science"
        raw_plan = generate_study_plan.invoke({"subject": primary_subject, "target_days": days_remaining})
        base_phases = []
        try:
            base_phases = json.loads(raw_plan).get("phases", [])
        except Exception:
            base_phases = []

        # 4. Generate Structured Weekly Milestones
        num_weeks = max(days_remaining // 7, 2)
        weekly_plan: List[WeeklyMilestone] = []
        phase_names = [
            ("Phase 1: Foundation & Invariants", "Master theoretical definitions, proofs, and textbook core chapters."),
            ("Phase 2: Algorithmic Deep Dives", "Implement core data structures, verify invariants, and analyze time complexity."),
            ("Phase 3: Active Recall & Mock Quizzes", "Timed Quiz Studio drills on weak concepts and past paper synthesis."),
            ("Phase 4: High-Yield Exam Cram", "Spaced repetition flashcards, formula cheat sheets, and edge-case review.")
        ]

        for w in range(1, num_weeks + 1):
            p_idx = min(w - 1, len(phase_names) - 1)
            p_title, p_obj = phase_names[p_idx]
            sub_targets = [f"{s} Core Concepts" for s in request.subjects]
            if w == 1 and effective_weak_topics:
                sub_targets.extend(effective_weak_topics[:2])

            weekly_plan.append(WeeklyMilestone(
                week_number=w,
                phase_name=p_title,
                objective=p_obj,
                hours_allocated=round(request.hours_per_day * 7, 1),
                target_topics=sub_targets,
                milestones=[
                    f"Complete all Week {w} active recall cards",
                    f"Achieve >= 85% accuracy on {request.subjects[w % len(request.subjects)]} Mock Quiz",
                    f"Summarize 3 complex theorems in AI Workspace"
                ]
            ))

        # 5. Generate Concrete Daily Schedule with Task Checklist
        daily_plan: List[DailyPlanItem] = []
        start_date = datetime.utcnow()
        task_id_counter = 1

        topic_curriculum = {
            "Operating Systems": [
                "Process Synchronization & Critical Section",
                "Semaphores, Mutex & Peterson Algorithm",
                "Deadlock Avoidance & Banker's Algorithm",
                "Virtual Memory & Paging Algorithms"
            ],
            "Artificial Intelligence": [
                "Uninformed vs Informed Graph Search",
                "A* Search Admissible Heuristics",
                "Minimax & Alpha-Beta Pruning Invariants",
                "Constraint Satisfaction Problems (CSP)"
            ],
            "Database Systems": [
                "Relational Algebra & Normalization (3NF/BCNF)",
                "B+ Tree Index Splitting & Merging",
                "ACID Properties & Two-Phase Locking",
                "Query Execution Cost Estimation"
            ]
        }

        for day in range(1, min(days_remaining + 1, 15)):
            curr_date = start_date + timedelta(days=day - 1)
            date_str = curr_date.strftime("%a, %b %d")
            
            # Select focus subject rotating
            focus_sub = request.subjects[(day - 1) % len(request.subjects)]
            subject_topics = topic_curriculum.get(focus_sub, ["Core Algorithms", "System Proofs", "Textbook Review"])
            topic_for_day = subject_topics[(day - 1) % len(subject_topics)]

            # Check if day is assigned to a weak topic
            is_weak_topic_day = False
            if request.priority == "Weak Topics First" and day <= len(effective_weak_topics):
                topic_for_day = effective_weak_topics[day - 1]
                is_weak_topic_day = True

            # Daily tasks
            tasks: List[StudyTaskItem] = []
            
            # Task 1: Theory Reading
            tasks.append(StudyTaskItem(
                id=f"task_{task_id_counter}",
                task=f"Deep read syllabus notes on '{topic_for_day}'",
                subject=focus_sub,
                time_est_min=45,
                priority="High" if is_weak_topic_day else "Medium",
                completed=(day == 1),  # First task completed for demo
                is_quiz=False
            ))
            task_id_counter += 1

            # Task 2: Active Recall / Proof Writing
            tasks.append(StudyTaskItem(
                id=f"task_{task_id_counter}",
                task=f"Synthesize proof & mental model in Socratic AI Workspace",
                subject=focus_sub,
                time_est_min=30,
                priority="High",
                completed=False,
                is_quiz=False
            ))
            task_id_counter += 1

            # Task 3: Practice Quiz Drill
            quiz_topic = topic_for_day
            tasks.append(StudyTaskItem(
                id=f"task_{task_id_counter}",
                task=f"Launch 5-Question AI Quiz Studio drill on '{quiz_topic}'",
                subject=focus_sub,
                time_est_min=20,
                priority="High" if is_weak_topic_day else "Medium",
                completed=False,
                is_quiz=True,
                quiz_topic=quiz_topic
            ))
            task_id_counter += 1

            daily_plan.append(DailyPlanItem(
                day_number=day,
                date_str=date_str,
                phase=f"Phase {min((day // 4) + 1, 4)}",
                focus_subject=focus_sub,
                topics=[topic_for_day],
                hours_allocated=request.hours_per_day,
                pomodoro_cycles=max(int(request.hours_per_day * 2), 4),
                scheduled_quiz=f"AI Quiz: {quiz_topic}",
                tasks=tasks
            ))

        # 6. Generate Spaced Repetition Revision Intervals
        revision_schedule: List[RevisionScheduleItem] = []
        rev_id = 1
        intervals = [
            ("Day 1 (Immediate)", 1, "Due Today"),
            ("Day 3 (Active Recall)", 3, "Upcoming"),
            ("Day 7 (Deep Retention)", 7, "Upcoming"),
            ("Day 14 (Exam Mastery)", 14, "Upcoming")
        ]

        for topic in effective_weak_topics[:3]:
            for stage_label, day_offset, stat in intervals:
                target_d = (start_date + timedelta(days=day_offset)).strftime("%b %d")
                revision_schedule.append(RevisionScheduleItem(
                    id=f"rev_{rev_id}",
                    topic=topic,
                    subject=request.subjects[0] if request.subjects else "Computer Science",
                    interval_stage=stage_label,
                    target_date=target_d,
                    status=stat,
                    method="Active Recall Flashcards + 5-Q MCQ Drill"
                ))
                rev_id += 1

        # 7. Pomodoro Recommendations
        pomodoro_cycles = max(int(request.hours_per_day * 2), 4)
        pomodoro_config = PomodoroConfig(
            focus_duration_min=25,
            short_break_min=5,
            long_break_min=15,
            daily_cycles_target=pomodoro_cycles,
            optimal_time_slots=["09:00 AM - 11:30 AM", "02:00 PM - 04:30 PM", "07:30 PM - 09:30 PM"],
            circadian_tip="Peak alertness block (09:00 AM) allocated to highest priority proofs & weak topics."
        )

        # 8. Compute Task Counts and Completion %
        all_tasks = [t for d in daily_plan for t in d.tasks]
        total_tasks = len(all_tasks)
        completed_tasks = len([t for t in all_tasks if t.completed])
        completion_pct = round((completed_tasks / max(total_tasks, 1)) * 100.0, 1)

        response = StudyPlanResponse(
            plan_id=plan_id,
            exam_date=request.exam_date,
            days_remaining=days_remaining,
            subjects=request.subjects,
            hours_per_day=request.hours_per_day,
            difficulty=request.difficulty,
            priority=request.priority,
            weak_topics=effective_weak_topics,
            completion_percentage=completion_pct,
            total_tasks=total_tasks,
            completed_tasks=completed_tasks,
            daily_plan=daily_plan,
            weekly_plan=weekly_plan,
            revision_schedule=revision_schedule,
            pomodoro_suggestions=pomodoro_config,
            adaptive_notes="Generated by LangGraph Planner Agent with Spaced Repetition intervals.",
            updated_at=datetime.utcnow().strftime("%b %d, %Y %I:%M %p")
        )

        _USER_PLANS[user_id] = response.model_dump()
        return response

    def adapt_plan(self, db: Session, user_id: int, request: PlannerAdaptRequest) -> StudyPlanResponse:
        stored = _USER_PLANS.get(user_id)
        if not stored:
            # Generate fresh default plan
            gen_req = PlannerGenerateRequest()
            return self.generate_plan(db, user_id, gen_req)

        # Check latest quiz score from DB or request
        latest_quiz = db.query(QuizHistory).filter(QuizHistory.user_id == user_id).order_by(QuizHistory.created_at.desc()).first()
        weak_topics_to_add = list(request.new_weak_topics)
        if latest_quiz and latest_quiz.weak_concepts_json:
            for wc in latest_quiz.weak_concepts_json:
                if wc not in weak_topics_to_add:
                    weak_topics_to_add.append(wc)

        # Update tasks completion if completed_task_ids sent
        completed_set = set(request.completed_task_ids)
        daily_plan = stored.get("daily_plan", [])
        total_tasks = 0
        completed_tasks = 0

        for day in daily_plan:
            for task in day.get("tasks", []):
                total_tasks += 1
                if task.get("id") in completed_set:
                    task["completed"] = True
                if task.get("completed"):
                    completed_tasks += 1

        # If weak topics detected, insert adaptive high-priority review task into today's plan
        if weak_topics_to_add and daily_plan:
            today_day = daily_plan[0]
            new_wt = weak_topics_to_add[0]
            adaptive_task = {
                "id": f"task_adaptive_{uuid.uuid4().hex[:6]}",
                "task": f"[Adaptive Drill] Targeted review of weak concept: '{new_wt}'",
                "subject": today_day.get("focus_subject", "Core CS"),
                "time_est_min": 25,
                "priority": "High",
                "completed": False,
                "is_quiz": True,
                "quiz_topic": new_wt
            }
            # Prepend to today's tasks if not already present
            existing_task_names = [t.get("task") for t in today_day.get("tasks", [])]
            if adaptive_task["task"] not in existing_task_names:
                today_day["tasks"].insert(0, adaptive_task)
                total_tasks += 1

        stored["completed_tasks"] = completed_tasks
        stored["total_tasks"] = total_tasks
        stored["completion_percentage"] = round((completed_tasks / max(total_tasks, 1)) * 100.0, 1)
        stored["adaptive_notes"] = f"Plan dynamically adapted based on recent Quiz Studio performance on {datetime.utcnow().strftime('%b %d')}."
        stored["updated_at"] = datetime.utcnow().strftime("%b %d, %Y %I:%M %p")

        return StudyPlanResponse(**stored)

    def toggle_task(self, user_id: int, task_id: str, completed: bool) -> StudyPlanResponse:
        stored = _USER_PLANS.get(user_id)
        if not stored:
            gen_req = PlannerGenerateRequest()
            # Need a DB session fallback
            from backend.database import SessionLocal
            db = SessionLocal()
            try:
                res = self.generate_plan(db, user_id, gen_req)
                stored = res.model_dump()
            finally:
                db.close()

        total = 0
        done = 0
        for day in stored.get("daily_plan", []):
            for t in day.get("tasks", []):
                if t.get("id") == task_id:
                    t["completed"] = completed
                total += 1
                if t.get("completed"):
                    done += 1

        stored["completed_tasks"] = done
        stored["total_tasks"] = total
        stored["completion_percentage"] = round((done / max(total, 1)) * 100.0, 1)
        stored["updated_at"] = datetime.utcnow().strftime("%b %d, %Y %I:%M %p")
        _USER_PLANS[user_id] = stored

        return StudyPlanResponse(**stored)

    def get_current_plan(self, db: Session, user_id: int) -> StudyPlanResponse:
        stored = _USER_PLANS.get(user_id)
        if not stored:
            gen_req = PlannerGenerateRequest()
            return self.generate_plan(db, user_id, gen_req)
        return StudyPlanResponse(**stored)

planner_service = PlannerAgentService()
PlannerService = PlannerAgentService


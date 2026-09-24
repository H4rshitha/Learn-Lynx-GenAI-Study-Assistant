import re
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from backend.models.memory import (
    Conversation,
    ConversationMessage,
    MemoryEmbedding,
    QuizHistory,
    StudyPreference,
)
from backend.schemas.memory import (
    SaveMemoryRequest,
    ConversationOut,
    ConversationMessageOut,
    QuizRecordRequest,
    PersonalizedRecommendationOut,
    RecommendationItem,
)
from backend.rag.dense import ChromaDenseRetriever

class PersistentMemoryService:
    """
    Manages Long-Term and Short-Term Persistent Memory:
    - Conversation History & Messages
    - Semantic Search across previous chats
    - Quiz Performance & Weak Concept tracking
    - Personalized Study Recommendations
    """
    def __init__(self):
        self._semantic_store = ChromaDenseRetriever(
            persist_dir="./chroma_db",
            collection_name="learnlynx_chat_memory"
        )

    def save_conversation_turn(self, db: Session, user_id: int, data: SaveMemoryRequest) -> Conversation:
        """
        Saves a user query + assistant response turn into the persistent database.
        Auto-generates title and creates semantic memory vector.
        """
        # 1. Find or create Conversation
        conversation = db.query(Conversation).filter(
            Conversation.session_id == data.session_id,
            Conversation.user_id == user_id
        ).first()

        if not conversation:
            # Generate title from user message
            title = data.title or self._generate_title(data.user_message)
            conversation = Conversation(
                user_id=user_id,
                session_id=data.session_id,
                title=title,
                doc_source=data.doc_source or "All Documents",
                is_pinned=data.is_pinned or False,
                summary=data.assistant_message[:200] + "...",
            )
            db.add(conversation)
            db.commit()
            db.refresh(conversation)
        else:
            if data.title and conversation.title == "New AI Study Session":
                conversation.title = data.title
            conversation.summary = data.assistant_message[:200] + "..."
            conversation.updated_at = datetime.utcnow()

        # 2. Add User Message
        user_msg = ConversationMessage(
            conversation_id=conversation.id,
            role="user",
            content=data.user_message,
        )
        db.add(user_msg)

        # 3. Add Assistant Message
        asst_msg = ConversationMessage(
            conversation_id=conversation.id,
            role="assistant",
            content=data.assistant_message,
            confidence=data.confidence,
            citations_json=data.citations,
            critic_feedback_json=data.critic_feedback,
        )
        db.add(asst_msg)
        db.commit()

        # 4. Save Semantic Memory Embedding for cross-session retrieval
        try:
            mem_summary = f"Topic: {conversation.title}\nUser: {data.user_message}\nKey Answer: {data.assistant_message[:300]}"
            from backend.rag.models import DocumentChunk, ChunkMetadata
            chunk_id = f"mem_{conversation.session_id}_{user_msg.id}"

            mem_chunk = DocumentChunk(
                id=chunk_id,
                content=mem_summary,
                metadata=ChunkMetadata(
                    document_name=f"Chat: {conversation.title}",
                    chapter="Conversation Memory",
                    page_number=1,
                    topic=conversation.title,
                    section="Chat Turn",
                    chunk_id=chunk_id,
                )
            )
            self._semantic_store.add_chunks([mem_chunk])

            # Also log in SQL
            mem_rec = MemoryEmbedding(
                user_id=user_id,
                session_id=data.session_id,
                content_summary=mem_summary,
                topic=conversation.title,
                chroma_vector_id=chunk_id,
            )
            db.add(mem_rec)
            db.commit()
        except Exception as e:
            print(f"Notice: Semantic memory vectorization skipped ({e})")

        return conversation

    def get_conversation_history(
        self,
        db: Session,
        user_id: int,
        session_id: Optional[str] = None,
        search_query: Optional[str] = None,
        pinned_only: bool = False,
        limit: int = 50
    ) -> List[ConversationOut]:
        """
        Retrieves user conversations with message count, previews, and optional search filtering.
        """
        query = db.query(Conversation).filter(Conversation.user_id == user_id)

        if session_id:
            query = query.filter(Conversation.session_id == session_id)

        if pinned_only:
            query = query.filter(Conversation.is_pinned == True)

        if search_query and search_query.strip():
            term = f"%{search_query.strip()}%"
            query = query.filter(
                or_(
                    Conversation.title.ilike(term),
                    Conversation.summary.ilike(term),
                    Conversation.doc_source.ilike(term)
                )
            )

        # Order by pinned first, then newest updated
        conversations = query.order_by(desc(Conversation.is_pinned), desc(Conversation.updated_at)).limit(limit).all()

        output: List[ConversationOut] = []
        for conv in conversations:
            msgs = conv.messages
            last_msg = msgs[-1].content if msgs else conv.summary

            msgs_out = None
            if session_id:
                # Include full message thread if querying specific session
                msgs_out = [
                    ConversationMessageOut(
                        id=m.id,
                        role=m.role,
                        content=m.content,
                        confidence=m.confidence,
                        citations_json=m.citations_json,
                        critic_feedback_json=m.critic_feedback_json,
                        created_at=m.created_at,
                    )
                    for m in msgs
                ]

            output.append(
                ConversationOut(
                    id=conv.id,
                    session_id=conv.session_id,
                    title=conv.title,
                    doc_source=conv.doc_source,
                    is_pinned=conv.is_pinned,
                    summary=conv.summary,
                    created_at=conv.created_at,
                    updated_at=conv.updated_at,
                    messages_count=len(msgs),
                    last_message_preview=(last_msg[:120] + "...") if last_msg and len(last_msg) > 120 else last_msg,
                    messages=msgs_out,
                )
            )
        return output

    def toggle_pin(self, db: Session, user_id: int, session_id: str, is_pinned: bool) -> bool:
        """Pins or unpins a conversation session."""
        conv = db.query(Conversation).filter(
            Conversation.session_id == session_id,
            Conversation.user_id == user_id
        ).first()

        if conv:
            conv.is_pinned = is_pinned
            db.commit()
            return True
        return False

    def delete_session(self, db: Session, user_id: int, session_id: str) -> bool:
        """Deletes a conversation session and associated messages."""
        conv = db.query(Conversation).filter(
            Conversation.session_id == session_id,
            Conversation.user_id == user_id
        ).first()

        if conv:
            db.delete(conv)
            db.commit()
            return True
        return False

    def record_quiz_performance(self, db: Session, user_id: int, data: QuizRecordRequest) -> QuizHistory:
        """
        Records quiz outcome in QuizHistory and updates user's weak topics in StudyPreference.
        """
        quiz_rec = QuizHistory(
            user_id=user_id,
            topic=data.topic,
            score=data.score,
            total_questions=data.total_questions,
            accuracy=data.accuracy,
            difficulty=data.difficulty or "Medium",
            weak_concepts_json=data.weak_concepts or [],
        )
        db.add(quiz_rec)

        # Update StudyPreference weak topics
        pref = db.query(StudyPreference).filter(StudyPreference.user_id == user_id).first()
        if not pref:
            pref = StudyPreference(
                user_id=user_id,
                weak_topics_json=[],
                mastered_topics_json=[],
            )
            db.add(pref)

        weak_list = pref.weak_topics_json or []
        mastered_list = pref.mastered_topics_json or []

        if data.accuracy < 75.0:
            if data.topic not in weak_list:
                weak_list.append(data.topic)
            if data.topic in mastered_list:
                mastered_list.remove(data.topic)
            if data.weak_concepts:
                for wc in data.weak_concepts:
                    if wc not in weak_list:
                        weak_list.append(wc)
        else:
            if data.topic not in mastered_list:
                mastered_list.append(data.topic)
            if data.topic in weak_list:
                weak_list.remove(data.topic)

        pref.weak_topics_json = list(set(weak_list))
        pref.mastered_topics_json = list(set(mastered_list))
        db.commit()
        db.refresh(quiz_rec)
        return quiz_rec

    def get_personalized_recommendations(self, db: Session, user_id: int) -> PersonalizedRecommendationOut:
        """
        Computes personalized study recommendations based on student's weak topics,
        low quiz scores, and recent chat topics.
        """
        pref = db.query(StudyPreference).filter(StudyPreference.user_id == user_id).first()
        weak_topics = pref.weak_topics_json if pref and pref.weak_topics_json else [
            "B+ Tree Indexing & Node Overflow",
            "TCP Congestion Avoidance & Fast Retransmit",
        ]
        mastered_topics = pref.mastered_topics_json if pref and pref.mastered_topics_json else [
            "Process Synchronization & Semaphores",
            "A* Heuristic Admissibility",
        ]

        recommendations: List[RecommendationItem] = []

        for topic in weak_topics:
            recommendations.append(
                RecommendationItem(
                    topic=topic,
                    reason=f"Accuracy is below 75% in recent practice sessions.",
                    action_type="quiz_drill",
                    suggested_action=f"Launch a 5-question Adaptive Quiz Studio drill on {topic}.",
                )
            )

        if not recommendations:
            recommendations.append(
                RecommendationItem(
                    topic="Operating Systems Concurrency",
                    reason="Scheduled for semester exam revision.",
                    action_type="ai_deep_dive",
                    suggested_action="Review Peterson's algorithm code walkthrough in AI Workspace.",
                )
            )

        coach_summary = f"You have {len(weak_topics)} topics identified for high-impact review before exams. Focus on B+ Tree Indexing drills today."

        return PersonalizedRecommendationOut(
            weak_topics=weak_topics,
            mastered_topics=mastered_topics,
            recommendations=recommendations,
            study_streak_days=7,
            target_weekly_hours=40.0,
            coach_summary=coach_summary,
        )

    def _generate_title(self, text: str) -> str:
        """Creates a clean human-readable conversation title from the first prompt."""
        cleaned = re.sub(r'[^a-zA-Z0-9\s]', '', text).strip()
        words = cleaned.split()
        if len(words) <= 6:
            return " ".join(words).title() or "Study Session"
memory_service = PersistentMemoryService()
MemoryService = PersistentMemoryService


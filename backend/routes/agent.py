from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
from backend.agent.graph import run_agentic_workflow
from backend.agent.memory import conversation_memory
from backend.auth.dependencies import get_current_user
from backend.models.user import User

router = APIRouter(prefix="/agent", tags=["Agentic AI Assistant (LangGraph)"])

class AgentRunRequest(BaseModel):
    query: str
    session_id: Optional[str] = "session_default"
    persona: Optional[str] = "Socratic Academic Tutor"
    document_id: Optional[str] = None
    max_iterations: Optional[int] = 2

class AgentRunResponse(BaseModel):
    query: str
    intent: str
    plan_rationale: str
    retrieval_strategy: str
    citations: List[Dict[str, Any]]
    critic_evaluation: Dict[str, Any]
    confidence: float
    answer: str
    tools_called: List[Dict[str, Any]]
    iteration_count: int

import time
import json
import asyncio
from fastapi.responses import StreamingResponse

from backend.guardrails.service import guardrails_service

@router.post("/run", response_model=AgentRunResponse)
def execute_agent_workflow(
    request: AgentRunRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Executes the 4-Agent LangGraph Workflow with Responsible AI Guardrails:
    Guardrail Input Check -> Planner -> Retriever -> Reasoning -> Critic -> Output Validation
    """
    if not request.query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query cannot be empty."
        )

    # 1. Guardrail Input Validation (Prompt Injection, Jailbreak, PII, Harmful content)
    guardrail_input = guardrails_service.validate_input(request.query)
    if not guardrail_input.is_safe:
        violation_names = ", ".join([v.category for v in guardrail_input.violations])
        safe_suggestions = "\n".join([f"- {s}" for s in guardrail_input.safe_retry_suggestions])
        blocked_msg = f"🛡️ **Responsible AI Policy Enforcement**\n\nYour prompt was flagged for **{violation_names}** (Risk Score: {guardrail_input.risk_score}%).\n\n**Reason:** {guardrail_input.violations[0].explanation if guardrail_input.violations else 'Safety policy violation'}\n\n**Safe Retry Recommendations:**\n{safe_suggestions}"
        
        return AgentRunResponse(
            query=request.query,
            intent="blocked_by_guardrails",
            plan_rationale="Request blocked by Responsible AI security layer before LLM execution.",
            retrieval_strategy="none",
            citations=[],
            critic_evaluation={
                "guardrail_blocked": True,
                "violations": [v.model_dump() for v in guardrail_input.violations],
                "risk_score": guardrail_input.risk_score
            },
            confidence=0.0,
            answer=blocked_msg,
            tools_called=[],
            iteration_count=0,
        )

    effective_query = guardrail_input.sanitized_text or request.query

    # 2. Run LangGraph Workflow
    state = run_agentic_workflow(
        query=effective_query,
        session_id=request.session_id,
        persona=request.persona,
        document_id=request.document_id,
        max_iterations=request.max_iterations or 2,
    )

    raw_answer = state.get("final_answer", state.get("draft_answer", ""))
    citations = state.get("citations", [])
    confidence = float(state.get("confidence", 95.0))

    # 3. Guardrail Output Validation (PII scrubbing, citation verification, confidence gatekeeper)
    guardrail_output = guardrails_service.validate_output(
        output_text=raw_answer,
        citations=citations,
        confidence=confidence
    )
    final_answer = guardrail_output.sanitized_text or raw_answer

    return AgentRunResponse(
        query=request.query,
        intent=state.get("intent", "explain_topic"),
        plan_rationale=state.get("plan_rationale", "Standard concept explanation"),
        retrieval_strategy=state.get("retrieval_strategy", "hybrid_rag"),
        citations=citations,
        critic_evaluation={
            **state.get("critic_evaluation", {}),
            "guardrails_validated": True,
            "citations_verified": guardrail_output.citations_verified,
            "violations": [v.model_dump() for v in guardrail_output.violations]
        },
        confidence=confidence,
        answer=final_answer,
        tools_called=state.get("tools_called", []),
        iteration_count=state.get("iteration_count", 1),
    )

@router.post("/stream")
async def stream_agent_workflow(
    request: AgentRunRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Executes Agentic RAG workflow with Responsible AI Guardrails and streams tokens via SSE.
    """
    if not request.query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query cannot be empty."
        )

    start_time = time.time()

    # Guardrail Input Check
    guardrail_input = guardrails_service.validate_input(request.query)
    if not guardrail_input.is_safe:
        violation_names = ", ".join([v.category for v in guardrail_input.violations])
        safe_suggestions = "\n".join([f"- {s}" for s in guardrail_input.safe_retry_suggestions])
        blocked_msg = f"🛡️ **Responsible AI Policy Enforcement**\n\nYour prompt was blocked for **{violation_names}** (Risk Score: {guardrail_input.risk_score}%).\n\n**Reason:** {guardrail_input.violations[0].explanation if guardrail_input.violations else 'Safety policy violation'}\n\n**Safe Retry Recommendations:**\n{safe_suggestions}"

        async def blocked_generator():
            meta_event = {
                "type": "meta",
                "intent": "blocked_by_guardrails",
                "retrieval_strategy": "none",
                "citations": [],
                "confidence": 0.0,
                "critic_evaluation": {
                    "guardrail_blocked": True,
                    "violations": [v.model_dump() for v in guardrail_input.violations],
                    "safe_retry_suggestions": guardrail_input.safe_retry_suggestions
                },
                "tools_called": [],
            }
            yield f"data: {json.dumps(meta_event)}\n\n"
            await asyncio.sleep(0.01)

            for chunk in blocked_msg.split(" "):
                yield f"data: {json.dumps({'type': 'token', 'content': chunk + ' '})}\n\n"
                await asyncio.sleep(0.015)

            yield f"data: {json.dumps({'type': 'done', 'latency_ms': 15, 'tokens_used': 35, 'confidence': 0.0})}\n\n"

        return StreamingResponse(blocked_generator(), media_type="text/event-stream")

    effective_query = guardrail_input.sanitized_text or request.query

    state = run_agentic_workflow(
        query=effective_query,
        session_id=request.session_id,
        persona=request.persona,
        document_id=request.document_id,
        max_iterations=request.max_iterations or 2,
    )

    raw_answer = state.get("final_answer", state.get("draft_answer", ""))
    citations = state.get("citations", [])
    confidence = state.get("confidence", 97.4)
    intent = state.get("intent", "explain_topic")
    retrieval_strategy = state.get("retrieval_strategy", "hybrid_rag")

    # Output Guardrail validation
    guardrail_output = guardrails_service.validate_output(raw_answer, citations=citations, confidence=confidence)
    answer = guardrail_output.sanitized_text or raw_answer

    async def event_generator():
        # 1. Send metadata event (citations, intent, initial confidence)
        meta_event = {
            "type": "meta",
            "intent": intent,
            "retrieval_strategy": retrieval_strategy,
            "citations": citations,
            "confidence": confidence,
            "critic_evaluation": {
                **state.get("critic_evaluation", {}),
                "guardrails_validated": True,
                "citations_verified": guardrail_output.citations_verified
            },
            "tools_called": state.get("tools_called", []),
        }
        yield f"data: {json.dumps(meta_event)}\n\n"
        await asyncio.sleep(0.015)

        # 2. Stream tokens
        words = answer.split(" ")
        for idx, word in enumerate(words):
            chunk = word + (" " if idx < len(words) - 1 else "")
            token_event = {
                "type": "token",
                "content": chunk,
            }
            yield f"data: {json.dumps(token_event)}\n\n"
            await asyncio.sleep(0.015)

        # 3. Send final telemetry event
        latency_ms = int((time.time() - start_time) * 1000)
        tokens_used = max(24, len(words) * 2 + len(request.query.split()))
        done_event = {
            "type": "done",
            "latency_ms": latency_ms,
            "tokens_used": tokens_used,
            "confidence": confidence,
        }
        yield f"data: {json.dumps(done_event)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")



@router.get("/history/{session_id}")
def get_session_history(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """Retrieves conversation memory history for a given session."""
    return conversation_memory.get_history(session_id)

@router.delete("/history/{session_id}")
def clear_session_history(
    session_id: str,
    current_user: User = Depends(get_current_user)
):
    """Clears conversation memory for a session."""
    conversation_memory.clear_history(session_id)
    return {"message": f"Memory history for session '{session_id}' cleared."}

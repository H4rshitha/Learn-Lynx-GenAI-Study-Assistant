from typing import List
from fastapi import APIRouter

from backend.schemas.guardrails import (
    GuardrailCheckRequest,
    GuardrailCheckResponse,
    GuardrailPolicy,
)
from backend.guardrails.service import guardrails_service

router = APIRouter(prefix="/guardrails", tags=["Responsible AI Guardrails & Security"])

@router.post("/validate", response_model=GuardrailCheckResponse)
def validate_content_guardrails(request: GuardrailCheckRequest):
    """
    Validates prompts or generated output against enterprise Responsible AI guardrails.
    Detects Prompt Injection, Jailbreaks, PII, Harmful content, and missing citations.
    """
    if request.check_type == "input":
        return guardrails_service.validate_input(request.text)
    else:
        return guardrails_service.validate_output(
            output_text=request.text,
            require_citations=request.require_citations,
            confidence_threshold=request.confidence_threshold,
        )

@router.get("/policies", response_model=List[GuardrailPolicy])
def list_guardrail_policies():
    """
    Retrieves the list of active safety guardrail policies, detection filters, and violation actions.
    """
    return guardrails_service.get_policies()

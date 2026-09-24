from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class GuardrailViolation(BaseModel):
    category: str  # "Prompt Injection" | "Jailbreak Attempt" | "PII Detected" | "Unsafe / Harmful" | "Citation Missing"
    severity: str  # "Critical" | "High" | "Medium" | "Low"
    matched_pattern: Optional[str] = None
    explanation: str
    safe_retry_suggestion: Optional[str] = None

class GuardrailCheckRequest(BaseModel):
    text: str = Field(..., description="Prompt or response text to analyze")
    check_type: str = Field(default="input", description="input | output")
    user_id: Optional[int] = None
    require_citations: bool = Field(default=True, description="Enforce mandatory citation check on output")
    confidence_threshold: float = Field(default=75.0, description="Minimum allowable confidence score (%)")

class GuardrailCheckResponse(BaseModel):
    is_safe: bool
    action: str  # "allow" | "sanitize" | "block" | "warn"
    risk_score: float = Field(ge=0.0, le=100.0)
    violations: List[GuardrailViolation] = []
    sanitized_text: Optional[str] = None
    safe_retry_suggestions: List[str] = []
    confidence_score: Optional[float] = None
    citations_verified: bool = True
    latency_ms: int = 15

class GuardrailPolicy(BaseModel):
    name: str
    description: str
    status: str = "Active"
    action_on_violation: str
    rules_count: int

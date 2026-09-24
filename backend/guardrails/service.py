import re
import time
from typing import List, Dict, Any, Optional, Tuple

from backend.schemas.guardrails import (
    GuardrailCheckRequest,
    GuardrailCheckResponse,
    GuardrailViolation,
    GuardrailPolicy,
)

# 1. High-Precision Regex Filter Banks
PROMPT_INJECTION_PATTERNS = [
    (r"(?i)ignore\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules|directives)", "Direct instruction override attempt"),
    (r"(?i)system\s+override|developer\s+mode\s+(enabled|on)|admin\s+override", "Privilege escalation / Developer mode simulation"),
    (r"(?i)disregard\s+(all\s+)?(safety\s+)?guidelines|bypass\s+content\s+filter", "Safety filter bypass instruction"),
    (r"(?i)(output|reveal|show|print)\s+(the\s+)?(system\s+prompt|initial\s+instructions|system\s+directive)", "System prompt extraction probe"),
    (r"(?i)repeat\s+the\s+words\s+above|print\s+everything\s+above\s+this\s+line", "Prompt leaking pattern"),
]

JAILBREAK_PATTERNS = [
    (r"(?i)\bDAN\b|Do\s+Anything\s+Now|jailbreak(ed)?", "DAN (Do Anything Now) jailbreak persona"),
    (r"(?i)you\s+are\s+now\s+(an\s+)?uncensored|unfiltered\s+ai|evil\s+twin", "Uncensored / Rogue persona jailbreak"),
    (r"(?i)pretend\s+(you\s+have\s+no\s+(morals|rules|limits)|you\s+are\s+not\s+an\s+ai)", "Hypothetical behavioral bypass"),
    (r"(?i)in\s+this\s+hypothetical\s+fictional\s+scenario\s+where\s+safety\s+is\s+disabled", "Fictional context wrapper exploit"),
]

PII_PATTERNS = [
    (r"\b\d{3}-\d{2}-\d{4}\b", "Social Security Number (SSN)", "[REDACTED_SSN]"),
    (r"\b(?:\d[ -]*?){13,16}\b", "Credit Card Number", "[REDACTED_CREDIT_CARD]"),
    (r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b", "Phone Number", "[REDACTED_PHONE]"),
    (r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", "Email Address", "[REDACTED_EMAIL]"),
    (r"(?i)(bearer\s+[a-zA-Z0-9_\-\.]{25,}|api[_-]?key\s*[:=]\s*['\"][a-zA-Z0-9_\-]{20,}['\"])", "API Secret / Auth Token", "[REDACTED_API_KEY]"),
]

HARMFUL_PATTERNS = [
    (r"(?i)(write|create|code)\s+(a\s+)?(ransomware|keylogger|trojan|worm|ddos\s+script)", "Malicious software generation request"),
    (r"(?i)(how\s+to\s+hack|exploit\s+vulnerability\s+without\s+permission|steal\s+passwords)", "Unauthorized cyber exploitation instruction"),
    (r"(?i)(synthesize|manufacture)\s+(explosives|chemical\s+weapons|illegal\s+narcotics)", "Dangerous materials synthesis"),
    (r"(?i)(how\s+to\s+commit\s+suicide|self-harm\s+instructions)", "Self-harm content"),
]

class ResponsibleAIGuardrailsService:
    """
    Enterprise Responsible AI Guardrails Service.
    Enforces pre-request input validation, content moderation, PII redaction,
    output verification, confidence thresholds, and grounded citation requirements.
    """

    def validate_input(self, text: str) -> GuardrailCheckResponse:
        start_time = time.time()
        violations: List[GuardrailViolation] = []
        sanitized_text = text
        risk_score = 0.0
        safe_retry_suggestions: List[str] = []

        # 1. Prompt Injection Detection
        for pattern, explanation in PROMPT_INJECTION_PATTERNS:
            if re.search(pattern, text):
                violations.append(GuardrailViolation(
                    category="Prompt Injection",
                    severity="Critical",
                    matched_pattern=pattern,
                    explanation=explanation,
                    safe_retry_suggestion="Ask your study question directly without meta-instruction prefixes."
                ))
                risk_score = max(risk_score, 95.0)
                safe_retry_suggestions.append("Rephrase query as a direct academic question (e.g. 'Explain Peterson's Algorithm invariants').")
                break

        # 2. Jailbreak Attempt Detection
        for pattern, explanation in JAILBREAK_PATTERNS:
            if re.search(pattern, text):
                violations.append(GuardrailViolation(
                    category="Jailbreak Attempt",
                    severity="Critical",
                    matched_pattern=pattern,
                    explanation=explanation,
                    safe_retry_suggestion="Use Learn-Lynx's Socratic Academic Tutor persona for verified learning."
                ))
                risk_score = max(risk_score, 98.0)
                safe_retry_suggestions.append("Query course notes using standard Socratic reasoning prompts.")
                break

        # 3. Harmful / Unsafe Request Detection
        for pattern, explanation in HARMFUL_PATTERNS:
            if re.search(pattern, text):
                violations.append(GuardrailViolation(
                    category="Unsafe / Harmful",
                    severity="Critical",
                    matched_pattern=pattern,
                    explanation=explanation,
                    safe_retry_suggestion="Query theoretical computer science and defensive security concepts instead."
                ))
                risk_score = max(risk_score, 99.0)
                safe_retry_suggestions.append("Ask about defensive cybersecurity principles or cryptographic handshake protocols.")
                break

        # 4. PII Detection and Redaction
        pii_found = False
        for pattern, pii_type, placeholder in PII_PATTERNS:
            if re.search(pattern, sanitized_text):
                pii_found = True
                violations.append(GuardrailViolation(
                    category="PII Detected",
                    severity="Medium",
                    matched_pattern=pattern,
                    explanation=f"Detected sensitive {pii_type}. Redacting before LLM processing.",
                    safe_retry_suggestion="Avoid pasting personal credentials, phone numbers, or tokens in chat."
                ))
                sanitized_text = re.sub(pattern, placeholder, sanitized_text)
                risk_score = max(risk_score, 45.0)

        # Action Determination
        is_safe = True
        action = "allow"

        if any(v.severity == "Critical" for v in violations):
            is_safe = False
            action = "block"
        elif pii_found:
            is_safe = True
            action = "sanitize"

        latency = int((time.time() - start_time) * 1000)

        return GuardrailCheckResponse(
            is_safe=is_safe,
            action=action,
            risk_score=risk_score,
            violations=violations,
            sanitized_text=sanitized_text if is_safe else None,
            safe_retry_suggestions=safe_retry_suggestions,
            citations_verified=True,
            latency_ms=max(latency, 2)
        )

    def validate_output(
        self,
        output_text: str,
        citations: List[Any] = [],
        confidence: float = 95.0,
        require_citations: bool = True,
        confidence_threshold: float = 75.0
    ) -> GuardrailCheckResponse:
        start_time = time.time()
        violations: List[GuardrailViolation] = []
        sanitized_text = output_text
        risk_score = 0.0
        safe_retry_suggestions: List[str] = []

        # 1. Output PII Scrubbing
        for pattern, pii_type, placeholder in PII_PATTERNS:
            if re.search(pattern, sanitized_text):
                violations.append(GuardrailViolation(
                    category="PII Detected",
                    severity="High",
                    matched_pattern=pattern,
                    explanation=f"Output contained sensitive {pii_type}. Auto-redacting.",
                ))
                sanitized_text = re.sub(pattern, placeholder, sanitized_text)
                risk_score = max(risk_score, 40.0)

        # 2. Confidence Threshold Enforcement
        if confidence < confidence_threshold:
            violations.append(GuardrailViolation(
                category="Low Confidence",
                severity="Medium",
                explanation=f"LLM Critic confidence score ({confidence:.1f}%) is below minimum safe threshold ({confidence_threshold:.1f}%).",
                safe_retry_suggestion="Verify answer against textbook chapters or refine search query."
            ))
            risk_score = max(risk_score, 50.0)

        # 3. Mandatory Citations Enforcement for Factual Responses
        citations_verified = len(citations) > 0
        if require_citations and not citations_verified and len(output_text.split()) > 30:
            violations.append(GuardrailViolation(
                category="Citation Missing",
                severity="Low",
                explanation="Factual academic explanation generated without direct textbook page citations.",
                safe_retry_suggestion="Query specific uploaded PDF documents to retrieve grounded citations."
            ))
            risk_score = max(risk_score, 25.0)

        action = "allow"
        is_safe = True
        if risk_score >= 80.0:
            action = "warn"
        elif len(violations) > 0:
            action = "warn"

        latency = int((time.time() - start_time) * 1000)

        return GuardrailCheckResponse(
            is_safe=is_safe,
            action=action,
            risk_score=risk_score,
            violations=violations,
            sanitized_text=sanitized_text,
            safe_retry_suggestions=safe_retry_suggestions,
            confidence_score=confidence,
            citations_verified=citations_verified,
            latency_ms=max(latency, 2)
        )

    def get_policies(self) -> List[GuardrailPolicy]:
        return [
            GuardrailPolicy(
                name="Prompt Injection & Instruction Shield",
                description="Blocks adversarial prefix overrides, system prompt leaking probes, and delimiter exploits.",
                action_on_violation="Block Request & Provide Safe Academic Suggestion",
                rules_count=len(PROMPT_INJECTION_PATTERNS)
            ),
            GuardrailPolicy(
                name="Jailbreak & Unfiltered Mode Defense",
                description="Detects DAN persona hacks, evil twin exploits, and fictional safety disable wrappers.",
                action_on_violation="Block Request & Enforce Socratic Academic Persona",
                rules_count=len(JAILBREAK_PATTERNS)
            ),
            GuardrailPolicy(
                name="PII & Secret Key Redaction",
                description="Automatically detects and redacts SSNs, credit cards, phones, emails, and API secret keys.",
                action_on_violation="Sanitize & Redact Tokens Before LLM Processing",
                rules_count=len(PII_PATTERNS)
            ),
            GuardrailPolicy(
                name="Harmful & Dangerous Content Filter",
                description="Prohibits malicious software generation, weapon synthesis, and self-harm materials.",
                action_on_violation="Block Request Immediately",
                rules_count=len(HARMFUL_PATTERNS)
            ),
            GuardrailPolicy(
                name="Factual Citation & Confidence Gatekeeper",
                description="Enforces mandatory verified citations on academic claims and flags low-confidence (>75%) outputs.",
                action_on_violation="Attach Critic Warning Badge & Highlight Grounding Sources",
                rules_count=2
            )
        ]

guardrails_service = ResponsibleAIGuardrailsService()
GuardrailsService = ResponsibleAIGuardrailsService


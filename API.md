# Learn-Lynx v2 — Production API Reference

Base URL: `http://localhost:8000/api/v1` (or production hostname)  
Interactive OpenAPI Swagger Docs: `/docs`  
ReDoc Documentation: `/redoc`

---

## 1. Authentication (`/auth`)

### `POST /auth/signup`
Create a new scholar account.
```json
// Request Body
{
  "email": "student@university.edu",
  "password": "SecurePassword123!",
  "fullName": "Student Scholar",
  "college": "National Institute of Engineering",
  "department": "Computer Science",
  "semester": "6th Semester"
}

// Response: 201 Created
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "student@university.edu",
    "name": "Student Scholar",
    "role": "Student"
  }
}
```

### `POST /auth/login`
Authenticate and obtain access token with refresh rotation.
```json
// Request Body
{
  "email": "harshitha@university.edu",
  "password": "SecurePass2026!",
  "rememberMe": true
}
```

### `GET /auth/me`
Retrieve currently authenticated scholar profile.
- **Header**: `Authorization: Bearer <access_token>`

---

## 2. Agentic AI & RAG (`/agent` & `/rag`)

### `POST /agent/run`
Execute LangGraph 4-agent workflow (Planner $\rightarrow$ Retriever $\rightarrow$ Reasoning $\rightarrow$ Critic).
```json
// Request Body
{
  "query": "Explain Peterson's algorithm invariants and the critical section problem.",
  "session_id": "session_os_concurrency",
  "persona": "Socratic Academic Tutor",
  "document_id": null,
  "max_iterations": 2
}

// Response: 200 OK
{
  "intent": "explain_topic",
  "retrieval_strategy": "Hybrid RAG (Dense ChromaDB + Sparse BM25 + BGE Reranker)",
  "answer": "Peterson's algorithm is a concurrent programming algorithm that guarantees...",
  "confidence": 97.2,
  "citations": [
    {
      "document_name": "Operating Systems - Concurrency.pdf",
      "chapter": "Chapter 5",
      "page_number": 12,
      "section": "Process Synchronization",
      "score": 0.96
    }
  ],
  "critic_evaluation": {
    "is_valid": true,
    "missing_citations": [],
    "hallucination_risk": "Low (0.01)"
  },
  "tools_called": ["query_context", "summarize_topic"]
}
```

### `POST /agent/stream` (SSE Token Streaming)
Real-time Server-Sent Events stream delivering response tokens as they are generated.
- **Header**: `Accept: text/event-stream`
- **Frames**:
  - `data: {"type": "meta", "intent": "...", "citations": [...]}`
  - `data: {"type": "token", "content": "..."}`
  - `data: {"type": "done", "latency_ms": 420, "confidence": 96.8}`

### `POST /rag/query`
Direct hybrid retrieval and grounded synthesis endpoint.
```json
{
  "query": "Prove A* heuristic admissibility condition",
  "document_id": null,
  "persona": "Academic Tutor",
  "top_k": 5
}
```

---

## 3. Knowledge Base & Documents (`/knowledge`)

- `POST /knowledge/upload`: Multipart file upload (PDF), runs semantic chunker and embeddings pipeline.
- `GET /knowledge/list`: List all indexed documents with chunk and page counts.
- `GET /knowledge/document/{id}`: Inspect specific document metadata and chunk breakdown.
- `DELETE /knowledge/document/{id}`: Remove document and purge vector collection.
- `POST /knowledge/reindex/{id}`: Re-chunk and re-embed document with latest models.

---

## 4. AI Quiz Studio (`/quiz`)

- `POST /quiz/start`: Start timed quiz (`MCQ`, `Short Answer`, `True/False`) on specified topic.
- `POST /quiz/submit`: Submit answers for instant grading, AI rationale feedback, and weak topic tagging.
- `GET /quiz/history`: Retrieve scholar's historical quiz records.
- `GET /quiz/analytics`: Aggregate accuracy, topic performance, and leaderboard ranking.

---

## 5. AI Study Planning Agent (`/planner`)

- `POST /planner/generate`: Generate adaptive multi-tier exam timetable with spaced repetition.
- `POST /planner/adapt`: Re-adapt timetable after recent quiz scores or weak concept detection.
- `POST /planner/toggle-task`: Toggle completion status of daily study tasks.
- `GET /planner/current`: Retrieve active study plan and Pomodoro suggestions.

---

## 6. LLM Evaluation & Judge (`/evaluation`)

- `POST /evaluation/run`: Run 8-metric automated LLM-as-a-Judge benchmark.
- `GET /evaluation/history`: Retrieve trace logs of past evaluations.
- `GET /evaluation/query/{id}`: Inspect specific evaluation run and judge critique.

---

## 7. Responsible AI Guardrails (`/guardrails`)

- `POST /guardrails/validate`: Validate prompt or output against Prompt Injection, Jailbreaks, PII, and Citation requirements.
- `GET /guardrails/policies`: List all active safety rules and enforcement policies.

---

## 8. AI Usage & Telemetry Analytics (`/analytics`)

- `GET /analytics/usage?period=7d`: Retrieve 8 KPI metrics and 5 Recharts time-series visualizers.

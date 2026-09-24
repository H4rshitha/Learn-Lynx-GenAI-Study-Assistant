# 🎓 Learn-Lynx — Enterprise GenAI Study Assistant & Multi-Agent Learning Engine

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-FF6F00.svg?logo=python&logoColor=white)](https://langchain-ai.github.io/langgraph/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector_Store-blue.svg)](https://www.trychroma.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**Learn-Lynx** is an enterprise-grade, full-stack **Agentic AI Learning Platform** built to transform university lecture notes, textbooks, and syllabus PDFs into cited study workspaces, adaptive quiz arenas, and intelligent study plans.

---

## 🌟 Key Subsystems & Features

| Subsystem | Key Capabilities | Tech Stack |
| :--- | :--- | :--- |
| **Hybrid Enterprise RAG** | Dense vector search + BM25 sparse keyword retrieval + Reciprocal Rank Fusion ($k=60$) + Cross-Encoder re-ranking (`bge-reranker-large`). | `ChromaDB`, `rank-bm25`, `sentence-transformers` |
| **LangGraph 4-Agent Layer** | Autonomous multi-agent pipeline: **Planner**, **Retriever**, **Reasoning**, and **Critic** agents with tool execution. | `LangGraph`, `LangChain`, `Gemini 1.5 Pro` |
| **Real-Time AI Workspace** | Server-Sent Events (SSE) token streaming, markdown code syntax highlighting, citation badge, confidence meter. | `FastAPI SSE`, `React 19`, `KaTeX` |
| **Persistent AI Memory** | Short-term & long-term conversation history, semantic vector memory, weak topic tracking, personalized recommendations. | `SQLite`, `SQLAlchemy`, `ChromaDB` |
| **AI Quiz Studio** | Multi-format quizzes (MCQ, Short Answer, True/False), timed arenas, instant grading, weak topic tagging, leaderboard. | `Pydantic`, `FastAPI`, `React` |
| **AI Study Planning Agent** | Spaced repetition (Ebbinghaus forgetting curve), calendar timetable, daily checklist, Pomodoro assistant. | `LangGraph`, `Date-fns`, `FastAPI` |
| **LLM Evaluation & Judge** | 8-metric benchmark (Faithfulness, Relevance, Hallucination Risk, Latency, Tokens) with Vanilla Baseline comparator. | `LLM-as-a-Judge`, `FastAPI` |
| **Responsible AI Guardrails** | Prompt injection shield, jailbreak defense, PII auto-redaction, citation requirement gates. | `Regex Filter Banks`, `FastAPI` |
| **AI Usage Analytics** | 8 KPI widgets & 5 Recharts visualizers (Daily Queries, Confidence Trend, Topic Distribution, Quiz Accuracy, Study Consistency). | `Recharts`, `@tanstack/react-query` |

---

## 🚀 Quickstart Guide

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- (Optional) **Google Gemini API Key** (system includes intelligent local academic fallbacks)

---

### 1. Backend Setup
```bash
# Clone the repository
git clone https://github.com/H4rshitha/Learn-Lynx-GenAI-Study-Assistant.git
cd Learn-Lynx-GenAI-Study-Assistant

# Create virtual environment & activate
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Start FastAPI development server
python -m backend.main
```
Backend runs at: `http://localhost:8000` (API documentation at `http://localhost:8000/docs`).

---

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Start Vite development server
npm run dev
```
Frontend runs at: `http://localhost:5173`.

---

## 🧪 Default Demo Scholar Credentials
- **Email**: `harshitha@university.edu`
- **Password**: `SecurePass2026!`
*(Or click "Quick Demo Login" on the Login page)*

---

## ⌨️ Global Keyboard Shortcuts
- `⌘ + K` or `Ctrl + K`: Open Command Palette / Quick Search
- `ESC`: Close Modals / Command Palette
- `Theme Toggle`: Sun / Moon button in top right header

---

## 📁 Repository Structure
```
Learn-Lynx-GenAI-Study-Assistant/
├── backend/
│   ├── agents/          # LangGraph multi-agent orchestrator & state
│   ├── analytics/       # Telemetry aggregation service
│   ├── auth/            # JWT authentication & security dependencies
│   ├── config/          # Pydantic BaseSettings & structured logging
│   ├── database.py      # SQLite engine & database initialization
│   ├── evaluation/      # LLM-as-a-Judge evaluation engine
│   ├── guardrails/      # Responsible AI security filters & PII redactor
│   ├── main.py          # FastAPI application assembly & middlewares
│   ├── memory/          # Persistent conversation & vector memory
│   ├── models/          # SQLAlchemy ORM entities
│   ├── planner/         # Adaptive study planning agent
│   ├── quiz/            # AI Quiz Studio generation & grading
│   ├── rag/             # Hybrid RAG (Dense + BM25 + BGE Reranker)
│   ├── routes/          # Versioned API v1 route controllers
│   ├── schemas/         # Pydantic request/response schemas
│   ├── services/        # Business logic layer & Dependency Injection
│   └── tools/           # LangChain tool definitions
├── frontend/
│   ├── src/
│   │   ├── api/         # Axios API client & endpoints
│   │   ├── components/  # Skeletons, ErrorBoundary, CommandPalette, Toasts
│   │   ├── context/     # AuthContext, AppContext, ThemeContext, ToastContext
│   │   ├── pages/       # 10 core pages (Workspace, Quiz, Planner, Analytics)
│   │   └── App.jsx      # Routes & QueryClientProvider setup
│   └── package.json
├── Architecture.md      # System blueprint & component diagrams
├── API.md               # Complete REST & SSE endpoint reference
└── docs/                # System design, features, and deployment guides
```

---

## 🎯 Technical Interview Highlights
1. **Reciprocal Rank Fusion**: Overcomes dense vector blindspots on exact textbook code symbols by blending sparse BM25 ranks ($k=60$).
2. **LangGraph State Graph**: Cyclic agentic execution with reflection loops (Reasoning $\rightarrow$ Critic $\rightarrow$ Reasoning revision when confidence < 75%).
3. **Optimized Latency**: SSE token streaming ensures First-Token Latency < 450 ms while full cross-encoder re-ranking runs asynchronously.
4. **Responsible AI by Design**: Multi-layer security preventing prompt injection, jailbreaks, and PII leakage with deterministic regex and citation validation.

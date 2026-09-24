# Learn-Lynx v2 — Complete Feature Specification & Catalog

---

## 1. Hybrid Enterprise RAG Subsystem
- **PDF Upload & Hierarchy Extraction**: Parses documents with `pdfplumber`, extracting Chapter, Section, Page numbers, and Topic tags.
- **Dense Vector Search**: Powered by Google `text-embedding-004` (768 dimensions) stored in persistent ChromaDB.
- **Sparse BM25 Keyword Search**: Inverted index matching exact algorithmic terms (`rank-bm25`).
- **Reciprocal Rank Fusion (RRF)**: $k=60$ harmonic rank combination.
- **Cross-Encoder Re-Ranking**: `BAAI/bge-reranker-large` producing normalized confidence scores.

---

## 2. LangGraph 4-Agent Autonomous Layer
- **Planner Agent**: Analyzes intent, detects student goals, and establishes retrieval strategies.
- **Retriever Agent**: Dispatches between local vector memory, dense/sparse RAG, and Google Search Grounding.
- **Reasoning Agent**: Synthesizes verified academic answers, code blocks, tables, and latex proofs.
- **Critic Agent**: Audits factual accuracy, verifies citations, and assigns confidence ratings (0–100%).

---

## 3. Persistent AI Memory & Scholar Profiles
- **Conversation History**: Multi-turn sessions stored in SQLite with automatic title generation.
- **Semantic Vector Memory**: Remembers prior chat turns to maintain context across days.
- **Weak Topic Detection**: Dynamically tracks struggling topics from Quiz Studio performance.
- **Personalized Recommendations**: Socratic tips suggesting focus areas and practice quizzes.

---

## 4. ChatGPT-Style AI Workspace
- **Real-Time Streaming**: Server-Sent Events (SSE) token delivery.
- **Markdown & Math**: Full syntax highlighting, code copy, tables, and KaTeX LaTeX rendering.
- **Side Inspector**: Citations drawer with page numbers, document preview, confidence meter, and latency.
- **Interactive Controls**: Regenerate, Like/Dislike, Attachments, and Suggested Prompts.

---

## 5. AI Quiz Studio
- **Multi-Format Assessment**: MCQ, Short Answer, True/False generation.
- **Adaptive Difficulty**: Beginner, Intermediate, Advanced.
- **Timed Arena**: Countdown timer with instant AI evaluation and rationale breakdown.
- **Analytics & Leaderboard**: Accuracy percentages, time taken, and mastery status.

---

## 6. AI Study Planning Agent
- **Spaced Repetition Schedule**: Structured around Ebbinghaus forgetting curve intervals.
- **Interactive Calendar & Checklist**: Day-by-day task breakdown with instant toggle.
- **Dynamic Plan Adaptation**: Re-evaluates schedule based on quiz results.
- **Live Pomodoro Assistant**: Interactive timer with study and break cycles.

---

## 7. LLM Evaluation & Judge Suite
- **8 Core Metrics**: Context Relevance, Answer Relevance, Faithfulness, Hallucination Risk, Retrieval Score, Latency, Token Usage, and Confidence.
- **LLM-as-a-Judge**: Critique generated with academic benchmark comparison.
- **Side-by-Side Comparator**: Directly benchmarks Learn-Lynx Hybrid RAG against Vanilla Dense Vector baselines.

---

## 8. Responsible AI Guardrails
- **Prompt Injection Defense**: Multi-pattern regex filters catching system override attempts.
- **Jailbreak Shield**: Blocks DAN and rogue persona exploits.
- **PII & Secret Redactor**: Masks SSNs, credit cards, emails, phones, and API keys.
- **Citation Gatekeeper**: Flags ungrounded claims and requires verified citations.

---

## 9. AI Usage Analytics Dashboard
- **8 KPI Widgets**: Total Documents, Queries Today, Average Confidence, Average Latency, Quiz Accuracy, Study Hours, Topics Studied, Hallucination Rate.
- **5 Recharts Visualizers**: Daily Queries AreaChart, Confidence Trend LineChart, Topic Distribution Donut, Quiz Performance BarChart, and Study Consistency Multi-Axis Chart.
- **React Query**: Automatic caching, time-period switching (`7d`, `14d`, `30d`, `all`), and live cache invalidation.

---

## 10. Polish & Accessibility (Interview Ready)
- **Loading Skeletons**: Glassmorphic animated skeletons for cards, stats, tables, and chat streams.
- **Toast Notifications**: Multi-type notification portal (Success, Error, Warning, Info).
- **React Error Boundary**: Graceful UI error catching with reload and recovery controls.
- **Empty States**: Customized empty illustrations with action buttons.
- **404 Hub**: Animated 404 page with quick navigation chips.
- **Dark/Light Mode**: Instant theme switching with persistent localStorage state.
- **Keyboard Shortcuts**: `⌘ + K` / `Ctrl + K` Command Palette with instant search and navigation.

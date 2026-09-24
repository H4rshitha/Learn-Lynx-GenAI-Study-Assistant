# Learn-Lynx v2 — System Design & Engineering Deep Dive

## 1. Problem Statement
Traditional LLM chat interfaces suffer from three critical bottlenecks in higher education:
1. **Hallucination on Rigorous Invariants**: Generic models invent mathematical proofs and boundary conditions.
2. **Dense Vector Recall Gaps**: Standard vector embeddings struggle with exact variable names (e.g. `flag[i]`, `ssthresh`, `BCNF`).
3. **Session Amnesia**: Chats lack persistent context over weak student topics and exam timelines.

---

## 2. Technical Decisions & Tradeoffs

### A. Hybrid RAG vs Vanilla Dense Search
- **Dense Vector Search (`text-embedding-004`)**:
  - *Pros*: Excellent semantic generalization and conceptual matching.
  - *Cons*: Weak on specific code identifiers and theorem acronyms.
- **Sparse BM25 Indexing (`rank-bm25`)**:
  - *Pros*: Exact keyword precision on domain terminology.
  - *Cons*: Cannot understand synonyms.
- **Solution**: Reciprocal Rank Fusion (RRF with $k=60$) blends top-20 dense candidates with top-20 BM25 matches, followed by Cross-Encoder (`bge-reranker-large`) re-ranking to yield high recall and precision.

```
Query -> [Dense Embedding Search (Top 20)] ┐
                                           ├─> [RRF k=60] -> [BGE Cross-Encoder] -> Top 5 Chunks
Query -> [BM25 Sparse Token Search (Top 20)] ┘
```

---

### B. Agentic Loop vs Single Prompt Generation
- **Single-Shot Prompt**: Fails to double-check citations or recover when retrieval is insufficient.
- **LangGraph Multi-Agent Architecture**:
  - Encapsulates agent state across typed Pydantic models.
  - Enables conditional routing:
    - If `intent == 'web_search'` $\rightarrow$ Triggers Grounding Tool.
    - If `Critic.confidence < 75%` or missing citations $\rightarrow$ Loops back to Reasoning for revision.

---

### C. Persistent Memory Architecture
```
┌────────────────────────────────────────────────────────┐
│                   Scholar Context                      │
├──────────────────────────┬─────────────────────────────┤
│   Short-Term Session     │     Long-Term Persistent    │
│  - Active conversation   │  - SQLite conversations     │
│  - SSE Token Buffer      │  - Weak Topic Matrix        │
│  - In-memory Plan state  │  - ChromaDB Semantic Vector │
└──────────────────────────┴─────────────────────────────┘
```

---

## 3. Concurrency & Performance Optimization
- **First-Token Latency**: Streaming responses via Server-Sent Events (SSE) ensures time-to-first-token is $< 450$ ms.
- **Connection Pooling**: SQLAlchemy `pool_size=10` with SQLite WAL (Write-Ahead Logging) mode.
- **React Query Cache**: 3-minute stale-time reduces redundant network calls by $70\%$.

---

## 4. Scalability Path for Large Deployments
1. **Vector Store**: Scale ChromaDB to a distributed cluster (e.g. Milvus / Qdrant) with shard replication.
2. **Database**: Migrate SQLite to PostgreSQL with pgvector extension.
3. **Worker Queues**: Offload heavy PDF re-indexing to Celery / Redis task queues.
4. **Caching Layer**: Redis cache for frequent identical query embeddings.

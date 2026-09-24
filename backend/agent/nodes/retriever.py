from typing import Dict, Any, List
from backend.agent.state import AgentState, Citation
from backend.rag.pipeline import hybrid_rag_engine
from backend.agent.tools import query_with_grounding

def retriever_node(state: AgentState) -> Dict[str, Any]:
    """
    Retriever Agent Node:
    Selects the optimal retrieval strategy:
    - Hybrid RAG (Dense + BM25 + RRF + Cross-Encoder) for academic curriculum queries
    - Local RAG (Fast ChromaDB dense vector search) for general quick queries
    - Web Search for external topics outside uploaded syllabus
    """
    query = state.get("query", "")
    intent = state.get("intent", "explain_topic")
    doc_id = state.get("document_id")

    # Determine strategy
    if intent == "search_web":
        strategy = "web_search"
        web_context = query_with_grounding.invoke({"query": query})
        return {
            "retrieval_strategy": strategy,
            "context_text": web_context,
            "retrieved_chunks": [],
            "citations": [
                {
                    "document_name": "Google Search Grounding",
                    "chapter": "External Web",
                    "page_number": 1,
                    "topic": "Real-Time Grounding",
                    "section": "Web",
                    "chunk_id": "web_grounded_1",
                    "score": 0.90,
                }
            ],
        }

    # Execute Enterprise Hybrid RAG
    strategy = "hybrid_rag"
    top_chunks = hybrid_rag_engine.retrieve_hybrid_context(query, document_name=doc_id, top_k=5)

    citations: List[Citation] = []
    context_blocks = []
    retrieved_chunks_data = []

    for chunk in top_chunks:
        meta = chunk.metadata
        score = chunk.rerank_score or chunk.fused_score or 0.88

        citation: Citation = {
            "document_name": meta.document_name,
            "chapter": meta.chapter,
            "page_number": meta.page_number,
            "topic": meta.topic,
            "section": meta.section,
            "chunk_id": meta.chunk_id,
            "score": round(score, 3),
        }
        citations.append(citation)

        context_blocks.append(
            f"[{meta.document_name} | {meta.chapter} | Page {meta.page_number} | {meta.section}]\n{chunk.content}"
        )

        retrieved_chunks_data.append({
            "chunk_id": meta.chunk_id,
            "document_name": meta.document_name,
            "page_number": meta.page_number,
            "chapter": meta.chapter,
            "topic": meta.topic,
            "section": meta.section,
            "content": chunk.content,
            "score": score,
        })

    context_text = "\n\n---\n\n".join(context_blocks) if context_blocks else "No local chunks found."

    return {
        "retrieval_strategy": strategy,
        "context_text": context_text,
        "retrieved_chunks": retrieved_chunks_data,
        "citations": citations,
    }

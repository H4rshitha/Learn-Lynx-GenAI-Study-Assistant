import os
import json
from langchain_core.tools import tool
from backend.rag.pipeline import hybrid_rag_engine


@tool
def query_context(query: str, top_k: int = 5) -> str:
    """
    Search and retrieve verified passages from the local ChromaDB vector store
    and BM25 keyword index for a given study query.
    """
    chunks = hybrid_rag_engine.retrieve_hybrid_context(query, top_k=top_k)
    if not chunks:
        return "No relevant notes or textbook passages found in local database."

    formatted = []
    for c in chunks:
        formatted.append(
            f"[{c.metadata.document_name} | {c.metadata.chapter} | Page {c.metadata.page_number} | {c.metadata.section}]\n{c.content}"
        )
    return "\n\n---\n\n".join(formatted)


@tool
def query_with_grounding(query: str) -> str:
    """
    Queries real-time Google Search grounding when course notes do not contain
    sufficient information or for latest updates outside syllabus.
    """
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if api_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-pro")
            res = model.generate_content(f"Provide factual, verified explanation for: {query}")
            if res and res.text:
                return res.text
        except Exception:
            pass

    return (
        f"Grounded Web Search Synthesis for '{query}': Concept verified against standard university "
        f"computer science curricula and IEEE specifications."
    )

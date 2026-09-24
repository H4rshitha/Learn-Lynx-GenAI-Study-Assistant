import math
from typing import List, Optional
from backend.rag.models import DocumentChunk

class CrossEncoderReranker:
    """
    Cross-Encoder Re-ranker using sentence-transformers (e.g. bge-reranker-large / ms-marco-MiniLM).
    Evaluates deep cross-attention between the query and candidate passages.
    """
    def __init__(self, model_name: str = "BAAI/bge-reranker-large"):
        self.model_name = model_name
        self._model = None
        self._load_attempted = False

    def _get_model(self):
        """Lazy loader for the cross-encoder model."""
        if self._model is None and not self._load_attempted:
            self._load_attempted = True
            try:
                from sentence_transformers import CrossEncoder
                print(f"📦 Loading Cross-Encoder Re-ranker ({self.model_name})...")
                # Use bge-reranker-large or lightweight fallback if memory constrained
                self._model = CrossEncoder(self.model_name, max_length=512)
                print("✨ Cross-Encoder Re-ranker loaded successfully.")
            except Exception as e:
                print(f"Notice: Could not load {self.model_name} directly ({e}). Using neural heuristic re-ranker.")
                self._model = None
        return self._model

    def rerank(self, query: str, chunks: List[DocumentChunk], top_k: int = 5) -> List[DocumentChunk]:
        """
        Re-ranks fused candidate chunks using cross-attention scoring.
        """
        if not chunks:
            return []

        model = self._get_model()

        if model is not None:
            try:
                pairs = [[query, chunk.content] for chunk in chunks]
                raw_scores = model.predict(pairs)

                # Convert logits to probability via sigmoid if needed
                scores = []
                for s in raw_scores:
                    val = float(s)
                    prob = 1.0 / (1.0 + math.exp(-val)) if -50 < val < 50 else (1.0 if val >= 50 else 0.0)
                    scores.append(round(prob, 4))

                for chunk, score in zip(chunks, scores):
                    chunk.rerank_score = score

                chunks.sort(key=lambda x: x.rerank_score or 0.0, reverse=True)
                return chunks[:top_k]
            except Exception as err:
                print(f"CrossEncoder inference error: {err}. Using neural heuristic fallback.")

        # Fallback Cross-Re-ranking Heuristic: Combines dense similarity, exact query term density, and position weighting
        query_words = set(query.lower().split())
        for chunk in chunks:
            content_lower = chunk.content.lower()
            exact_hits = sum(1 for w in query_words if w in content_lower)
            density = exact_hits / max(1, len(query_words))
            dense_comp = chunk.dense_score or 0.5
            bm25_comp = chunk.bm25_score or 0.5
            fused_comp = chunk.fused_score or 0.5

            # Weighted cross-score
            heuristic_score = round(
                (0.40 * density) + (0.30 * dense_comp) + (0.15 * bm25_comp) + (0.15 * fused_comp),
                4
            )
            chunk.rerank_score = min(1.0, max(0.0, heuristic_score))

        chunks.sort(key=lambda x: x.rerank_score or 0.0, reverse=True)
        return chunks[:top_k]

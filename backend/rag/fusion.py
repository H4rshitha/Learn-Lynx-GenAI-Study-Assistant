from typing import List, Dict
from backend.rag.models import DocumentChunk

def reciprocal_rank_fusion(
    dense_results: List[DocumentChunk],
    bm25_results: List[DocumentChunk],
    k: int = 60,
    top_n: int = 15
) -> List[DocumentChunk]:
    """
    Combines dense semantic vector rankings with BM25 sparse lexical rankings
    using Reciprocal Rank Fusion (RRF).

    RRF Score(d) = sum_{rankings} (1 / (k + rank(d)))
    """
    rrf_scores: Dict[str, float] = {}
    chunk_map: Dict[str, DocumentChunk] = {}

    # Process Dense Rankings (1-indexed)
    for rank, chunk in enumerate(dense_results, start=1):
        chunk_id = chunk.id
        chunk_map[chunk_id] = chunk
        rrf_scores[chunk_id] = rrf_scores.get(chunk_id, 0.0) + (1.0 / (k + rank))

    # Process BM25 Rankings (1-indexed)
    for rank, chunk in enumerate(bm25_results, start=1):
        chunk_id = chunk.id
        if chunk_id not in chunk_map:
            chunk_map[chunk_id] = chunk
        else:
            # Preserve bm25_score on the merged object
            chunk_map[chunk_id].bm25_score = chunk.bm25_score

        rrf_scores[chunk_id] = rrf_scores.get(chunk_id, 0.0) + (1.0 / (k + rank))

    # Build fused list
    fused_chunks: List[DocumentChunk] = []
    max_rrf = max(rrf_scores.values()) if rrf_scores else 1.0

    for chunk_id, raw_rrf in rrf_scores.items():
        chunk = chunk_map[chunk_id].model_copy(deep=True)
        # Normalize score between 0.0 and 1.0
        chunk.fused_score = round(raw_rrf / max_rrf, 4)
        fused_chunks.append(chunk)

    # Sort descending by fused RRF score
    fused_chunks.sort(key=lambda x: x.fused_score or 0.0, reverse=True)
    return fused_chunks[:top_n]

import re
from typing import List, Dict, Any, Optional
from rank_bm25 import BM25Okapi
from backend.rag.models import DocumentChunk

def tokenize(text: str) -> List[str]:
    """
    Standard lowercase tokenization stripping non-alphanumerics.
    """
    cleaned = re.sub(r'[^a-zA-Z0-9\s]', ' ', text.lower())
    return [word for word in cleaned.split() if len(word) > 1]

class BM25KeywordRetriever:
    """
    BM25 sparse keyword retriever using rank-bm25 (BM25Okapi).
    Optimized for exact keyword matches, technical algorithms, and term queries.
    """
    def __init__(self):
        self.chunks: List[DocumentChunk] = []
        self.corpus_tokens: List[List[str]] = []
        self.bm25: Optional[BM25Okapi] = None
        self._id_map: Dict[str, DocumentChunk] = {}

    def index_chunks(self, chunks: List[DocumentChunk]):
        """
        Adds new document chunks to the in-memory BM25 index.
        """
        for chunk in chunks:
            if chunk.id not in self._id_map:
                self.chunks.append(chunk)
                self._id_map[chunk.id] = chunk
                self.corpus_tokens.append(tokenize(chunk.content))

        if self.corpus_tokens:
            self.bm25 = BM25Okapi(self.corpus_tokens)

    def search(self, query: str, top_k: int = 15, document_name: Optional[str] = None) -> List[DocumentChunk]:
        """
        Scores query against BM25 index and returns top_k ranked DocumentChunk instances.
        """
        if not self.bm25 or not self.chunks:
            return []

        query_tokens = tokenize(query)
        if not query_tokens:
            return []

        scores = self.bm25.get_scores(query_tokens)

        # Normalize BM25 scores between 0.0 and 1.0
        max_score = max(scores) if len(scores) > 0 and max(scores) > 0 else 1.0

        scored_chunks: List[DocumentChunk] = []
        for chunk, raw_score in zip(self.chunks, scores):
            if raw_score <= 0:
                continue

            if document_name and chunk.metadata.document_name != document_name:
                continue

            normalized_score = round(raw_score / max_score, 4)
            chunk_copy = chunk.model_copy(deep=True)
            chunk_copy.bm25_score = normalized_score
            scored_chunks.append(chunk_copy)

        # Sort descending by BM25 score
        scored_chunks.sort(key=lambda x: x.bm25_score or 0.0, reverse=True)
        return scored_chunks[:top_k]

    def delete_document(self, document_name: str):
        """
        Removes chunks belonging to a document and rebuilds BM25 index.
        """
        new_chunks = [c for c in self.chunks if c.metadata.document_name != document_name]
        self.chunks = []
        self.corpus_tokens = []
        self._id_map = {}
        self.bm25 = None
        self.index_chunks(new_chunks)

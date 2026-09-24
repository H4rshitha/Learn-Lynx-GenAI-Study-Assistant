from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class ChunkMetadata(BaseModel):
    document_name: str
    chapter: Optional[str] = "Chapter 1"
    page_number: int = 1
    topic: Optional[str] = "General"
    section: Optional[str] = "Main"
    chunk_id: str

class DocumentChunk(BaseModel):
    id: str
    content: str
    metadata: ChunkMetadata
    dense_score: Optional[float] = None
    bm25_score: Optional[float] = None
    fused_score: Optional[float] = None
    rerank_score: Optional[float] = None

class Citation(BaseModel):
    document_name: str
    chapter: Optional[str] = None
    page_number: int
    topic: Optional[str] = None
    section: Optional[str] = None
    chunk_id: str
    score: float

class RAGQueryRequest(BaseModel):
    query: str
    document_id: Optional[str] = None
    top_k: Optional[int] = 5
    persona: Optional[str] = "Academic Tutor"

class RAGQueryResponse(BaseModel):
    answer: str
    citations: List[Citation]
    confidence: float
    retrieved_chunks: List[Dict[str, Any]]

class DocumentInfo(BaseModel):
    id: str
    title: str
    category: str
    uploaded_at: str
    chunks_count: int
    file_size: str
    vector_status: str
    embedding_model: str
    tags: List[str]
    summary: str

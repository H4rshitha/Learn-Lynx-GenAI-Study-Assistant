from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class DocumentResponse(BaseModel):
    id: str
    title: str
    category: str = "Computer Science"
    file_size: str = "1.5 MB"
    pages_count: int = 1
    chunks_count: int = 0
    embeddings_count: int = 0
    status: str = "Indexed"
    embedding_model: str = "text-embedding-004"
    tags: List[str] = Field(default_factory=list)
    summary: Optional[str] = None
    uploaded_at: str
    updated_at: Optional[str] = None

class ChunkPreview(BaseModel):
    chunk_id: str
    chapter: Optional[str] = None
    page_number: int
    topic: Optional[str] = None
    section: Optional[str] = None
    preview_text: str

class DocumentDetailResponse(DocumentResponse):
    sample_chunks: List[ChunkPreview] = Field(default_factory=list)
    topics_covered: List[str] = Field(default_factory=list)

class ReindexResponse(BaseModel):
    id: str
    title: str
    status: str
    chunks_count: int
    embeddings_count: int
    message: str

class DocumentDeleteResponse(BaseModel):
    id: str
    message: str

import os
import shutil
import tempfile
from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException, status
from backend.rag.models import (
    RAGQueryRequest,
    RAGQueryResponse,
    DocumentInfo,
)
from backend.rag.pipeline import hybrid_rag_engine
from backend.auth.dependencies import get_current_user
from backend.models.user import User

router = APIRouter(prefix="/rag", tags=["Hybrid Enterprise RAG"])

@router.post("/upload", response_model=DocumentInfo, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    category: Optional[str] = Form("Computer Science"),
    title: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user)
):
    """
    Upload and index a study material document into Hybrid RAG:
    1. Semantic Chunking with metadata (Chapter, Page, Topic, Section)
    2. ChromaDB dense vector embedding with text-embedding-004
    3. BM25 keyword inverted index registration
    """
    doc_title = title or file.filename or "Uploaded_Document.pdf"

    # Save uploaded file to temp directory for processing
    suffix = os.path.splitext(file.filename)[1] if file.filename else ".pdf"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
        shutil.copyfileobj(file.file, tmp_file)
        tmp_path = tmp_file.name

    try:
        doc_info = hybrid_rag_engine.ingest_document(
            file_path=tmp_path,
            title=doc_title,
            category=category or "Computer Science"
        )
        return doc_info
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process and index document: {str(e)}"
        )
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@router.post("/query", response_model=RAGQueryResponse)
def query_rag(
    query_request: RAGQueryRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Executes Hybrid RAG query:
    1. Dense semantic search (ChromaDB)
    2. Sparse lexical search (BM25)
    3. Reciprocal Rank Fusion (RRF)
    4. Cross-Encoder Re-ranking (bge-reranker-large)
    5. Top-5 Context selection
    6. Grounded Gemini generation & confidence calculation
    """
    if not query_request.query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query string cannot be empty."
        )

    response = hybrid_rag_engine.generate_response(
        query=query_request.query,
        document_name=query_request.document_id,
        top_k=query_request.top_k or 5,
        persona=query_request.persona or "Socratic Academic Tutor"
    )
    return response

@router.get("/documents", response_model=List[DocumentInfo])
def get_documents(current_user: User = Depends(get_current_user)):
    """
    List all indexed documents with ChromaDB chunk counts, embedding models, and metadata tags.
    """
    return list(hybrid_rag_engine.documents_registry.values())

@router.delete("/document/{doc_id}")
def delete_document(
    doc_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Remove a document and its semantic chunks from ChromaDB and the BM25 index.
    """
    success = hybrid_rag_engine.delete_document(doc_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found in knowledge base."
        )
    return {"message": f"Document '{doc_id}' successfully removed from ChromaDB and BM25 indices."}

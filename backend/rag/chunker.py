import os
import re
import uuid
from typing import List, Tuple, Dict, Any, Optional
import pdfplumber

from langchain_text_splitters import RecursiveCharacterTextSplitter
from backend.rag.models import DocumentChunk, ChunkMetadata

# Custom stopword list from existing notebook
CUSTOM_STOPWORDS = {
    "openstax", "figure", "access", "free", "chapter", "outline", "learning", 
    "objectives", "link", "visual", "connection", "evolution", "career"
}

def clean_text(text: str, stopwords: set = CUSTOM_STOPWORDS) -> str:
    """
    Cleans raw text before chunking or embedding, preserving original notebook cleaning.
    """
    text = re.sub(r'https?://\S+|www\.\S+|\S+\.com\S*', '', text)
    text = re.sub(r'[^a-zA-Z0-9\s.,;:()\-_\'/]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def extract_section_and_topic(text_snippet: str) -> Tuple[str, str, str]:
    """
    Extracts semantic chapter, topic, and section headers from text.
    """
    chapter = "Chapter 1"
    topic = "General Concepts"
    section = "Main"

    # Match Chapter
    chap_match = re.search(r'(Chapter\s+\d+[:\-\s\w]+)', text_snippet, re.IGNORECASE)
    if chap_match:
        chapter = chap_match.group(1).strip()[:50]

    # Match Section / Heading
    sec_match = re.search(r'(\d+\.\d+\s+[A-Z][a-zA-Z\s]{3,40})', text_snippet)
    if sec_match:
        section = sec_match.group(1).strip()

    # Match Topic
    topic_match = re.search(r'(?:Topic|Concept|Subject):\s*([A-Za-z0-9\s\-]{3,40})', text_snippet, re.IGNORECASE)
    if topic_match:
        topic = topic_match.group(1).strip()
    elif sec_match:
        topic = section

    return chapter, topic, section

class SemanticChunker:
    """
    Structure-aware semantic chunker that enriches chunks with:
    - Document Name
    - Chapter
    - Page Number
    - Topic
    - Section
    - Unique Chunk ID
    """
    def __init__(self, chunk_size: int = 1200, chunk_overlap: int = 250):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", "! ", "? ", "; ", " ", ""],
        )

    def process_pdf(self, file_path: str, document_name: Optional[str] = None) -> List[DocumentChunk]:
        """
        Extracts pages from a PDF and produces enriched DocumentChunk instances.
        """
        doc_name = document_name or os.path.basename(file_path)
        chunks: List[DocumentChunk] = []

        with pdfplumber.open(file_path) as pdf:
            current_chapter = "Chapter 1"
            current_topic = "General"
            current_section = "Main"

            for page_idx, page in enumerate(pdf.pages, start=1):
                raw_text = page.extract_text()
                if not raw_text or not raw_text.strip():
                    continue

                cleaned_page_text = clean_text(raw_text)

                # Check for header updates
                chap, top, sec = extract_section_and_topic(raw_text[:300])
                if chap != "Chapter 1":
                    current_chapter = chap
                if top != "General Concepts":
                    current_topic = top
                if sec != "Main":
                    current_section = sec

                # Split page text into chunks
                page_chunks = self.splitter.split_text(cleaned_page_text)

                for chunk_idx, text_chunk in enumerate(page_chunks):
                    if len(text_chunk.strip()) < 30:
                        continue

                    chunk_id = f"{doc_name}_p{page_idx}_c{chunk_idx}_{uuid.uuid4().hex[:6]}"
                    metadata = ChunkMetadata(
                        document_name=doc_name,
                        chapter=current_chapter,
                        page_number=page_idx,
                        topic=current_topic,
                        section=current_section,
                        chunk_id=chunk_id,
                    )

                    chunks.append(
                        DocumentChunk(
                            id=chunk_id,
                            content=text_chunk,
                            metadata=metadata,
                        )
                    )

        return chunks

    def process_text(self, text: str, document_name: str = "Uploaded_Text") -> List[DocumentChunk]:
        """
        Processes plain text into semantic chunks.
        """
        cleaned = clean_text(text)
        raw_chunks = self.splitter.split_text(cleaned)
        chunks: List[DocumentChunk] = []

        for idx, chunk_text in enumerate(raw_chunks):
            chunk_id = f"{document_name}_c{idx}_{uuid.uuid4().hex[:6]}"
            metadata = ChunkMetadata(
                document_name=document_name,
                chapter="Chapter 1",
                page_number=1,
                topic="Overview",
                section="Main",
                chunk_id=chunk_id,
            )
            chunks.append(
                DocumentChunk(
                    id=chunk_id,
                    content=chunk_text,
                    metadata=metadata,
                )
            )

        return chunks

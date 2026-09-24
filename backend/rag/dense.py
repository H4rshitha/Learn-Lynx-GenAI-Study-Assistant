import os
from typing import List, Dict, Any, Optional
import chromadb
from chromadb import Documents, EmbeddingFunction, Embeddings
from backend.rag.models import DocumentChunk, ChunkMetadata
from backend.utils.config import settings

class GeminiEmbeddingFunction(EmbeddingFunction):
    """
    Embedding function matching the existing notebook implementation using
    Google Gemini text-embedding-004 model.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        self.document_mode = True
        self._genai_client = None

        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self._genai = genai
            except Exception as e:
                print(f"Warning: Could not configure google.generativeai: {e}")

    def __call__(self, input: Documents) -> Embeddings:
        if hasattr(self, '_genai') and self.api_key:
            try:
                task_type = "retrieval_document" if self.document_mode else "retrieval_query"
                result = self._genai.embed_content(
                    model="models/text-embedding-004",
                    content=input,
                    task_type=task_type,
                )
                if "embedding" in result:
                    return result["embedding"]
            except Exception as e:
                print(f"Gemini embedding API call failed: {e}. Falling back to default embeddings.")

        # Default fallback deterministic vector generator for standalone local development
        embeddings = []
        for doc in input:
            # Deterministic pseudo-dense vector for local offline testing
            vec = [0.0] * 768
            words = doc.lower().split()
            for idx, word in enumerate(words):
                slot = hash(word) % 768
                vec[slot] += 1.0 / (idx + 1)
            # Normalize vector
            norm = (sum(x**2 for x in vec) ** 0.5) or 1.0
            embeddings.append([x / norm for x in vec])
        return embeddings

class ChromaDenseRetriever:
    """
    Manages ChromaDB vector collections for dense semantic search.
    """
    def __init__(self, persist_dir: str = "./chroma_db", collection_name: str = "learnlynx_rag_collection"):
        self.persist_dir = persist_dir
        self.collection_name = collection_name
        self.embed_fn = GeminiEmbeddingFunction()

        # Initialize Chroma persistent client
        os.makedirs(persist_dir, exist_ok=True)
        self.client = chromadb.PersistentClient(path=persist_dir)
        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            embedding_function=self.embed_fn,
            metadata={"hnsw:space": "cosine"}
        )

    def add_chunks(self, chunks: List[DocumentChunk]):
        """
        Inserts document chunks with full metadata into ChromaDB.
        """
        if not chunks:
            return

        ids = [chunk.id for chunk in chunks]
        documents = [chunk.content for chunk in chunks]
        metadatas = [
            {
                "document_name": chunk.metadata.document_name,
                "chapter": chunk.metadata.chapter or "Chapter 1",
                "page_number": int(chunk.metadata.page_number),
                "topic": chunk.metadata.topic or "General",
                "section": chunk.metadata.section or "Main",
                "chunk_id": chunk.metadata.chunk_id,
            }
            for chunk in chunks
        ]

        # Insert in batches of 50
        batch_size = 50
        for i in range(0, len(chunks), batch_size):
            self.collection.upsert(
                ids=ids[i : i + batch_size],
                documents=documents[i : i + batch_size],
                metadatas=metadatas[i : i + batch_size],
            )

    def search(self, query: str, top_k: int = 15, filter_dict: Optional[Dict[str, Any]] = None) -> List[DocumentChunk]:
        """
        Performs semantic vector search and returns ranked DocumentChunk instances with dense scores.
        """
        self.embed_fn.document_mode = False

        query_params = {
            "query_texts": [query],
            "n_results": min(top_k, max(1, self.collection.count() or 1)),
        }
        if filter_dict:
            query_params["where"] = filter_dict

        results = self.collection.query(**query_params)
        self.embed_fn.document_mode = True

        retrieved: List[DocumentChunk] = []
        if not results or not results["documents"] or not results["documents"][0]:
            return retrieved

        docs = results["documents"][0]
        ids = results["ids"][0]
        metadatas = results["metadatas"][0]
        distances = results.get("distances", [[0.5] * len(docs)])[0]

        for doc_text, chunk_id, meta, dist in zip(docs, ids, metadatas, distances):
            # Cosine distance to similarity: sim = 1.0 - (dist / 2.0)
            dense_score = max(0.0, min(1.0, 1.0 - (dist if dist is not None else 0.5)))
            metadata_obj = ChunkMetadata(
                document_name=meta.get("document_name", "Unknown"),
                chapter=meta.get("chapter", "Chapter 1"),
                page_number=meta.get("page_number", 1),
                topic=meta.get("topic", "General"),
                section=meta.get("section", "Main"),
                chunk_id=meta.get("chunk_id", chunk_id),
            )
            retrieved.append(
                DocumentChunk(
                    id=chunk_id,
                    content=doc_text,
                    metadata=metadata_obj,
                    dense_score=round(dense_score, 4),
                )
            )

        return retrieved

    def delete_document(self, document_name: str):
        """Removes all chunks associated with a document."""
        self.collection.delete(where={"document_name": document_name})

    def get_stats(self) -> Dict[str, Any]:
        """Returns collection stats."""
        return {
            "collection_name": self.collection_name,
            "total_chunks": self.collection.count(),
        }

from typing import List
from pathlib import Path
import chromadb
from chromadb.config import Settings


class ResumeVectorStore:
    """
    Handles storing and retrieving resume embeddings
    using ChromaDB.
    """

    def __init__(
        self,
        collection_name: str = "resume_collection"
    ):

        db_path = Path("chroma_db")

        self.client = chromadb.PersistentClient(
            path=str(db_path)
        )

        self.collection = self.client.get_or_create_collection(
            name=collection_name
        )

    def add_documents(
        self,
        chunks: List[str],
        embeddings: List[List[float]]
    ):

        ids = [
            f"chunk_{i}"
            for i in range(len(chunks))
        ]

        metadatas = [
            {
                "source": "resume",
                "chunk_number": i + 1
            }
            for i in range(len(chunks))
        ]

        self.collection.add(
            ids=ids,
            documents=chunks,
            embeddings=embeddings,
            metadatas=metadatas
        )

    def count_documents(self):

        return self.collection.count()

    def delete_collection(self):

        self.client.delete_collection(
            self.collection.name
        )

    def get_all_documents(self) -> List[str]:
            """
            Return all stored resume chunks.
            """
    
            results = self.collection.get(
                include=["documents"]
            )
    
            documents = results.get("documents", [])
    
            return documents

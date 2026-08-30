from typing import List
from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer


class ResumeRetriever:
    """
    Retrieves the most relevant resume chunks
    using semantic similarity search.
    """

    def __init__(
        self,
        collection_name: str = "resume_collection",
        model_name: str = "all-MiniLM-L6-v2"
    ):

        self.client = chromadb.PersistentClient(
            path=str(Path("chroma_db"))
        )

        self.collection = self.client.get_collection(
            name=collection_name
        )

        self.embedding_model = SentenceTransformer(model_name)

    def retrieve(
        self,
        query: str,
        top_k: int = 3
    ) -> List[str]:
        """
        Retrieve the most relevant chunks.
        """

        query_embedding = self.embedding_model.encode(
            query,
            convert_to_numpy=True
        ).tolist()

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )

        return results["documents"][0]

    def retrieve_with_metadata(
        self,
        query: str,
        top_k: int = 3
    ):
        """
        Retrieve documents along with metadata.
        """

        query_embedding = self.embedding_model.encode(
            query,
            convert_to_numpy=True
        ).tolist()

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=top_k
        )

        return results
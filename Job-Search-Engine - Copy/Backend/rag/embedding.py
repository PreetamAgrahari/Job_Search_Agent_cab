from sentence_transformers import SentenceTransformer
from typing import List


class ResumeEmbedding:
    """
    Generates embeddings for resume text chunks using
    Sentence Transformers.
    """

    def __init__(
        self,
        model_name: str = "all-MiniLM-L6-v2"
    ):
        self.model = SentenceTransformer(model_name)

    def generate_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a single text chunk.
        """

        embedding = self.model.encode(
            text,
            convert_to_numpy=True
        )

        return embedding.tolist()

    def generate_embeddings(
        self,
        chunks: List[str]
    ) -> List[List[float]]:
        """
        Generate embeddings for multiple chunks.
        """

        embeddings = self.model.encode(
            chunks,
            convert_to_numpy=True
        )

        return embeddings.tolist()
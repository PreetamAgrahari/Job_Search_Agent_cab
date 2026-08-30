from langchain_text_splitters import RecursiveCharacterTextSplitter


class ResumeChunker:
    """
    Splits resume text into smaller chunks for embedding.
    """

    def __init__(
        self,
        chunk_size: int = 500,
        chunk_overlap: int = 100
    ):
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=[
                "\n\n",
                "\n",
                ". ",
                " ",
                ""
            ]
        )

    def split_text(self, text: str):
        """
        Split text into chunks.
        """

        if not text.strip():
            return []

        chunks = self.text_splitter.split_text(text)

        return chunks
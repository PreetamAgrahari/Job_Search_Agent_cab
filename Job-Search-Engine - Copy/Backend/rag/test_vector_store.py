from parser import ResumeParser
from chunker import ResumeChunker
from embedding import ResumeEmbedding
from vector_store import ResumeVectorStore


FILE_PATH = "../../resume.pdf"

# -------------------------
# Parse Resume
# -------------------------
text = ResumeParser.extract_text(FILE_PATH)

# -------------------------
# Chunk Resume
# -------------------------
chunker = ResumeChunker()

chunks = chunker.split_text(text)

# -------------------------
# Generate Embeddings
# -------------------------
embedder = ResumeEmbedding()

embeddings = embedder.generate_embeddings(chunks)

# -------------------------
# Store in ChromaDB
# -------------------------
vector_store = ResumeVectorStore()

vector_store.add_documents(
    chunks,
    embeddings
)

# print("=" * 60)
# print("Resume Stored Successfully!")
# print("=" * 60)

print(
    f"Total Documents : {vector_store.count_documents()}"
)
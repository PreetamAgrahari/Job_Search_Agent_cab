from parser import ResumeParser
from chunker import ResumeChunker
from embedding import ResumeEmbedding


FILE_PATH = "../../resume.pdf"


# -----------------------------
# Step 1 : Extract Resume
# -----------------------------
text = ResumeParser.extract_text(FILE_PATH)


# -----------------------------
# Step 2 : Chunk Resume
# -----------------------------
chunker = ResumeChunker()

chunks = chunker.split_text(text)


# -----------------------------
# Step 3 : Generate Embeddings
# -----------------------------
embedder = ResumeEmbedding()

embeddings = embedder.generate_embeddings(chunks)


# print("=" * 70)
# print(f"Total Chunks : {len(chunks)}")
# print("=" * 70)

for i, embedding in enumerate(embeddings):

    print(f"\nChunk {i+1}")

    print(f"Vector Dimension : {len(embedding)}")

    print("First 10 Values :")

    print(embedding[:10])
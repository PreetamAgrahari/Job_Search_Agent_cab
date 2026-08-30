from parser import ResumeParser
from chunker import ResumeChunker


FILE_PATH = "../../resume.pdf"


# Step 1 : Extract text
text = ResumeParser.extract_text(FILE_PATH)

# print("=" * 70)
# print("Original Resume Text")
# print("=" * 70)
print(text)


# Step 2 : Split into chunks
chunker = ResumeChunker()

chunks = chunker.split_text(text)


# print("\n")
# print("=" * 70)
# print(f"Total Chunks : {len(chunks)}")
# print("=" * 70)


for i, chunk in enumerate(chunks, start=1):
    print(f"\nChunk {i}")
    print("-" * 50)
    print(chunk)
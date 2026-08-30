from retriever import ResumeRetriever

retriever = ResumeRetriever()

query = input("Ask a question about your resume: ")

results = retriever.retrieve(query)

print("\n")
print("=" * 70)
print("Relevant Resume Chunks")
print("=" * 70)

for i, chunk in enumerate(results, start=1):
    print(f"\nChunk {i}")
    print("-" * 50)
    print(chunk)
from retriever import ResumeRetriever
from prompt import PromptBuilder


retriever = ResumeRetriever()

query = input("Ask your question: ")

chunks = retriever.retrieve(query)

prompt = PromptBuilder.build_prompt(
    query=query,
    context_chunks=chunks
)

print("\n")
print("=" * 80)
print("FINAL PROMPT")
print("=" * 80)
print(prompt)
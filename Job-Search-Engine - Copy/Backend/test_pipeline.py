from rag.pipeline import ResumeRAGPipeline


# -----------------------------------------
# Initialize RAG pipeline
# -----------------------------------------

pipeline = ResumeRAGPipeline()


# -----------------------------------------
# Resume path
# -----------------------------------------

resume_path = r"P:\Job-Search-Engine\resume.pdf"


# -----------------------------------------
# Process resume
# -----------------------------------------

print("=" * 70)
print("PROCESSING RESUME")
print("=" * 70)

chunk_count = pipeline.process_resume(
    resume_path
)

print(f"Resume processed successfully!")
print(f"Total chunks stored: {chunk_count}")


# -----------------------------------------
# Ask questions
# -----------------------------------------

print("\n")
print("=" * 70)
print("AI RESUME ASSISTANT")
print("=" * 70)

while True:

    question = input(
        "\nAsk a question (type 'exit' to stop): "
    )

    if question.lower() == "exit":
        print("\nGoodbye!")
        break

    try:

        answer = pipeline.ask(
            query=question,
            top_k=3
        )

        print("\n")
        print("-" * 70)
        print("AI RESPONSE")
        print("-" * 70)
        print(answer)

    except Exception as e:

        print("\nError:")
        print(e)
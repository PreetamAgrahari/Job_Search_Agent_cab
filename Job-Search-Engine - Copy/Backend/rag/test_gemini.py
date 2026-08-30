from gemini_service import GeminiService


gemini = GeminiService()

prompt = """
You are an AI Resume Assistant.

Resume:

Skills:
Python
FastAPI
Machine Learning

Question:

What are my skills?
"""

response = gemini.generate_response(prompt)

print("=" * 70)
print("Gemini Response")
print("=" * 70)
print(response)
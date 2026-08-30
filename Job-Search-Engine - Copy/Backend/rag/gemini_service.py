import os
from dotenv import load_dotenv
from google import genai

load_dotenv()


class GeminiService:

    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            raise ValueError("GEMINI_API_KEY not found in .env")

        self.client = genai.Client(api_key=api_key)

        # Updated model
        self.model_name = "gemini-3.6-flash"

    def generate_response(self, prompt):
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt
        )

        return response.text
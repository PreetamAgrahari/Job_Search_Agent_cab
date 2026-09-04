import json
from typing import List

from Backend.rag.parser import ResumeParser
from Backend.rag.chunker import ResumeChunker
from Backend.rag.embedding import ResumeEmbedding
from Backend.rag.vector_store import ResumeVectorStore
from Backend.rag.retriever import ResumeRetriever
from Backend.rag.prompt import PromptBuilder
from Backend.rag.gemini_service import GeminiService


class ResumeRAGPipeline:
    """
    Complete RAG pipeline for the Job Search AI Agent.

    Flow:

    Resume
        ↓
    Parser
        ↓
    Chunker
        ↓
    Embedding
        ↓
    ChromaDB
        ↓
    Retriever
        ↓
    Prompt Builder
        ↓
    Gemini
        ↓
    Final Answer
    """

    def __init__(self):

        # Initialize components
        self.parser = ResumeParser()

        self.chunker = ResumeChunker()

        self.embedding = ResumeEmbedding()

        self.vector_store = ResumeVectorStore()

        self.retriever = ResumeRetriever()

        self.gemini = GeminiService()

    # --------------------------------------------------
    # STEP 1: Process and store resume
    # --------------------------------------------------

    def process_resume(self, file_path: str) -> int:
        """
        Parse resume, create chunks, generate embeddings,
        and store them in ChromaDB.

        Returns:
            Number of chunks stored.
        """

        # 1. Extract text
        text = self.parser.extract_text(file_path)

        if not text:
            raise ValueError(
                "No text could be extracted from the resume."
            )

        # 2. Split text
        chunks = self.chunker.split_text(text)

        if not chunks:
            raise ValueError(
                "Resume could not be divided into chunks."
            )

        # 3. Generate embeddings
        embeddings = self.embedding.generate_embeddings(chunks)

        # 4. Store in vector database
        self.vector_store.add_documents(
            chunks,
            embeddings
        )

        return len(chunks)

    # --------------------------------------------------
    # STEP 2: Ask question
    # --------------------------------------------------

    def ask(
        self,
        query: str,
        top_k: int = 3
    ) -> str:
        """
        Answer a question using RAG.
        """

        if not query.strip():
            raise ValueError(
                "Question cannot be empty."
            )

        # 1. Retrieve relevant chunks
        relevant_chunks = self.retriever.retrieve(
            query=query,
            top_k=top_k
        )

        if not relevant_chunks:
            return (
                "I couldn't find relevant information "
                "in the uploaded resume."
            )

        # 2. Build prompt
        prompt = PromptBuilder.build_prompt(
            query=query,
            context_chunks=relevant_chunks
        )

        # 3. Generate Gemini response
        response = self.gemini.generate_response(
            prompt
        )

        return response

    # --------------------------------------------------
    # STEP 3: Get retrieved chunks
    # --------------------------------------------------

    def retrieve_context(
        self,
        query: str,
        top_k: int = 3
    ) -> List[str]:
        """
        Return relevant resume chunks without
        calling Gemini.

        Useful for debugging the RAG system.
        """

        return self.retriever.retrieve(
            query=query,
            top_k=top_k
        )

    # --------------------------------------------------
    # STEP 4: Generic AI question
    # --------------------------------------------------

    def ask_generic(
        self,
        query: str
    ) -> str:
        """
        Answer a general question using Gemini
        without using resume/RAG context.
        """

        if not query.strip():
            raise ValueError(
                "Question cannot be empty."
            )

        prompt = f"""
        You are a helpful AI assistant.
        Answer the user's question clearly and accurately.
        Do not assume that the question is related to
        the user's resume.
        Question:
        {query}
        Provide a concise and useful answer.
        """

        response = self.gemini.generate_response(
            prompt
        )

        return response

    # --------------------------------------------------
    # STEP 5: Structured Resume Analysis
    # --------------------------------------------------

    def analyze_resume(self) -> dict:
        """
        Analyze the complete uploaded resume and
        return structured JSON data.
        """

        # Get all resume chunks
        resume_chunks = self.vector_store.get_all_documents()

        if not resume_chunks:
            return {
                "overall_score": 0,
                "ats_score": 0,
                "summary": "No resume found. Please upload a resume first.",
                "strengths": [],
                "weaknesses": [],
                "technical_skills": [],
                "missing_skills": [],
                "recommended_roles": [],
                "project_analysis": [],
                "improvement_suggestions": []
            }

        # Combine complete resume
        resume_context = "\n\n".join(resume_chunks)

        prompt = f"""
You are an expert ATS Resume Analyzer.

Analyze the resume below and return ONLY valid JSON.

RESUME:
--------------------
{resume_context}
--------------------

Return the response EXACTLY in this JSON format:

{{
    "overall_score": 0,
    "ats_score": 0,
    "summary": "",
    "strengths": [],
    "weaknesses": [],
    "technical_skills": [],
    "missing_skills": [],
    "recommended_roles": [],
    "project_analysis": [
        {{
            "project_name": "",
            "evaluation": "",
            "suggestions": []
        }}
    ],
    "improvement_suggestions": []
}}

Rules:

1. overall_score must be an integer between 0 and 100.
2. ats_score must be an integer between 0 and 100.
3. summary should contain a short professional evaluation.
4. strengths must be a list of strings.
5. weaknesses must be a list of strings.
6. technical_skills must contain skills found in the resume.
7. missing_skills must contain recommended skills.
8. recommended_roles must contain suitable job roles.
9. project_analysis must analyze each project.
10. improvement_suggestions must contain actionable suggestions.
11. Return ONLY JSON.
12. Do not use Markdown.
13. Do not include ```json or ```.

"""

        # Get Gemini response
        response = self.gemini.generate_response(prompt)

        # Remove accidental markdown formatting
        response = response.strip()

        if response.startswith("```json"):
            response = response.replace("```json", "", 1)

        if response.startswith("```"):
            response = response.replace("```", "", 1)

        if response.endswith("```"):
            response = response[:-3]

        response = response.strip()

        try:
            analysis = json.loads(response)

        except json.JSONDecodeError:

            # Fallback if Gemini returns invalid JSON
            return {
                "overall_score": 0,
                "ats_score": 0,
                "summary": "Unable to generate structured analysis.",
                "strengths": [],
                "weaknesses": [],
                "technical_skills": [],
                "missing_skills": [],
                "recommended_roles": [],
                "project_analysis": [],
                "improvement_suggestions": [],
                "raw_analysis": response
            }

        return analysis

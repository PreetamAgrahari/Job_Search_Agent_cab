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
    # STEP 4: Resume Analysis
    # --------------------------------------------------

    def analyze_resume(self) -> str:
        """
        Analyze the complete uploaded resume.
        """

        # Get ALL resume chunks instead of semantic search
        resume_chunks = self.vector_store.get_all_documents()

        if not resume_chunks:
            return "No resume found. Please upload a resume first."

        # Combine all resume chunks
        resume_context = "\n\n".join(resume_chunks)

        # Build dedicated analysis prompt
        prompt = f"""
You are an expert ATS Resume Analyzer and Career Advisor.

Analyze the following complete resume carefully.

RESUME:
--------------------
{resume_context}
--------------------

Provide a detailed analysis in the following format:

## 1. Overall Resume Score
Give a score out of 100 and briefly explain the score.

## 2. Resume Strengths
List the strongest parts of the resume.

## 3. Resume Weaknesses
Identify missing information, weak sections, or areas that need improvement.

## 4. Technical Skills Identified
List all technical skills found in the resume.

## 5. Missing or Recommended Skills
Suggest important skills based on the candidate's profile.

## 6. Recommended Job Roles
Suggest suitable job roles.

## 7. ATS Analysis
Explain how ATS-friendly the resume is and identify missing keywords.

## 8. Project Analysis
Evaluate the projects and suggest improvements.

## 9. Resume Improvement Suggestions
Give clear actionable suggestions to improve the resume.

Important rules:
- Only analyze information present in the resume.
- Do not say "I couldn't find information" unless the resume genuinely lacks the information.
- If something is missing, clearly mention that it is missing and suggest an improvement.
- Be constructive and professional.
"""

        response = self.gemini.generate_response(prompt)

        return response

    

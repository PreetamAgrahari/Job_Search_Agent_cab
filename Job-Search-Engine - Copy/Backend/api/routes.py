from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from pathlib import Path
import shutil

from Backend.rag.pipeline import ResumeRAGPipeline
from typing import Literal

router = APIRouter(
    prefix="/api",
    tags=["Resume AI"]
)


# Create RAG pipeline
pipeline = ResumeRAGPipeline()


# --------------------------------------------------
# Request Model
# --------------------------------------------------

class QuestionRequest(BaseModel):
    question: str
    mode: Literal["resume", "generic"] = "resume"
    top_k: int = 3


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@router.get("/health")
async def health_check():

    return {
        "status": "healthy",
        "message": "Job Search AI Agent API is running"
    }


# --------------------------------------------------
# Upload Resume
# --------------------------------------------------

@router.post("/resume/upload")
async def upload_resume(
    file: UploadFile = File(...)
):

    try:

        # Check file extension
        file_extension = Path(
            file.filename
        ).suffix.lower()

        if file_extension != ".pdf":

            raise HTTPException(
                status_code=400,
                detail="Currently only PDF files are supported."
            )

        # Create uploads folder
        upload_folder = Path("uploads")

        upload_folder.mkdir(
            parents=True,
            exist_ok=True
        )

        # File path
        file_path = upload_folder / file.filename

        # Save uploaded file
        with open(file_path, "wb") as buffer:

            shutil.copyfileobj(
                file.file,
                buffer
            )

        # Process resume using RAG
        chunk_count = pipeline.process_resume(
            str(file_path)
        )

        return {
            "success": True,
            "message": "Resume uploaded successfully",
            "filename": file.filename,
            "chunks": chunk_count
        }

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# --------------------------------------------------
# Ask Question
# --------------------------------------------------

@router.post("/resume/ask")
async def ask_resume_question(
    request: QuestionRequest
):

    try:

        if not request.question.strip():

            raise HTTPException(
                status_code=400,
                detail="Question cannot be empty"
            )

        if request.mode == "resume":
            answer = pipeline.ask(
                query=request.question,
                top_k=request.top_k
            )

        else:
            answer = pipeline.ask_generic(
                query=request.question
            )

        return {
            "success": True,
            "question": request.question,
            "mode": request.mode,
            "answer": answer
        }

    except HTTPException:
        raise

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# --------------------------------------------------
# Resume Analysis
# --------------------------------------------------

@router.post("/resume/analyze")
async def analyze_resume():

    try:

        prompt = """
You are an expert AI Resume Analyzer.

Analyze the uploaded resume and provide a detailed analysis.

Return the response in the following format:

OVERALL_SCORE: Give a score out of 100

STRENGTHS:
- List strengths

WEAKNESSES:
- List weaknesses

TECHNICAL_SKILLS:
- List technical skills

SKILLS_TO_IMPROVE:
- List skills that should be improved

RECOMMENDED_JOB_ROLES:
- Suggest suitable job roles

ATS_SUGGESTIONS:
- Give ATS optimization suggestions

RESUME_IMPROVEMENTS:
- Give actionable suggestions to improve the resume.

Be honest, professional, and specific.
"""

        analysis = pipeline.analyze_resume(prompt)

        return {
            "success": True,
            "analysis": analysis
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
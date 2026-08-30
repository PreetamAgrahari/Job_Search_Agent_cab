from pathlib import Path
from pypdf import PdfReader
from docx import Document


class ResumeParser:
    """Extract text from PDF and DOCX resume files."""

    @staticmethod
    def extract_pdf(file_path: str) -> str:
        """Extract text from a PDF file."""
        reader = PdfReader(file_path)

        text = ""

        for page in reader.pages:
            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        return text.strip()

    @staticmethod
    def extract_docx(file_path: str) -> str:
        """Extract text from a DOCX file."""
        document = Document(file_path)

        text = "\n".join(
            paragraph.text for paragraph in document.paragraphs
        )

        return text.strip()

    @staticmethod
    def extract_text(file_path: str) -> str:
        """Automatically detect the file type and extract text."""
        extension = Path(file_path).suffix.lower()

        if extension == ".pdf":
            return ResumeParser.extract_pdf(file_path)

        elif extension == ".docx":
            return ResumeParser.extract_docx(file_path)

        else:
            raise ValueError("Unsupported file format. Please upload a PDF or DOCX file.")
from parser import ResumeParser

file_path = "../../resume.pdf"

text = ResumeParser.extract_text(file_path)

# print("=" * 60)
# print("Extracted Resume")
# print("=" * 60)
print(text)
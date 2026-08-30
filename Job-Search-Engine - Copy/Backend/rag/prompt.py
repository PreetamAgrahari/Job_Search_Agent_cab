from typing import List


class PromptBuilder:
    """
    Builds prompts for the LLM using
    retrieved resume context.
    """

    SYSTEM_PROMPT = """
You are an expert AI Resume Assistant.

Your job is to answer questions ONLY from the provided resume context.

Rules:

1. Use ONLY the information provided in the resume context.

2. If the answer is not available,
   reply:

"I couldn't find this information in the uploaded resume."

3. Do NOT make assumptions.

4. Keep answers clear and professional.

"""

    @classmethod
    def build_prompt(
        cls,
        query: str,
        context_chunks: List[str]
    ) -> str:

        context = "\n\n".join(context_chunks)

        prompt = f"""
{cls.SYSTEM_PROMPT}

=========================
RESUME CONTEXT
=========================

{context}

=========================
USER QUESTION
=========================

{query}

=========================
ANSWER
=========================

"""

        return prompt
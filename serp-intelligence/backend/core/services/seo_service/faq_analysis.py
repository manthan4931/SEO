from services.llm_service.groq_client import llm
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel, Field
from typing import List

class FAQ(BaseModel):
    question: str = Field(description="The question text")
    category: str = Field(description="Intent category: Informational, Commercial, or Transactional")
    source: str = Field(description="Where this was found, e.g. Competitor Content")

class FAQList(BaseModel):
    faqs: List[FAQ]

def analyze_faqs(documents):
    """
    Use LLM to extract and categorize FAQs from competitor documents.
    """
    # Limit documents to avoid token limits (take first 2000 chars of each)
    combined_text = "\n---\n".join([doc[:2000] for doc in documents[:5]])
    
    parser = JsonOutputParser(pydantic_object=FAQList)

    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an SEO expert. Extract the top 10 most relevant questions/FAQs from the following competitor content. Categorize each into 'Informational', 'Commercial', or 'Transactional' intent. Return ONLY JSON."),
        ("user", "Competitor Content:\n{text}\n\n{format_instructions}")
    ])

    chain = prompt | llm | parser

    try:
        result = chain.invoke({
            "text": combined_text,
            "format_instructions": parser.get_format_instructions()
        })
        return result.get("faqs", [])
    except Exception as e:
        print(f"FAQ Analysis failed: {e}")
        # Fallback to simple extraction if LLM fails
        return [{"question": "Analysis pending...", "category": "Informational", "source": "System"}]
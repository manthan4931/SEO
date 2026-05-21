from services.llm_service.groq_client import llm
import json

def keyword_gap_analysis(documents):
    if not documents:
        return []

    # Limit document size to avoid token limits, take first 2000 chars of each
    truncated_docs = [doc[:2000] for doc in documents]
    
    prompt = f"""
    You are an SEO analyst. Below are the contents of the top-ranking pages for a specific topic.
    Analyze these documents to identify 'Keyword Gaps' — topics, sub-keywords, or angles that are MISSING or UNDER-REPRESENTED in these top results but are relevant to the user search intent.
    
    Competitor Content Snippets:
    {json.dumps(truncated_docs, indent=2)}
    
    Identify 10-15 high-opportunity keywords or sub-topics that we should cover to outrank them.
    
    Output exactly in this JSON format:
    {{
        "keyword_gaps": [
            {{"keyword": "Keyword 1", "opportunity_score": 95, "reason": "Reason 1"}},
            {{"keyword": "Keyword 2", "opportunity_score": 88, "reason": "Reason 2"}}
        ]
    }}
    
    Return ONLY the JSON.
    """

    try:
        response = llm.invoke(prompt)
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
        
        data = json.loads(content)
        return data.get("keyword_gaps", [])
    except Exception as e:
        print(f"Error in keyword gap analysis: {e}")
        return []
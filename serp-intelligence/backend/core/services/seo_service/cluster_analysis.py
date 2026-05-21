from services.llm_service.groq_client import llm
import json

def analyze_semantic_clusters(competitor_pages):
    """
    Step 07: Map competitor content clusters AI clustering + semantic analysis.
    Identifies topic cluster map with missing angles.
    """
    headers_text = []
    for page in competitor_pages:
        headers_text.append({
            "url": page.serp_result.url,
            "headings": [h['text'] for h in page.headings[:15]]
        })

    prompt = f"""
    Analyze these competitor content structures and identify semantic clusters:
    {json.dumps(headers_text, indent=2)}

    Identify:
    1. 4-6 primary topic clusters they are covering.
    2. The 'Density' (relevance) of each cluster.
    3. CRITICAL: Identify 3 'Missing Angles' (gaps) that none of these competitors are covering well.
    
    =============================================================================================
    SENIOR SEO ANTI-AI RULES FOR CLUSTERS (CRITICAL):
    =============================================================================================
    - The semantic cluster names, descriptions, and missing angles must be named like natural, industry-insider terms.
    - NEVER use robotic AI terms (e.g. BANNED: "Demystifying X", "Unlocking X", "Mastering X", "X Landscape", "X Tapestry").
    - Avoid dry, academic definitions. Provide direct, conversational descriptions of what each cluster represents (e.g., "Hiring Devs & Freelancers" instead of "Human Resource Acquisition and Management").

    Return a JSON object:
    {{
        "clusters": [
            {{"name": "Cluster Name", "density": "90%", "description": "Short description"}},
            ...
        ],
        "missing_angles": [
            {{"angle": "Angle Name", "reason": "Why it's a gap"}},
            ...
        ],
        "semantic_map_data": {{
            "nodes": [
                {{"id": 1, "label": "Topic A", "x": 20, "y": 30}},
                {{"id": 2, "label": "Topic B", "x": 70, "y": 40}}
            ],
            "edges": [[1, 2]]
        }}
    }}
    """

    try:
        response = llm.invoke(prompt)
        content = response.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        return json.loads(content)
    except Exception as e:
        print(f"Cluster analysis failed: {e}")
        return {
            "clusters": [{"name": "General Content", "density": "50%", "description": "Basic info"}],
            "missing_angles": [{"angle": "Expert Case Studies", "reason": "No real world data found"}],
            "semantic_map_data": {"nodes": ["Content"], "edges": []}
        }
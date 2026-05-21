from services.llm_service.groq_client import llm
import json

def analyze_titles(titles):
    if not titles:
        return {}

    prompt = f"""
    Analyze the following top 10 ranking page titles for a keyword:
    
    Titles:
    {json.dumps(titles, indent=2)}
    
    Identify:
    1. Most common title patterns (e.g., listicles, how-tos, year-based).
    2. Emotional triggers used (e.g., curiosity, fear of missing out, urgency).
    3. Power words that appear frequently.
    4. Content format signals (list, guide, comparison, case study).
    5. Suggested best titles for our page (differentiated but following proven patterns).
    
    =============================================================================================
    SENIOR SEO ANTI-AI RULES FOR TITLES (CRITICAL):
    =============================================================================================
    - The suggested titles must sound 100% human-grade, click-worthy, and completely authentic.
    
    1. ABSOLUTELY ZERO COLONS:
       - Every suggested title MUST have absolutely ZERO colons (`:`).
       - LLMs are obsessed with colon-split titles. Real copywriters never write titles with colons. Use standard flowing phrases instead.
       - BANNED: "Conversion Optimization: How to Double Signups" ❌
       - REQUIRED: "How We Doubled Our Conversion Rate Without Changing Our Pricing" ✅

    2. BANISH ALL AI TEMPLATE FORMULAS:
       - NEVER use standard AI structures like "Unlocking X...", "Demystifying X...", "Mastering X...", "The Ultimate Guide to X", "Elevate Your X", "The Secret to X".
       - Focus on direct, practitioner-oriented, conversational titles featuring specific numbers, constraints, or first-person experience (e.g. "We Audited 50 SaaS Funnels - The Real Cost of Customer Acquisition" or "How to Build a Front-end Serving 10k Daily Queries").

    3. BANISH AI BUZZWORDS:
       - Ban words like "Delve", "Demystify", "Mastering", "Unlock", "Pinnacle", "Landscape", "Tapestry", "Elevate", "Revolutionize", "Crucial", "Vital", "Synergy", "Unveil", "Enhance", "Empowering", "Fostering", "Navigating", "Harnessing".

    4. SELF-CORRECTION CHECK:
       - Mentally verify every suggested title before outputting. If a suggested title has a colon or sounds like standard AI clickbait, rewrite it completely.

    Output exactly in this JSON format:
    {{
        "patterns": ["pattern 1", "pattern 2"],
        "emotional_triggers": ["trigger 1", "trigger 2"],
        "power_words": ["word 1", "word 2"],
        "format_signals": ["signal 1", "signal 2"],
        "suggested_titles": [
            {{"title": "Title 1", "reasoning": "Reason 1"}},
            {{"title": "Title 2", "reasoning": "Reason 2"}},
            {{"title": "Title 3", "reasoning": "Reason 3"}},
            {{"title": "Title 4", "reasoning": "Reason 4"}},
            {{"title": "Title 5", "reasoning": "Reason 5"}}
        ]
    }}
    
    Return ONLY the JSON.
    """

    try:
        response = llm.invoke(prompt)
        # Handle potential markdown wrapping
        content = response.content.strip()
        if content.startswith("```json"):
            content = content[7:-3].strip()
        elif content.startswith("```"):
            content = content[3:-3].strip()
        
        return json.loads(content)
    except Exception as e:
        print(f"Error in title analysis: {e}")
        return {
            "error": str(e),
            "patterns": [],
            "emotional_triggers": [],
            "power_words": [],
            "format_signals": [],
            "suggested_titles": []
        }
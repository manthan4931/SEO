import json
from services.llm_service.groq_client import creative_llm

def analyze_headings(competitor_pages):
    """
    Step 05 Upgrade: Use AI to identify structural patterns across competitors.
    """
    heading_data = []
    for page in competitor_pages:
        heading_data.append({
            "url": page.serp_result.url,
            "headings": page.headings[:20]  # First 20 headings to stay in token limits
        })

    prompt = f"""
    Analyze the heading structures (H1, H2, H3) of these top-ranking competitors:
    {json.dumps(heading_data, indent=2)}

    Identify:
    1. Common content patterns (e.g., listicle, step-by-step guide, comparison).
    2. Recurring semantic themes in H2s.
    3. Structural gaps (what are they all missing?).
    4. Recommended outline for our content to outrank them.
    
    =============================================================================================
    SENIOR SEO ANTI-AI RULES FOR RECOMMENDED OUTLINE (CRITICAL):
    =============================================================================================
    - The "recommended_outline" must contain H1, H2, and H3 headings that bypass all AI detection footprints and sound 100% human-grade, click-worthy, and practitioner-written.
    
    1. STRICTLY NO COLONS:
       - Every recommended H1, H2, and H3 heading MUST have absolutely ZERO colons (`:`).
       - LLMs constantly write "Topic: Subtopic" headers. Real humans never do. Write flowing, direct phrases instead.
       - BANNED: "H2: Email Deliverability: Best Practices" ❌
       - REQUIRED: "H2: How to Keep Your Cold Emails Out of the Spam Folder" ✅

    2. BANISH ALL AI BUZZWORDS & GLOW WORDS:
       - NEVER use these banned words: "Delve", "Demystify", "Mastering", "Unlock", "Pinnacle", "Landscape", "Tapestry", "Embark", "Revolutionize", "Elevate", "Ultimate guide", "Crucial", "Vital", "Synergy", "Unveil", "Enhance", "Empowering", "Fostering", "Navigating", "Harnessing", "Dynamic", "Cutting-edge".

    3. NO TEXTBOOK OR GENERIC HEADERS:
       - Avoid dry, sterile placeholder headers. Do not use "Introduction to X", "Benefits of X", "How it works", "Best Practices for X", "Conclusion", "Summary".
       - Every header must highlight an actionable lesson, real-world metric, or specific case study.
       - STUDY THESE CONTRASTS AND COPY THE HUMAN STYLE:
         * Robotic Outline: "H2: Introduction to automated RAG pipelines" -> Human Outline: "H2: The Core Mechanics Behind Live Search Pipelines That Support 10k Active Users"
         * Robotic Outline: "H2: Benefits of semantic search for Google" -> Human Outline: "H2: Why Semantic Search is the Real Secret to Boosting Organic Click-Through Rates by 42%"
         * Robotic Outline: "H2: Step-by-Step guide to deployment" -> Human Outline: "H2: The 3-Step Strategy to Safely Upgrading Your Funnel Without Losing Paid Traffic"

    4. SELF-CORRECTION SCAN:
       - Mentally check the recommended outline headings before returning. Ensure that no item in the "recommended_outline" array contains a colon (`:`), a banned AI word, or a textbook placeholder.

    Return a JSON object with:
    {{
        "patterns": ["pattern1", "pattern2"],
        "themes": ["theme1", "theme2"],
        "recommended_outline": ["H2: ...", "H3: ..."],
        "gaps": ["gap1", "gap2"]
    }}
    """

    try:
        response = creative_llm.invoke(prompt)
        # Extract JSON from response
        content = response.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        return json.loads(content)
    except Exception as e:
        print(f"Heading analysis failed: {e}")
        return {
            "patterns": ["General Guide"],
            "themes": ["SEO Basics"],
            "recommended_outline": ["H1: Intro", "H2: Why it matters", "H2: Best practices"],
            "gaps": ["Specific case studies"]
        }
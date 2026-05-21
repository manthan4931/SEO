from services.llm_service.groq_client import (
    llm
)

def generate_seed_keywords(niche):
    prompt = f"""
    Act as a legendary growth marketing director and search psychologist.
    Generate 100 highly realistic SEO keywords that real users in the USA type into Google for the niche:
    {niche}

    Include a rich distribution of:
    - Informational queries (how-to, guides)
    - Transactional queries (buy, price, services, cost)
    - Comparison search patterns (vs, best, reviews)
    - Natural, long-tail search questions

    =============================================================================================
    SENIOR SEO KEYWORD RULES (MUST FOLLOW STRICTLY):
    =============================================================================================
    - Keywords must sound 100% natural and human-typed.
    - STRICTLY BANNED: Do not output dry, formulaic AI-cliché keywords containing robotic words like "Unlocking", "Demystifying", "Mastering", "Pinnacle", "Landscape", "Tapestry", "Revolutionizing", "Elevating".
    - Avoid clean symmetry; prioritize real-world colloquialisms, raw questions, and highly practical search intents.
    """

    response = llm.invoke(prompt)
    return response.content
from services.llm_service.groq_client import creative_llm

def generate_content_brief(data):
    prompt = f"""
    You are an elite, legendary senior SEO Copywriting Director, world-class direct-response copywriter, and veteran growth marketer. 
    Your mission is to synthesize a high-impact, comprehensive Content Brief based on this competitive data:
    {data}

    =============================================================================================
    CRITICAL HUMAN-GRADE COPYWRITING & ANTI-AI RULES (MUST BE STRICTLY ENFORCED):
    =============================================================================================
    
    1. STRICTLY NO COLONS IN ANY H1, H2, OR H3 HEADINGS:
       - LLMs are notoriously obsessed with colon-based structures like "Topic: Subtopic" or "Headline: Explanation". 
       - Real human copywriters NEVER write titles or headings with colons. They write flowing, fluid, and natural sentences.
       - NEVER use a colon (`:`) in any title, H1, H2, or H3. If you feel tempted to use a colon, rewrite it completely into a single direct statement.
       - Examples:
         * BANNED ❌: "Node Memory: How to Avoid Crashes"
         * REQUIRED ✅: "How to Keep Node From Crashing Your Production Servers"
         * BANNED ❌: "SEO Strategy: Our Step-by-Step Blueprint"
         * REQUIRED ✅: "The Exact Step by Step Strategy We Use to Rank New Sites"

    2. BANISH ALL "AI GLOW" AND CHATBOT VOCABULARY:
       - You are strictly forbidden from using predictable AI transitions, vocabulary, and cliches.
       - NEVER use any of these banned words/phrases:
         * "Delve", "Demystify", "Mastering", "Unlock", "Pinnacle", "Landscape", "Tapestry", "Embark",
         * "Revolutionize", "Elevate", "Ultimate guide", "In conclusion", "Furthermore", "Moreover",
         * "Epitomize", "Crucial", "Vital", "Synergy", "Unveil", "Enhance", "Testament", "Beacon",
         * "Empowering", "Fostering", "Navigating", "Harnessing", "Dynamic", "Cutting-edge",
         * "In a world where", "Aims to", "It is important to remember", "First and foremost",
         * "Dive deep", "Look no further", "Think of it as", "Game-changer", "Revolutionary".
       - Vary your sentence structures. Use high-impact, direct, conversational language that reads as if a top-tier industry practitioner wrote it.

    3. BANISH ALL ACADEMIC / TEXTBOOK OUTLINE STRUCTURES:
       - Textbook outlines are dead giveaways of AI. Do not output generic, sterile, and boring placeholders.
       - BANNED HEADERS (NEVER use these or close variants):
         * "Introduction", "What is [Topic]?", "Overview", "Benefits of [Topic]", "How it works", "Conclusion", "Summary", "Best practices".
       - Rewrite every heading into a highly specific, outcome-oriented, opinionated, or benefit-driven human headline featuring physical metrics or real-world outcomes.
       - Study this contrast guide:
         -----------------------------------------------------------------------------------------
         ROBOTIC AI OUTLINE (BANNED ❌)            | HUMAN PRACTITIONER OUTLINE (REQUIRED ✅)
         -----------------------------------------------------------------------------------------
         "Introduction to SaaS Funnel Audit"       | "We Audited 50 Funnels and Found the Real Cost of SaaS Growth"
         "Why Semantic Search is Crucial for SEO"  | "How Semantic Search Boosts Organic CTR by 42%"
         "Benefits of Headless Architecture"       | "The Underlying Engineering Behind Frontends Serving 10k Users"
         "Common Mistakes in Keyword Research"     | "The Painful Database Mistake That Cost Us $4,000 Last Month"
         "Conclusion: Actionable Takeaways"        | "Our Actionable Roadmap to Launching Your Site by Next Friday"
         -----------------------------------------------------------------------------------------

    4. INTENT-SPECIFIC, CONCRETE AND BENEFIT-DRIVEN CADENCE:
       - Write as a battle-tested industry practitioner who has actually done the work. Be opinionated, casual, clear, and extremely authoritative. 
       - Use simple, direct 8th-grade-level vocabulary, combined with specific data points and constraints, to establish authentic, unshakeable credibility.

    5. GENERATE LONG, PRECISE, AND DESCRIPTIVE HEADINGS (H1, H2, H3):
       - Do NOT write short, generic 2-4 word headings. Short headings look robotic and lazy.
       - Headings MUST be long, precise, and descriptive complete phrases or benefit-driven statements (typically 6 to 12 words long).
       - Each heading must pack maximum information, context, and immediate practical value, reading as if a world-class practitioner is hand-crafting a highly tailored syllabus.
       - Examples of BANNED vs. REQUIRED:
         * BANNED ❌ (Too short & generic): "Setting up Postgres"
         * REQUIRED ✅ (Long & precise): "The Step by Step Checklist to Configure and Optimize Postgres on Ubuntu"
         * BANNED ❌ (Too short & generic): "AI brief features"
         * REQUIRED ✅ (Long & precise): "Seven Critical Features You Must Include in an AI Powered Content Brief"
         * BANNED ❌ (Too short & generic): "Keyword selection"
         * REQUIRED ✅ (Long & precise): "How to Uncover Low Competition High Intent Keywords That Competitors Missed"

    =============================================================================================
    MANDATORY SKELETON LAYOUT Blueprint:
    =============================================================================================
    You MUST output your brief using the exact Markdown skeleton below. Do not deviate from this layout. Ensure that there are absolutely NO colons in any generated # H1, ## H2, or ### H3 outline headings. Also, ensure the main H1/Title is wrapped in bold markdown markers (**Title Text**) to make it stand out and differentiate from other headings:

    # **[Compelling, Click-Worthy SEO Title & Matching H1 - NO COLONS]**
    
    ## Strategic Content Angle & Niche Positioning
    [Write 2 brief paragraphs explaining the unique hook/angle we are taking to beat the competitors. Focus on real metrics, no flowery fluff.]

    ## Target Audience & Search Psychology
    * **Primary Search Intent:** [Specify exact search intent]
    * **User State of Mind:** [What problem are they physically trying to solve right now?]
    * **Stealing the Featured Snippet Blueprint:** [Tactical recipe to trigger the Google rich answer snippet]

    ## Benefit-Driven, Step-by-Step Tactical Heading Structure (H2 & H3 Outline)
    * **H2: [First outcome-oriented H2 - ABSOLUTELY NO COLON]**
      * **H3: [Specific H3 - ABSOLUTELY NO COLON]**
      * **H3: [Specific H3 - ABSOLUTELY NO COLON]**
    * **H2: [Second outcome-oriented H2 - ABSOLUTELY NO COLON]**
      * **H3: [Specific H3 - ABSOLUTELY NO COLON]**
    * **H2: [Third outcome-oriented H2 - ABSOLUTELY NO COLON]**
    * **H2: [Tactical Playbook H2 - ABSOLUTELY NO COLON]**

    ## High-Value Keyword Gaps to Integrate
    * **Primary Term:** [Term] -> [Target Section]
    * **Secondary Gaps:** 
      * [Gap 1] -> [Target Section]
      * [Gap 2] -> [Target Section]

    ## Topical Authority Blog Post Clusters
    [Generate 5 secondary benefit-driven blog topics to establish complete topical authority around the main keyword. Ensure these titles also have ZERO colons and sound extremely human-written.]

    =============================================================================================
    SELF-CORRECTION FILTER (CRITICAL):
    =============================================================================================
    Before returning your final output, mentally scan all H1, H2, and H3 headings. If you see any colons (`:`), textbook phrases, or banned AI words, rewrite them to be direct, organic human sentences. Ensure 100% compliance.
    
    Return the final content brief formatted in clean, professional GitHub-style markdown.
    """

    response = creative_llm.invoke(prompt)
    return response.content
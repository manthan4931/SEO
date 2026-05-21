from rest_framework.views import APIView
from rest_framework.response import Response
from services.llm_service.groq_client import llm
from services.keyword_service.volume_service import KeywordVolumeService
from services.serp_service.serp_service import fetch_google_results, extract_organic_results, extract_paa, extract_related_searches
import json

class KeywordBrainstormAPIView(APIView):
    def post(self, request):
        topic = request.data.get('topic', 'SEO')
        
        print(f"[KeywordBrainstormAPIView] Fetching live Google SERP results for niche: '{topic}'")
        serp_data = fetch_google_results(topic)
        
        organic_results = []
        related_searches = []
        paa_questions = []
        
        if serp_data:
            organic_results = extract_organic_results(serp_data)
            related_searches = extract_related_searches(serp_data)
            paa_questions = extract_paa(serp_data)
            print(f"[KeywordBrainstormAPIView] Live SERP fetched successfully. Organic results: {len(organic_results)}, Related: {len(related_searches)}, PAA: {len(paa_questions)}")
        else:
            print("[KeywordBrainstormAPIView] Live SERP fetch failed or SERP_API_KEY missing. Falling back to LLM-only brainstorming.")

        prompt = f"""
        Act as an elite, senior SEO director and keyword research specialist with deep understanding of search behaviors and intent in the United States (US).
        
        You are researching the niche/topic: "{topic}".
        
        To help you discover authentic keywords that are actually ranking in the top 10 or highly relevant, here is live Google USA search engine data for this niche:
        
        1. TOP 10 ORGANIC COMPETITORS:
        {json.dumps(organic_results, indent=2) if organic_results else "No live organic results available."}
        
        2. GOOGLE RELATED SEARCHES:
        {json.dumps(related_searches, indent=2) if related_searches else "No live related searches available."}
        
        3. PEOPLE ALSO ASK (PAA) QUESTIONS:
        {json.dumps(paa_questions, indent=2) if paa_questions else "No live PAA questions available."}
        
        =============================================================================================
        TASK & REGIONAL FILTERING RULE (USA HIGH VOLUME, LOW/NO INDIA VOLUME):
        =============================================================================================
        Identify 20 high-opportunity, authentic keyword opportunities for this niche that meet this specific regional demand profile:
        - **HIGH USA VOLUME, LOW/NO INDIA VOLUME:** You MUST prioritize and suggest keywords that are highly searched in the United States (USA) but have little, low, or zero interest and search volume in India.
        - **Target US-Specific Contexts:** Focus on search queries targeting:
          * US-specific tools, software, platforms, or services that are not widely adopted or available in India.
          * US-specific commercial and transactional search intent (e.g., local state laws, US tax forms/compliance like IRS/W2/1099, US health insurance, or US state-level service providers).
          * US local services and pricing (e.g., HVAC installation costs in Texas, LLC formation in Delaware, HOA rules, or US-specific regional service requirements).
        - You MUST include the actual related search queries from Google as keywords if they fit this US-only profile.
        - You MUST analyze the competitor titles and snippets to find the exact search terms they target in the top 10 for US audiences.
        
        =============================================================================================
        SENIOR SEO KEYWORD & ANTI-AI RULES:
        =============================================================================================
        - Keywords must sound like completely natural, human-typed search queries.
        - STRICTLY FORBIDDEN: Do not generate cliché, robotic "AI keywords" containing terms like "Unlocking", "Demystifying", "Mastering", "Ultimate Guide", "Pinnacle", "Landscape", "Tapestry", "Embark", "Revolutionize", "Enhance".
        
        Return the result STRICTLY as a JSON array of objects, where each object has the following keys:
        - "keyword": The exact search query string.
        - "volume": The estimated USA monthly search volume as an integer (provide a highly realistic starting estimate; it will be overwritten/verified by our backend volume API).
        - "india_volume": An estimated India monthly search volume as an integer (should be extremely low or 0, showing it is not searched in India).
        - "reason": A brief 1-sentence explanation of why this query has high volume in the US but low/no volume in India (e.g., "US-specific state tax compliance", "US-only local service pricing").
        
        Example format:
        [
          {{"keyword": "how to file 1099-NEC in California", "volume": 5400, "india_volume": 0, "reason": "US-specific state tax form with zero relevance in India"}},
          {{"keyword": "cost to replace HVAC compressor Texas", "volume": 2900, "india_volume": 5, "reason": "US local service pricing with no relevance to Indian homeowners"}}
        ]
        """
        try:
            response = llm.invoke(prompt)
            content = response.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            keywords = json.loads(content)
            
            # Enrich with real/high-fidelity search volumes in batch
            if isinstance(keywords, list) and len(keywords) > 0:
                keyword_texts = [item.get("keyword") for item in keywords if item.get("keyword")]
                try:
                    live_volumes = KeywordVolumeService.get_bulk_keyword_volumes(keyword_texts)
                    normalized_volumes = {k.lower().strip(): v for k, v in live_volumes.items()}
                    for item in keywords:
                        kw = item.get("keyword")
                        if kw:
                            item["volume"] = normalized_volumes.get(kw.lower().strip(), 0)
                except Exception as ex:
                    print(f"Batch volume enrichment failed: {ex}")
            
            return Response(keywords)
        except Exception as e:
            print(f"Brainstorm failed: {e}")
            return Response([
                {"keyword": f"{topic} best practices", "volume": 1200},
                {"keyword": f"{topic} tools", "volume": 800}
            ], status=500)



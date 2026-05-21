from rest_framework.views import APIView
from rest_framework.response import Response
from services.llm_service.groq_client import llm
from competitors.models import CompetitorPage
from services.scraper_service.scraper_service import scrape_page
import json

class SEOComparisonAPIView(APIView):
    def post(self, request):
        my_url = request.data.get('my_url')
        competitor_id = request.data.get('competitor_id')
        competitor_url = request.data.get('competitor_url')
        
        if not my_url or (not competitor_id and not competitor_url):
            return Response({"error": "Missing data"}, status=400)

        try:
            # Scrape 'My Website' on the fly
            my_data = scrape_page(my_url)

            if competitor_url:
                # Scrape 'Competitor Website' on the fly
                comp_data = scrape_page(competitor_url)
                comp_display_url = competitor_url
            else:
                competitor = CompetitorPage.objects.get(id=competitor_id)
                comp_data = {
                    "word_count": competitor.word_count,
                    "headings": competitor.headings,
                    "page_title": competitor.page_title,
                    "meta_description": competitor.serp_result.meta_description
                }
                comp_display_url = competitor.serp_result.url
            
            prompt = f"""
            Perform a detailed, structured SEO comparison between My Website and a Competitor.
            
            MY WEBSITE ({my_url}):
            - Title: {my_data.get('page_title')}
            - Keywords: {my_data.get('meta_keywords')}
            - Meta Desc: {my_data.get('meta_description')}
            - Word Count: {my_data.get('word_count')}
            - Headings: {json.dumps(my_data.get('headings', [])[:15])}
            
            COMPETITOR ({comp_display_url}):
            - Title: {comp_data.get('page_title')}
            - Meta Desc: {comp_data.get('meta_description')}
            - Word Count: {comp_data.get('word_count')}
            - Headings: {json.dumps(comp_data.get('headings', [])[:15])}
            
            Analyze these two pages and return a JSON object with the following fields:
            1. "my_score" (integer between 0 and 100 representing the SEO score of My Website)
            2. "competitor_score" (integer between 0 and 100 representing the SEO score of the Competitor)
            3. "seo_verdict" (string: either "My Website", "Competitor Website", or "Tie" - identifying which site is more SEO-friendly)
            4. "verdict_reason" (string detailing precisely why that site is more SEO-friendly)
            5. "structured_diff" (an object holding comparative analysis for "title", "word_count", "headings_outline", and "meta_description" with "my_site", "competitor", and "analysis_note" properties)
            6. "keyword_overlap" (string description of the keyword gap or semantic opportunities)
            7. "depth_comparison" (string description comparing content length, depth, and detail level)
            8. "competitive_advantages" (string detailing the competitor's UX, speed, structured data, or formatting strengths)
            9. "winning_action" (string with a core high-impact advice/strategy to outrank them)
            10. "actionable_changes" (an array of 3 to 6 strings representing clear, step-by-step changes I must make on my site to outrank the competitor)
            
            Return ONLY a valid JSON block, using exactly this format:
            {{
                "my_score": 70,
                "competitor_score": 85,
                "seo_verdict": "Competitor Website",
                "verdict_reason": "Description of why...",
                "structured_diff": {{
                    "title": {{
                        "my_site": "My Title String",
                        "competitor": "Competitor Title String",
                        "analysis_note": "Comparison note on keyword alignment, length, CTR potential..."
                    }},
                    "word_count": {{
                        "my_site": "1200 words",
                        "competitor": "2800 words",
                        "analysis_note": "Comparison note on content depth and comprehensive coverage..."
                    }},
                    "headings_outline": {{
                        "my_site": "Outline summary...",
                        "competitor": "Outline summary...",
                        "analysis_note": "Comparison note on heading hierarchy, H2/H3 coverage, intent targeting..."
                    }},
                    "meta_description": {{
                        "my_site": "My Meta String",
                        "competitor": "Competitor Meta String",
                        "analysis_note": "Comparison note on keyword inclusion and CTR optimization..."
                    }}
                }},
                "keyword_overlap": "Description of keyword gaps...",
                "depth_comparison": "Description of content depth difference...",
                "competitive_advantages": "Detail exactly what they do better than us...",
                "winning_action": "Core advice...",
                "actionable_changes": [
                    "Step 1 change detail...",
                    "Step 2 change detail...",
                    "Step 3 change detail..."
                ]
            }}
            """
            
            response = llm.invoke(prompt)
            content = response.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            comparison = json.loads(content)
            
            return Response({
                "my_stats": {
                    "word_count": my_data.get('word_count'),
                    "headings_count": len(my_data.get('headings', [])),
                    "page_title": my_data.get('page_title'),
                    "meta_description": my_data.get('meta_description')
                },
                "competitor_stats": {
                    "word_count": comp_data.get('word_count'),
                    "headings_count": len(comp_data.get('headings', [])),
                    "page_title": comp_data.get('page_title'),
                    "meta_description": comp_data.get('meta_description')
                },
                "comparison": comparison
            })
        except Exception as e:
            return Response({"error": str(e)}, status=500)

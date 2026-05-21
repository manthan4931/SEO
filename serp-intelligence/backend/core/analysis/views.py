from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response    
from services.rag_service.rag_pipeline import (generate_rag_response)
from rest_framework.views import (
    APIView
)

from rest_framework.response import (
    Response
)

from rest_framework.generics import (
    ListAPIView
)

from keywords.models import (
    Keyword
)

from analysis.models import (
    AnalysisReport
)

from analysis.serializers import (
    AnalysisReportSerializer
)

from services.seo_service.full_analysis import (
    run_full_analysis
)

from services.rag_service.rag_pipeline import (
    generate_rag_response
)

class RAGAPIView(APIView):
    def post(self, request):
        query = request.data.get("query")
        response = generate_rag_response(query)
        return Response({"response": response})

# ======================================
# FULL SEO ANALYSIS API
# ======================================

class SEOAnalysisAPIView(APIView):

    def post(self, request):
        try:
            keyword_id = request.data.get("keyword_id")
            if not keyword_id:
                return Response({"error": "keyword_id is required"}, status=400)

            keyword = Keyword.objects.get(id=keyword_id)
            results = run_full_analysis(keyword)
            return Response(results)
        except Keyword.DoesNotExist:
            return Response({"error": "Keyword not found"}, status=404)
        except Exception as e:
            print(f"Analysis Error: {e}")
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)


# ======================================
# ANALYSIS REPORTS API
# ======================================

class AnalysisReportListAPIView(ListAPIView):
    serializer_class = AnalysisReportSerializer

    def get_queryset(self):
        queryset = AnalysisReport.objects.all().order_by("-created_at")
        keyword_id = self.request.query_params.get('keyword_id')
        if keyword_id:
            queryset = queryset.filter(keyword_id=keyword_id)
        return queryset


# ======================================
# RAG CHAT API
# ======================================

class RAGAPIView(APIView):

    def post(self, request):

        query = request.data.get(
            "query"
        )

        response = generate_rag_response(
            query
        )

        return Response({

            "response":
            response
        })


# ======================================
# DOMAIN RANKING KEYWORDS API
# ======================================

class DomainRankingsAPIView(APIView):
    def post(self, request):
        import os
        import requests
        import json
        
        domain = request.data.get("domain")
        source = request.data.get("source", "us")
        if not domain:
            return Response({"error": "domain is required"}, status=400)
            
        # Clean domain name
        domain = domain.replace("https://", "").replace("http://", "").replace("www.", "").split("/")[0].strip()
        
        se_key = os.getenv("SE_RANKING")
        keywords = None
        
        if se_key:
            try:
                print(f"[DomainRankings] Querying SE Ranking for domain: {domain}")
                url = "https://api.seranking.com/v1/domain/keywords"
                headers = {
                    "Authorization": f"Token {se_key}"
                }
                params = {
                    "domain": domain,
                    "source": source,
                    "with_subdomains": 1,
                    "limit": 30
                }
                response = requests.get(url, headers=headers, params=params, timeout=12)
                if response.status_code == 200:
                    res_data = response.json()
                    raw_items = res_data if isinstance(res_data, list) else res_data.get("data", res_data.get("results", []))
                    if isinstance(raw_items, list):
                        keywords = []
                        for item in raw_items:
                            keywords.append({
                                "keyword": item.get("keyword"),
                                "position": item.get("position", item.get("pos", 1)),
                                "volume": item.get("volume", item.get("vol", 0)),
                                "cpc": item.get("cpc", 0.0),
                                "traffic_share": item.get("traffic_share", item.get("traffic", 0.0))
                            })
                        print(f"[DomainRankings] Successfully retrieved {len(keywords)} ranking keywords from SE Ranking.")
                else:
                    print(f"[DomainRankings] SE Ranking API returned status {response.status_code}: {response.text}")
            except Exception as e:
                print(f"[DomainRankings] SE Ranking request failed: {e}")
                
        if keywords is None:
            print("[DomainRankings] Using High-Fidelity LLM Fallback for domain estimation...")
            try:
                from services.llm_service.groq_client import llm
                prompt = f"""
                Act as an elite SEO analytics manager with deep expertise in United States (USA) search rankings.
                
                For the domain: "{domain}"
                
                Estimate a highly realistic list of the top 15 organic ranking keywords where this website ranks in the top 10 on Google USA.
                
                Rules:
                - The keywords MUST be highly specific and accurate to what the domain does.
                - The ranking positions MUST vary realistically between 1 and 10.
                - Estimate highly realistic monthly search volumes and CPC (USD) for each.
                - Estimate monthly traffic share percentage (e.g. 35.5, 12.2, 5.0).
                - Return the results STRICTLY as a valid JSON list of objects.
                - Output absolutely no explanations, markdown formatting (other than JSON codeblock), or conversational text.
                
                Example Output Format:
                ```json
                [
                  {{
                    "keyword": "niche cloud database",
                    "position": 2,
                    "volume": 1200,
                    "cpc": 4.50,
                    "traffic_share": 24.5
                  }}
                ]
                ```
                """
                response = llm.invoke(prompt)
                content = response.content.strip()
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0].strip()
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0].strip()
                
                keywords = json.loads(content)
            except Exception as ex:
                print(f"[DomainRankings] LLM fallback failed: {ex}")
                keywords = []
                
        return Response({
            "domain": domain,
            "keywords": keywords
        })
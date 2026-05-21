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


# ======================================
# FULL SEO ANALYSIS API
# ======================================

class SEOAnalysisAPIView(APIView):

    def post(self, request):

        keyword_id = request.data.get(
            "keyword_id"
        )

        keyword = Keyword.objects.get(
            id=keyword_id
        )

        results = run_full_analysis(
            keyword
        )

        return Response(results)


# ======================================
# ANALYSIS REPORTS API
# ======================================

class AnalysisReportListAPIView(

    ListAPIView
):

    queryset = (
        AnalysisReport.objects.all()
        .order_by("-created_at")
    )

    serializer_class = (
        AnalysisReportSerializer
    )


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
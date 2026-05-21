from django.urls import path
from analysis.views import SEOAnalysisAPIView, AnalysisReportListAPIView, RAGAPIView, DomainRankingsAPIView
from .comparison import SEOComparisonAPIView

urlpatterns = [
    path("analyze/", SEOAnalysisAPIView.as_view(), name="seo-analysis"),
    path("reports/", AnalysisReportListAPIView.as_view(), name="analysis-reports"),
    path("rag/", RAGAPIView.as_view(), name="rag-api"),
    path("compare/", SEOComparisonAPIView.as_view(), name="seo-compare"),
    path("domain-rankings/", DomainRankingsAPIView.as_view(), name="domain-rankings"),
]
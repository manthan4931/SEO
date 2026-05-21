from rest_framework import generics
from .models import CompetitorPage
from .serializers import CompetitorPageSerializer

class CompetitorPageListAPIView(generics.ListAPIView):
    serializer_class = CompetitorPageSerializer
    
    def get_queryset(self):
        queryset = CompetitorPage.objects.all()
        keyword_id = self.request.query_params.get('keyword_id')
        if keyword_id:
            queryset = queryset.filter(serp_result__keyword_id=keyword_id)
        return queryset.order_by('-created_at')

class CompetitorPageDetailAPIView(generics.RetrieveAPIView):
    queryset = CompetitorPage.objects.all()
    serializer_class = CompetitorPageSerializer

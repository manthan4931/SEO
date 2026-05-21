from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Keyword
from .serializers import KeywordSerializer
from serp.models import PipelineLog

class KeywordListCreateAPIView(generics.ListCreateAPIView):
    queryset = Keyword.objects.all().order_by('-created_at')
    serializer_class = KeywordSerializer

class KeywordDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Keyword.objects.all()
    serializer_class = KeywordSerializer

class KeywordLogsAPIView(APIView):
    def get(self, request, pk):
        logs = PipelineLog.objects.filter(keyword_id=pk)
        return Response([
            {
                "id": l.id,
                "message": l.message,
                "level": l.level,
                "created_at": l.created_at
            } for l in logs
        ])

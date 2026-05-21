from rest_framework import serializers
from .models import CompetitorPage

class CompetitorPageSerializer(serializers.ModelSerializer):
    keyword = serializers.CharField(source='serp_result.keyword.keyword', read_only=True)
    url = serializers.CharField(source='serp_result.url', read_only=True)
    
    class Meta:
        model = CompetitorPage
        fields = '__all__'

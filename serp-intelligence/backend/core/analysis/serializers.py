from rest_framework import serializers
from analysis.models import AnalysisReport

class AnalysisReportSerializer(serializers.ModelSerializer):
    keyword_text = serializers.CharField(source='keyword.keyword', read_only=True)

    class Meta:
        model = AnalysisReport
        fields = "__all__"
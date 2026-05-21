from django.db import models
from keywords.models import Keyword

# Create your models here.
class SERPResult(models.Model):
    keyword = models.ForeignKey(Keyword , on_delete=models.CASCADE, related_name='serp_results')
    title = models.TextField()
    url=models.URLField()
    meta_description = models.TextField(blank=True)
    rank=models.IntegerField()
    raw_data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

class PAAQuestion(models.Model):
    keyword = models.ForeignKey(Keyword, on_delete=models.CASCADE, related_name='paa_questions')
    question = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)



class ContentEmbedding(models.Model):

    url = models.URLField()

    chunk_text = models.TextField()

    pinecone_id = models.CharField(max_length=255)

    metadata = models.JSONField(default=dict)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.url

class PipelineLog(models.Model):
    keyword = models.ForeignKey(Keyword, on_delete=models.CASCADE, related_name='logs')
    message = models.TextField()
    level = models.CharField(max_length=20, default='INFO') # INFO, ERROR, SUCCESS
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"[{self.level}] {self.message[:50]}"





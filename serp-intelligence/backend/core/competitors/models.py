from django.db import models

# Create your models here.
class CompetitorPage(models.Model):
    serp_result= models.ForeignKey('serp.SERPResult', on_delete=models.CASCADE)
    page_title = models.TextField()
    full_text = models.TextField()
    markdown_content = models.TextField()
    word_count = models.IntegerField(default=0)
    headings = models.JSONField(default=list)
    faq_data = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)
    


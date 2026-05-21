from django.db import models
from services.keyword_service.volume_service import KeywordVolumeService

# Create your models here.
class Keyword(models.Model):
    keyword = models.CharField(max_length=500)
    country=models.CharField(max_length=50,default='US')
    language = models.CharField(max_length=50,default='en')
    volume = models.IntegerField(default=None, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.volume is None:
            try:
                self.volume = KeywordVolumeService.get_keyword_volume(self.keyword)
            except Exception as e:
                print(f"Failed to fetch volume from service: {e}")
                self.volume = 1000
        super().save(*args, **kwargs)

    def __str__(self):
        return self.keyword 
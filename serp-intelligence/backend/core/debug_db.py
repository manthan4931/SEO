import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from serp.models import SERPResult, PipelineLog
from competitors.models import CompetitorPage
from keywords.models import Keyword

print("--- DB Status ---")
print(f"Keywords: {Keyword.objects.count()}")
print(f"SERPResults: {SERPResult.objects.count()}")
print(f"CompetitorPages: {CompetitorPage.objects.count()}")
print(f"PipelineLogs: {PipelineLog.objects.count()}")

print("\n--- Recent Logs ---")
for log in PipelineLog.objects.order_by('-created_at')[:10]:
    print(f"{log.created_at} [{log.level}] {log.message}")

print("\n--- Recent CompetitorPages ---")
for cp in CompetitorPage.objects.order_by('-created_at')[:5]:
    print(f"{cp.created_at} - {cp.page_title} - {cp.url if hasattr(cp, 'url') else 'No URL'}")

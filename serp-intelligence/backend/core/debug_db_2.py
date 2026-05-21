import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from serp.models import SERPResult, PipelineLog
from competitors.models import CompetitorPage
from keywords.models import Keyword

print("--- Recent Logs (Last 30) ---")
for log in PipelineLog.objects.order_by('-created_at')[:30]:
    print(f"{log.created_at} [{log.level}] {log.message}")

print("\n--- Recent SERP Results ---")
for res in SERPResult.objects.order_by('-created_at')[:10]:
    print(f"{res.created_at} - {res.url}")

print("\n--- CompetitorPages for Last Keyword ---")
last_kw = Keyword.objects.order_by('-created_at').first()
if last_kw:
    print(f"Keyword: {last_kw.keyword}")
    pages = CompetitorPage.objects.filter(serp_result__keyword=last_kw)
    print(f"Count: {pages.count()}")
    for p in pages:
        print(f"  - {p.page_title} ({p.word_count} words)")

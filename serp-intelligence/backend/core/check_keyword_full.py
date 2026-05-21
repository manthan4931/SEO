import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from serp.models import SERPResult, PipelineLog
from competitors.models import CompetitorPage
from keywords.models import Keyword

last_kw = Keyword.objects.order_by('-created_at').first()
if last_kw:
    print(f"Keyword: {last_kw.keyword} (ID: {last_kw.id})")
    serps = SERPResult.objects.filter(keyword=last_kw)
    print(f"SERP Results: {serps.count()}")
    for s in serps:
        print(f"  - [{s.id}] {s.url}")
        pages = CompetitorPage.objects.filter(serp_result=s)
        print(f"    - CompetitorPages: {pages.count()}")
        for p in pages:
            print(f"      - {p.page_title} ({p.word_count} words)")
else:
    print("No keywords found.")

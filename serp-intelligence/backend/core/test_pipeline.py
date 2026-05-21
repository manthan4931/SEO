import os
import django
import sys

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from keywords.models import Keyword
from serp.full_serp_pipeline import process_keyword
from serp.models import PipelineLog, SERPResult
from competitors.models import CompetitorPage

# 1. Create a fresh test keyword
keyword_text = "Test Keyword 12345"
kw, created = Keyword.objects.get_or_create(keyword=keyword_text)
print(f"Keyword: '{kw.keyword}' (ID: {kw.id}, Created: {created})")

# Clean existing logs and results for a clean test run
PipelineLog.objects.filter(keyword=kw).delete()
SERPResult.objects.filter(keyword=kw).delete()

# 2. Run the process_keyword pipeline
try:
    print("\n--- Running process_keyword ---")
    process_keyword(kw.id)
    print("--- process_keyword finished ---\n")
except Exception as e:
    print(f"Exception raised in test_pipeline.py: {e}")
    import traceback
    traceback.print_exc()

# 3. Print the results
print("\n--- Pipeline Logs ---")
for log in PipelineLog.objects.filter(keyword=kw).order_by('created_at'):
    print(f"[{log.level}] {log.message}")

print("\n--- Created SERP Results ---")
serps = SERPResult.objects.filter(keyword=kw)
print(f"Total SERP Results: {serps.count()}")
for s in serps:
    print(f"  - [{s.id}] {s.url}")
    pages = CompetitorPage.objects.filter(serp_result=s)
    print(f"    - CompetitorPages: {pages.count()}")

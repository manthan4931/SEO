import os
import django
import threading

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from serp.full_serp_pipeline import process_keyword
from keywords.models import Keyword
from serp.models import PipelineLog

kw_text = "Thread Test 1"
kw, _ = Keyword.objects.get_or_create(keyword=kw_text)

print(f"Starting process_keyword for: {kw_text}")
process_keyword(kw.id)

print("\n--- Pipeline Logs ---")
logs = PipelineLog.objects.filter(keyword=kw).order_by('created_at')
for log in logs:
    print(f"[{log.level}] {log.message}")

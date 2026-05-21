import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from serp.models import PipelineLog
from keywords.models import Keyword

kw = Keyword.objects.filter(keyword="Manual Test 1").first()
if kw:
    logs = PipelineLog.objects.filter(keyword=kw).order_by('created_at')
    for log in logs:
        print(f"{log.created_at} [{log.level}] {log.message}")
else:
    print("Keyword not found.")

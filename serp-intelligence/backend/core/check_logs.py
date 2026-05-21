import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from serp.models import PipelineLog
from keywords.models import Keyword

last_kw = Keyword.objects.order_by('-created_at').first()
if last_kw:
    print(f"Checking logs for: {last_kw.keyword}")
    logs = PipelineLog.objects.filter(keyword=last_kw).order_by('created_at')
    for log in logs:
        print(f"{log.created_at} [{log.level}] {log.message}")
else:
    print("No keywords found.")

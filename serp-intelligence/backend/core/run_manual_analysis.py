import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from keywords.models import Keyword
from services.seo_service.full_analysis import run_full_analysis

kw_text = "Manual Test 1"
kw, _ = Keyword.objects.get_or_create(keyword=kw_text)

print(f"Running full analysis for: {kw_text}")
try:
    result = run_full_analysis(kw)
    print("Analysis Success!")
    print(f"Report ID: {result.get('report_id')}")
except Exception as e:
    print(f"Analysis Failed: {e}")
    import traceback
    traceback.print_exc()

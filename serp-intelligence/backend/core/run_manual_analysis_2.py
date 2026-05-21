import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from keywords.models import Keyword
from services.seo_service.full_analysis import run_full_analysis
from services.serp_service.serp_service import fetch_google_results, extract_organic_results

kw_text = "Manual Test 1"
kw, _ = Keyword.objects.get_or_create(keyword=kw_text)

print(f"Checking SERP for: {kw_text}")
serp_data = fetch_google_results(kw_text)
organic = extract_organic_results(serp_data)
print(f"Found {len(organic)} organic results.")

print(f"Running full analysis...")
try:
    result = run_full_analysis(kw)
    print("Analysis Success!")
except Exception as e:
    print(f"Analysis Failed: {e}")

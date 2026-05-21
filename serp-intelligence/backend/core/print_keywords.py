import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from keywords.models import Keyword

print("--- ALL KEYWORDS IN DATABASE ---")
keywords = Keyword.objects.all().order_by('-created_at')
print(f"Total Keywords: {keywords.count()}")
print(f"{'ID':<5} | {'Keyword':<40} | {'Volume':<10} | {'Country':<8} | {'Lang':<5}")
print("-" * 80)
for kw in keywords:
    print(f"{kw.id:<5} | {kw.keyword:<40} | {str(kw.volume):<10} | {kw.country:<8} | {kw.language:<5}")

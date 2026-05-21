import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from services.keyword_service.volume_service import KeywordVolumeService

def run_tests():
    print("\n=== TESTING KEYWORD VOLUME SERVICE ===")
    test_keywords = ["best crm for startups", "buy enterprise software", "marketing agency in new york"]
    
    print(f"Keywords to test: {test_keywords}")
    print("\n1. Testing bulk keyword volumes...")
    volumes = KeywordVolumeService.get_bulk_keyword_volumes(test_keywords)
    print(f"Result: {volumes}")
    
    print("\n2. Testing single keyword volume...")
    for kw in test_keywords:
        vol = KeywordVolumeService.get_keyword_volume(kw)
        print(f" - '{kw}': {vol} monthly searches")
        
    print("\n=== TESTING KEYWORD MODEL INTEGRATION ===")
    from keywords.models import Keyword
    print("Saving test Keyword model to database...")
    kw_obj = Keyword.objects.create(keyword="how to hire an seo expert")
    print(f"Saved: '{kw_obj.keyword}' -> Volume: {kw_obj.volume} US/mo (Source: {kw_obj.country})")
    kw_obj.delete()
    print("Temporary test keyword cleaned up successfully.")

if __name__ == "__main__":
    run_tests()

import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.test import RequestFactory
from keywords.brainstorm import KeywordBrainstormAPIView

def test_brainstorm():
    print("\n=== TESTING BRAINSTORM ENDPOINT ===")
    factory = RequestFactory()
    # Create request
    request = factory.post('/api/keywords/brainstorm/', data={"topic": "B2B SaaS Growth"}, content_type='application/json')
    
    # Instantiate view
    view = KeywordBrainstormAPIView.as_view()
    
    print("Calling KeywordBrainstormAPIView.post() for topic 'B2B SaaS Growth'...")
    try:
        response = view(request)
        print(f"Response Status Code: {response.status_code}")
        if response.status_code == 200:
            print("\nGenerated Keywords & Volumes:")
            for idx, kw in enumerate(response.data[:5], 1):
                print(f" {idx}. '{kw['keyword']}' -> Volume: {kw['volume']} US/mo")
            if len(response.data) > 5:
                print(f" ... and {len(response.data) - 5} more keywords.")
        else:
            print(f"Error Response Data: {response.data}")
    except Exception as e:
        print(f"Exception during brainstorm view test: {e}")

if __name__ == "__main__":
    test_brainstorm()

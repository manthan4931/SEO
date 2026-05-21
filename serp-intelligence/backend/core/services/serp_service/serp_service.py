import requests 
import os 
from dotenv import load_dotenv
load_dotenv()

SERP_API_KEY = os.getenv('SERP_API_KEY')

def fetch_google_results(keyword):
    if not SERP_API_KEY:
        print("CRITICAL: SERP_API_KEY is missing in .env")
        return None
        
    url="https://serpapi.com/search.json"
    params={
        "q":keyword, 
        "api_key":SERP_API_KEY,
        "engine":"google",
        "num": 10
    }
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"SERP API Request Failed: {e}")
        return None

def extract_organic_results(data):
    results=[]
    organic = data.get("organic_results", [])
    for item in organic:
        results.append({
            "title": item.get("title"),
            "link": item.get("link"),
            "snippet": item.get("snippet"),
            "position": item.get("position"),
        })
    return results 

def extract_paa(data):
    """Extract People Also Ask questions."""
    return [q.get("question") for q in data.get("people_also_ask", [])]

def extract_related_searches(data):
    """Extract related search terms."""
    return [s.get("query") for s in data.get("related_searches", [])]
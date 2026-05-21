import requests
import json

url = "http://127.0.0.1:8000/api/analysis/compare/"

payloads = [
    # 1. Payload with competitor_id only
    {
        "my_url": "http://example.com",
        "competitor_id": 1,
        "competitor_url": None
    },
    # 2. Payload with competitor_url only
    {
        "my_url": "http://example.com",
        "competitor_id": None,
        "competitor_url": "https://boomi.com/blog/how-integration-enables-ai/"
    },
    # 3. Payload with competitor_id and empty competitor_url
    {
        "my_url": "http://example.com",
        "competitor_id": 1,
        "competitor_url": ""
    }
]

headers = {
    "Origin": "http://localhost:3000",
    "Content-Type": "application/json"
}

for i, payload in enumerate(payloads, 1):
    print(f"\n--- Testing Payload {i}: {payload} ---")
    try:
        response = requests.post(url, headers=headers, json=payload)
        print("Status Code:", response.status_code)
        if response.status_code == 200:
            print("Success! Comparison result:", json.dumps(response.json())[:300] + "...")
        else:
            print("Error Response:", response.text)
    except Exception as e:
        print("Request Failed:", e)

import os
import json
import base64
import requests
from dotenv import load_dotenv

# Absolute path lookup for backend/.env
_curr_dir = os.path.dirname(os.path.abspath(__file__))
_backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(_curr_dir)))
_env_path = os.path.join(_backend_dir, ".env")
load_dotenv(_env_path)

class KeywordVolumeService:
    @staticmethod
    def get_keyword_volume(keyword: str) -> int:
        """
        Fetches the USA search volume for a single keyword.
        """
        results = KeywordVolumeService.get_bulk_keyword_volumes([keyword])
        return results.get(keyword, 1000)

    @staticmethod
    def get_bulk_keyword_volumes(keywords: list) -> dict:
        """
        Fetches USA search volumes for a list of keywords.
        Tries APIs in sequence based on active credentials in .env:
        1. SE Ranking API (Primary)
        2. Keywords Everywhere
        3. DataForSEO
        4. Google Ads API
        5. High-fidelity LLM bulk estimation (smart fallback)
        """
        if not keywords:
            return {}

        # Strip and clean keywords
        cleaned_keywords = [kw.strip() for kw in keywords if kw.strip()]
        if not cleaned_keywords:
            return {}

        # 1. SE Ranking API
        se_key = os.getenv("SE_RANKING")
        if se_key:
            print("[KeywordVolumeService] Attempting SE Ranking API...")
            volumes = KeywordVolumeService._fetch_se_ranking(cleaned_keywords, se_key)
            if volumes is not None:
                print(f"[KeywordVolumeService] Successfully retrieved {len(volumes)} volumes from SE Ranking.")
                return volumes

        # 2. Keywords Everywhere API
        ke_key = os.getenv("KEYWORDS_EVERYWHERE_API_KEY")
        if ke_key:
            print("[KeywordVolumeService] Attempting Keywords Everywhere API...")
            volumes = KeywordVolumeService._fetch_keywords_everywhere(cleaned_keywords, ke_key)
            if volumes is not None:
                print(f"[KeywordVolumeService] Successfully retrieved {len(volumes)} volumes from Keywords Everywhere.")
                return volumes

        # 3. DataForSEO API
        df_login = os.getenv("DATAFORSEO_LOGIN")
        df_pass = os.getenv("DATAFORSEO_PASSWORD")
        if df_login and df_pass:
            print("[KeywordVolumeService] Attempting DataForSEO API...")
            volumes = KeywordVolumeService._fetch_dataforseo(cleaned_keywords, df_login, df_pass)
            if volumes is not None:
                print(f"[KeywordVolumeService] Successfully retrieved {len(volumes)} volumes from DataForSEO.")
                return volumes

        # 4. Google Ads API (Keyword Planner REST)
        ga_dev_token = os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN")
        ga_client_id = os.getenv("GOOGLE_ADS_CLIENT_ID")
        ga_client_secret = os.getenv("GOOGLE_ADS_CLIENT_SECRET")
        ga_refresh_token = os.getenv("GOOGLE_ADS_REFRESH_TOKEN")
        ga_cust_id = os.getenv("GOOGLE_ADS_CUSTOMER_ID")
        if all([ga_dev_token, ga_client_id, ga_client_secret, ga_refresh_token, ga_cust_id]):
            print("[KeywordVolumeService] Attempting Google Ads API...")
            volumes = KeywordVolumeService._fetch_google_ads(
                cleaned_keywords, ga_dev_token, ga_client_id, ga_client_secret, ga_refresh_token, ga_cust_id
            )
            if volumes is not None:
                print(f"[KeywordVolumeService] Successfully retrieved {len(volumes)} volumes from Google Ads API.")
                return volumes

        # 5. Refined LLM Fallback Estimator
        print("[KeywordVolumeService] No API keys configured or queries failed. Using High-Fidelity LLM Fallback...")
        return KeywordVolumeService._estimate_bulk_llm(cleaned_keywords)

    @staticmethod
    def _fetch_se_ranking(keywords: list, api_key: str) -> dict:
        try:
            url = "https://api.seranking.com/v1/keywords/export?source=us"
            headers = {
                "Authorization": f"Token {api_key}",
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            payload = {
                "keywords": keywords
            }
            response = requests.post(url, headers=headers, json=payload, timeout=15)
            if response.status_code in [200, 201]:
                res_data = response.json()
                volumes = {}
                for item in res_data:
                    kw = item.get("keyword")
                    vol = item.get("volume", 0)
                    if kw:
                        volumes[kw.lower().strip()] = int(vol) if vol is not None else 0
                return {kw: volumes.get(kw.lower().strip(), 0) for kw in keywords}
            else:
                print(f"[KeywordVolumeService] SE Ranking API returned status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"[KeywordVolumeService] SE Ranking request failed: {e}")
        return None

    @staticmethod
    def _fetch_keywords_everywhere(keywords: list, api_key: str) -> dict:
        try:
            url = "https://api.keywordseverywhere.com/v1/get_keyword_data"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Accept": "application/json"
            }
            # Send as URL-encoded form data list parameters: kw[]
            data = {
                "dataSource": "gws",
                "country": "us",
                "currency": "usd",
                "kw[]": keywords
            }
            response = requests.post(url, headers=headers, data=data, timeout=12)
            if response.status_code == 200:
                res_data = response.json()
                volumes = {}
                for item in res_data.get("data", []):
                    kw = item.get("keyword")
                    vol = item.get("vol", 0)
                    if kw:
                        volumes[kw.lower().strip()] = int(vol) if vol is not None else 0
                # Ensure all requested keywords have an entry (fallback to 0 if missing in response)
                return {kw: volumes.get(kw.lower().strip(), 0) for kw in keywords}
            else:
                print(f"[KeywordVolumeService] Keywords Everywhere API returned status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"[KeywordVolumeService] Keywords Everywhere request failed: {e}")
        return None

    @staticmethod
    def _fetch_dataforseo(keywords: list, login: str, pword: str) -> dict:
        try:
            url = "https://api.dataforseo.com/v3/dataforseo_labs/google/keyword_ideas/live"
            credentials = f"{login}:{pword}"
            base64_creds = base64.b64encode(credentials.encode()).decode()
            headers = {
                "Authorization": f"Basic {base64_creds}",
                "Content-Type": "application/json"
            }
            payload = [{
                "keywords": keywords,
                "location_code": 2840,  # USA Geotarget
                "language_code": "en"
            }]
            response = requests.post(url, headers=headers, json=payload, timeout=15)
            if response.status_code == 200:
                res_data = response.json()
                volumes = {}
                tasks = res_data.get("tasks", [])
                for task in tasks:
                    result = task.get("result", [])
                    for item in result:
                        kw = item.get("keyword")
                        info = item.get("keyword_info", {})
                        vol = info.get("search_volume", 0)
                        if kw:
                            volumes[kw.lower().strip()] = int(vol) if vol is not None else 0
                return {kw: volumes.get(kw.lower().strip(), 0) for kw in keywords}
            else:
                print(f"[KeywordVolumeService] DataForSEO API returned status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"[KeywordVolumeService] DataForSEO request failed: {e}")
        return None

    @staticmethod
    def _fetch_google_ads(keywords: list, dev_token: str, client_id: str, client_secret: str, refresh_token: str, customer_id: str) -> dict:
        try:
            # Step 1: Refresh OAuth2 Token
            token_url = "https://oauth2.googleapis.com/token"
            token_data = {
                "client_id": client_id,
                "client_secret": client_secret,
                "refresh_token": refresh_token,
                "grant_type": "refresh_token"
            }
            token_res = requests.post(token_url, data=token_data, timeout=8)
            if token_res.status_code != 200:
                print(f"[KeywordVolumeService] Google Ads OAuth token refresh failed: {token_res.text}")
                return None
            access_token = token_res.json().get("access_token")

            # Step 2: Query historical search volumes
            clean_cust_id = customer_id.replace("-", "").strip()
            # Standard Google Ads GenerateKeywordIdeas endpoint v17
            url = f"https://googleads.googleapis.com/v17/customers/{clean_cust_id}/keywordPlanIdeas:generateKeywordIdeas"
            headers = {
                "Authorization": f"Bearer {access_token}",
                "developer-token": dev_token,
                "Content-Type": "application/json"
            }
            payload = {
                "geoTargetConstants": ["geoTargetConstants/2840"],  # US
                "language": "languageConstants/1000",             # en
                "keywordAndUrlSeed": {
                    "keywords": keywords
                },
                "keywordPlanNetwork": "GOOGLE_SEARCH"
            }
            response = requests.post(url, headers=headers, json=payload, timeout=15)
            if response.status_code == 200:
                res_data = response.json()
                volumes = {}
                for item in res_data.get("results", []):
                    text = item.get("text")
                    metrics = item.get("keywordIdeaMetrics", {})
                    vol = metrics.get("avgMonthlySearches", 0)
                    if text:
                        volumes[text.lower().strip()] = int(vol) if vol is not None else 0
                return {kw: volumes.get(kw.lower().strip(), 0) for kw in keywords}
            else:
                print(f"[KeywordVolumeService] Google Ads API returned status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"[KeywordVolumeService] Google Ads request failed: {e}")
        return None

    @staticmethod
    def _estimate_bulk_llm(keywords: list) -> dict:
        """
        Refined Senior SEO fallback bulk estimation using Groq.
        Forces the LLM to output highly realistic, non-round volumes for target keywords.
        """
        from services.llm_service.groq_client import llm
        
        prompt = f"""
        Act as an elite SEO analytics manager with deep expertise in United States (USA) keyword search volumes.
        
        For the following list of keywords:
        {json.dumps(keywords, indent=2)}
        
        Estimate a highly realistic monthly search volume in the USA for each keyword.
        Rules:
        - Volumes MUST be standard realistic values based on keyword broadness and commercial intent.
        - Vary the volumes naturally (e.g. 140, 880, 2900, 18100, etc.). Do not return generic round placeholders like "1000" or "5000" for every word unless highly probable.
        - Return the results STRICTLY as a JSON object, where the keys are EXACTLY the input keywords and values are estimated search volume integers.
        - Output absolutely no explanations, markdown formatting (other than JSON codeblock), or conversational text.
        
        Example Output Format:
        ```json
        {{
          "keyword one": 5400,
          "keyword two": 320
        }}
        ```
        """
        try:
            response = llm.invoke(prompt)
            content = response.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            data = json.loads(content)
            volumes = {}
            for kw in keywords:
                # Get volume, ensure it's integer
                val = data.get(kw, data.get(kw.lower(), 1000))
                try:
                    volumes[kw] = int(val)
                except:
                    volumes[kw] = 1000
            return volumes
        except Exception as e:
            print(f"[KeywordVolumeService] LLM fallback estimation failed: {e}")
            return {kw: 1000 for kw in keywords}

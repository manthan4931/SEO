import sys
from keywords.models import Keyword
from serp.models import SERPResult, PAAQuestion, PipelineLog
from services.serp_service.serp_service import (
    fetch_google_results,
    extract_organic_results,
    extract_paa
)
from services.scraper_service.process_competitor import (
    process_competitor_page
)


def log_event(keyword, message, level='INFO'):
    print(f"[{level}] {message}")
    PipelineLog.objects.create(keyword=keyword, message=message, level=level)

def process_keyword(keyword_id):
    try:
        # STEP 1 → GET KEYWORD
        keyword_obj = Keyword.objects.get(id=keyword_id)
        log_event(keyword_obj, f"Starting pipeline for keyword: {keyword_obj.keyword}")

        # STEP 2 → FETCH SERP DATA
        log_event(keyword_obj, "Fetching Google SERP data...")
        serp_data = fetch_google_results(keyword_obj.keyword)

        if not serp_data:
            log_event(keyword_obj, "No SERP data found", level='ERROR')
            return

        # STEP 3 → EXTRACT ORGANIC RESULTS
        organic_results = extract_organic_results(serp_data)
        log_event(keyword_obj, f"Extracted {len(organic_results)} organic competitors")

        # STEP 4 → EXTRACT AND SAVE PAA
        paa_questions = extract_paa(serp_data)
        log_event(keyword_obj, f"Found {len(paa_questions)} People Also Ask questions")
        
        # Save PAA to DB
        for q_text in paa_questions:
            PAAQuestion.objects.get_or_create(keyword=keyword_obj, question=q_text)

        # STEP 5 → COLLECT URLs & INITIALIZE SERP RESULTS
        urls_to_scrape = []
        serp_results_map = {}

        for idx, item in enumerate(organic_results[:10]):
            url = item.get("link") or item.get("url")
            
            existing = SERPResult.objects.filter(keyword=keyword_obj, url=url).first()
            if existing:
                log_event(keyword_obj, f"Refreshing scrape for: {url}")
                urls_to_scrape.append(url)
                serp_results_map[url] = existing
            else:
                # CREATE NEW SERP RESULT
                serp_result = SERPResult.objects.create(
                    keyword=keyword_obj,
                    title=item.get("title", ""),
                    url=url,
                    meta_description=item.get("snippet", ""),
                    rank=item.get("position", 0),
                    raw_data=item
                )
                urls_to_scrape.append(url)
                serp_results_map[url] = serp_result

        # STEP 6 → BATCH SCRAPE VIA CLI
        if urls_to_scrape:
            import subprocess
            import json
            import os
            
            log_event(keyword_obj, f"Launching batch scraper for {len(urls_to_scrape)} competitors...")
            
            try:
                # Run the standalone CLI process
                cli_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'scraper_cli.py')
                cmd = [sys.executable, cli_path, json.dumps(urls_to_scrape)]
                
                process = subprocess.run(cmd, capture_output=True, text=True)
                
                if process.returncode != 0:
                    log_event(keyword_obj, f"Scraper CLI failed: {process.stderr}", level='ERROR')
                else:
                    try:
                        scraped_data_list = json.loads(process.stdout)
                        
                        if isinstance(scraped_data_list, dict) and scraped_data_list.get("status") == "error":
                            log_event(keyword_obj, f"Scraper error: {scraped_data_list.get('message')}", level='ERROR')
                        else:
                            # STEP 7 → PROCESS AND SAVE DATA
                            for data in scraped_data_list:
                                url = data.get("url")
                                serp_result = serp_results_map.get(url)
                                
                                if data.get("status") == "success" and serp_result:
                                    process_competitor_page(serp_result, scraped_data=data)
                                    log_event(keyword_obj, f"Successfully analyzed: {url}", level='SUCCESS')
                                else:
                                    log_event(keyword_obj, f"Failed to scrape {url}: {data.get('error')}", level='WARNING')
                    except Exception as json_err:
                        log_event(keyword_obj, f"Failed to parse scraper output: {json_err}", level='ERROR')
                        print(f"RAW STDOUT: {process.stdout}")
            except Exception as cli_err:
                log_event(keyword_obj, f"Failed to launch scraper CLI: {cli_err}", level='ERROR')

        log_event(keyword_obj, "SERP Scraping Pipeline Completed", level='SUCCESS')

    except Exception as e:
        error_msg = f"Critical Pipeline Failure: {e}"
        print(error_msg)
        try:
            log_event(keyword_obj, error_msg, level='ERROR')
        except:
            pass
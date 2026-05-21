from .scraper_service import scrape_page
from competitors.models import CompetitorPage

def process_competitor_page(serp_result, browser=None, scraped_data=None):
    """
    Process a single competitor page: Scrape (if not provided), parse, and save to DB.
    """
    url = serp_result.url
    
    # STEP 1 → SCRAPE & PARSE (Only if not provided)
    if scraped_data:
        data = scraped_data
    else:
        print(f"Scraping competitor: {url}")
        data = scrape_page(url, browser=browser)

    if data.get("status") == "failed":
        print(f"Scrape failed: {data.get('status')}")
        return None

    # STEP 2 → SAVE PAGE
    competitor_page = CompetitorPage.objects.create(
        serp_result=serp_result,
        page_title=data.get("page_title") or serp_result.title,
        full_text=data.get("full_text", ""),
        markdown_content=data.get("full_text", ""), # For now, same as full_text
        word_count=data.get("word_count", 0),
        headings=data.get("headings", [])
    )

    print(f"Saved CompetitorPage for {url} ({data.get('word_count')} words)")

    # Optional: Save embeddings if needed (disabled for now to speed up)
    # from services.embedding_service.store_embedding import save_embeddings
    # save_embeddings(url=url, text=data.get("full_text", ""))

    return competitor_page

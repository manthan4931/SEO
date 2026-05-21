from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

def scrape_page(url, browser=None):
    """
    Step 03: Extract competitor page content using Playwright and BeautifulSoup.
    """
    should_close_browser = False
    try:
        if browser is None:
            p = sync_playwright().start()
            browser = p.chromium.launch(headless=True)
            should_close_browser = True

        page = browser.new_page()
        # Set a timeout and user agent
        page.set_extra_http_headers({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"})
        page.goto(url, timeout=15000, wait_until="domcontentloaded")
        content = page.content()
        page.close() # Close page but keep browser

        if should_close_browser:
            browser.close()

        soup = BeautifulSoup(content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()

        # Extract headings
        headings = []
        for tag in ['h1', 'h2', 'h3']:
            for h in soup.find_all(tag):
                headings.append({"type": tag.upper(), "text": h.get_text().strip()})

        # Extract Metadata
        title = soup.title.string if soup.title else ""
        meta_description = soup.find('meta', attrs={'name': 'description'})
        meta_description = meta_description['content'] if meta_description else ""
        
        meta_keywords = soup.find('meta', attrs={'name': 'keywords'})
        meta_keywords = meta_keywords['content'] if meta_keywords else ""

        # Extract text and word count
        text = soup.get_text(separator=' ')
        # Clean up whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)
        word_count = len(text.split())

        return {
            "url": url,
            "page_title": title,
            "meta_description": meta_description,
            "meta_keywords": meta_keywords,
            "full_text": text,
            "word_count": word_count,
            "headings": headings,
            "status": "success"
        }
    except Exception as e:
        print(f"Scraping failed for {url}: {e}")
        return {
            "full_text": "",
            "word_count": 0,
            "headings": [],
            "status": f"failed: {str(e)}"
        }
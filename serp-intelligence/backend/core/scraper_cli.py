import sys
import json
import os
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup

def scrape_batch(urls):
    results = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            for url in urls:
                try:
                    page = browser.new_page()
                    page.set_extra_http_headers({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"})
                    page.goto(url, timeout=15000, wait_until="domcontentloaded")
                    content = page.content()
                    page.close()

                    soup = BeautifulSoup(content, 'html.parser')
                    for script in soup(["script", "style"]):
                        script.decompose()

                    headings = []
                    for tag in ['h1', 'h2', 'h3']:
                        for h in soup.find_all(tag):
                            headings.append({"type": tag.upper(), "text": h.get_text().strip()})

                    title = soup.title.string if soup.title else ""
                    meta_description = soup.find('meta', attrs={'name': 'description'})
                    meta_description = meta_description['content'] if meta_description else ""

                    text = soup.get_text(separator=' ')
                    lines = (line.strip() for line in text.splitlines())
                    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                    text = '\n'.join(chunk for chunk in chunks if chunk)
                    word_count = len(text.split())

                    results.append({
                        "url": url,
                        "page_title": title,
                        "meta_description": meta_description,
                        "full_text": text,
                        "word_count": word_count,
                        "headings": headings,
                        "status": "success"
                    })
                except Exception as e:
                    results.append({"url": url, "status": "failed", "error": str(e)})
            browser.close()
    except Exception as e:
        # Global failure
        return {"status": "error", "message": str(e)}
    return results

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"status": "failed", "error": "No URLs provided"}))
    else:
        # URLs can be passed as a JSON string
        try:
            input_data = json.loads(sys.argv[1])
            if isinstance(input_data, list):
                urls = input_data
            else:
                urls = [str(input_data)]
        except:
            urls = sys.argv[1:]

        results = scrape_batch(urls)
        print(json.dumps(results))

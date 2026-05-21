import trafilatura

def extract_content(content):

    text = trafilatura.extract(content)

    if not text:
        return ""

    return text

from bs4 import BeautifulSoup

def extract_headings(html):

    soup = BeautifulSoup(html, "html.parser")

    headings = {
        "h1": [],
        "h2": [],
        "h3": []
    }

    for tag in ["h1", "h2", "h3"]:

        headings[tag] = [
            x.get_text(strip=True)
            for x in soup.find_all(tag)
        ]

    return headings
def extract_organic_results(data):

    results = []

    organic = data.get("organic_results", [])

    for item in organic:

        results.append({
            "title": item.get("title"),
            "url": item.get("link"),
            "snippet": item.get("snippet"),
            "position": item.get("position")
        })

    return results
def extract_paa(content):

    paa = content.get(
        "related_questions",
        []
    )

    questions = []

    for item in paa:

        questions.append({
            "question": item.get("question"),
            "answer": item.get("snippet")
        })

    return questions
def analyze_content_depth(competitor_pages):
    """
    Step 04 Upgrade: Know how much content you need to outrank.
    """
    word_counts = [page.word_count for page in competitor_pages]
    
    if not word_counts:
        return {
            "average_word_count": 0,
            "highest_word_count": 0,
            "authority_score": 0,
            "verdict": "No data"
        }

    avg = sum(word_counts) / len(word_counts)
    highest = max(word_counts)
    
    # Simple Authority Score logic: higher word count + more headings = higher depth
    # Scaled to 0-100
    authority_scores = []
    for page in competitor_pages:
        score = (page.word_count / 3000) * 50 + (len(page.headings) / 50) * 50
        authority_scores.append(min(100, score))
    
    avg_authority = sum(authority_scores) / len(authority_scores)

    return {
        "average_word_count": round(avg),
        "highest_word_count": highest,
        "authority_score": round(avg_authority, 1),
        "verdict": "Hard" if avg_authority > 70 else "Medium" if avg_authority > 40 else "Easy",
        "raw_scores": authority_scores
    }
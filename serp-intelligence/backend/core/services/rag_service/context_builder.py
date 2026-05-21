def build_context(contexts):
    final_context = ""
    for idx, chunk in enumerate(contexts):
        final_context += f"Chunk {idx+1}:\n{chunk}\n\n"
        # Prevent context overflow (limit to approx 6000 chars)
        if len(final_context) > 6000:
            break
    return final_context[:6000]
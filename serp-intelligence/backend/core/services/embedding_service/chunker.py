def chunk_text(content,chunk_size=500):
    words=content.split()
    chunks=[]
    for i in range(0,len(words),chunk_size):
        chunk=" ".join(words[i:i+chunk_size])
        chunks.append(chunk)
    return chunks 
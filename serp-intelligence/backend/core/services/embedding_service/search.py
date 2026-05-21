from services.embedding_service.embedder import (
    generate_embedding
)

from services.embedding_service.pinecone_service import (
    index
)

def semantic_search(query, top_k=5):

    query_embedding = generate_embedding(
        query
    )

    results = index.query(
        vector=query_embedding,
        top_k=top_k,
        include_metadata=True
    )

    return results
import uuid

from serp.models import (
    ContentEmbedding
)

from services.embedding_service.embedder import (
    generate_embedding
)

from services.embedding_service.chunker import (
    chunk_text
)

from services.embedding_service.pinecone_service import (
    index
)

def save_embeddings(url, text):

    chunks = chunk_text(text)

    for chunk in chunks:

        embedding = generate_embedding(chunk)

        vector_id = str(uuid.uuid4())

        # STORE IN PINECONE
        index.upsert(
            vectors=[
                {
                    "id": vector_id,
                    "values": embedding,
                    "metadata": {
                        "url": url,
                        "text": chunk
                    }
                }
            ]
        )

        # STORE REFERENCE IN POSTGRES
        ContentEmbedding.objects.create(
            url=url,
            chunk_text=chunk,
            pinecone_id=vector_id
        )
from services.embedding_service.search import (
    semantic_search
)

def retrieve_context(query):

    results = semantic_search(query)

    contexts = []

    for match in results["matches"]:

        text = match["metadata"]["text"]

        contexts.append(text)

    return "\n".join(contexts)
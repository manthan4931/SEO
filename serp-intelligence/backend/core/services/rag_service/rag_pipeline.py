from services.embedding_service.retriever import (
    retrieve_context
)

from services.rag_service.context_builder import (
    build_context
)

from services.llm_service.groq_client import (
    llm
)

from services.llm_service.prompt import (
    RAG_PROMPT
)

def generate_rag_response(query):

    # STEP 1 → RETRIEVE CONTEXT
    contexts = retrieve_context(query)

    # STEP 2 → BUILD CONTEXT
    final_context = build_context(
        contexts
    )

    # STEP 3 → CREATE PROMPT
    prompt = RAG_PROMPT.format(
        context=final_context,
        query=query
    )

    # STEP 4 → ASK GROQ
    response = llm.invoke(prompt)

    return response.content



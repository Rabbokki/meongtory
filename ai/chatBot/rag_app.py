from fastapi import FastAPI
from chatBot.query import search_similar
from grok import Grok  # xAI Grok API (가정)

app = FastAPI()
grok = Grok(api_key="${XAI_API_KEY}")

@app.post("/rag")
async def rag_endpoint(query: str):
    results = search_similar(query, top_k=5)
    context = "\n".join([res[0] for res in results])
    prompt = (
        "You are 멍토리 도우미, a chatbot for a pet All-in-One platform. "
        "Answer in Korean, using a friendly tone. "
        f"Context: {context}\n\nQuestion: {query}\nAnswer:"
    )
    response = grok.generate(prompt)
    return {"answer": response}
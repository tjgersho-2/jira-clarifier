# main.py (FastAPI)
import json
from fastapi import FastAPI, Depends, HTTPException
from openai import OpenAI
from pinecone import Pinecone
import psycopg2
import redis
import stripe
import os

app = FastAPI()
openai = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index("jira-vectors")
r = redis.from_url(os.getenv("REDIS_URL"))
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

def get_user(org_id: str):
    # Check Stripe + Postgres
    pass

@app.post("/clarify")
def clarify(ticket: dict, user=Depends(get_user)):
    # 1. Rate limit
    if r.incr(f"rate:{user.id}") > 10: raise HTTPException(429)
    r.expire(f"rate:{user.id}", 60)

    # 2. RAG: Find similar past tickets
    emb = openai.embeddings.create(model="text-embedding-3-small", input=ticket["description"]).data[0].embedding
    similar = index.query(vector=emb, top_k=3, include_metadata=True)

    # 3. Call fine-tuned model
    response = openai.chat.completions.create(
        model="ft:gpt-4o-mini:jira-clarify-v1",
        messages=[
            {"role": "system", "content": "You are JiraClarify AI..."},
            {"role": "user", "content": f"Title: {ticket['title']}\nDescription: {ticket['description']}"},
            {"role": "assistant", "content": f"Similar tickets:\n{similar}"}
        ]
    )
    clarified = response.choices[0].message.content

    # 4. Store for future training
    conn = psycopg2.connect(os.getenv("DATABASE_URL"))
    cur = conn.cursor()
    cur.execute("INSERT INTO tickets (...) VALUES (...)")
    conn.commit()

    return {"clarified": clarified}

@app.post("/webhook")
def stripe_webhook(request):
    payload = request.data
    event = stripe.Event.construct_from(json.loads(payload), stripe.api_key)

    if event.type == "checkout.session.completed":
        session = event.data.object
        org_id = session.client_reference_id
        # Grant access in DB
    return {"status": "success"}
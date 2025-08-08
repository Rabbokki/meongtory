from sentence_transformers import SentenceTransformer
import psycopg2
import os

model = SentenceTransformer('all-MiniLM-L6-v2')
documents = ["강아지 입양 절차는...", "펫보험 가입 방법은..."]  # 실제 데이터
embeddings = model.encode(documents)

conn = psycopg2.connect(
    dbname="meong",
    user=os.getenv("DB_USER", "jjj"),
    password=os.getenv("DB_PASSWORD", "1q2w3e4r!"),
    host="db",
    port="5432"
)
cur = conn.cursor()
cur.execute("TRUNCATE TABLE chatbot;")  # 기존 데이터 삭제 (필요 시)
for doc, emb in zip(documents, embeddings):
    cur.execute("INSERT INTO chatbot (content, embedding) VALUES (%s, %s)", (doc, emb.tolist()))
conn.commit()
cur.close()
conn.close()
from sentence_transformers import SentenceTransformer
import psycopg2

model = SentenceTransformer('all-MiniLM-L6-v2')
documents = ["강아지 입양 절차는...", "펫보험 가입 방법은..."]  # 실제 데이터
embeddings = model.encode(documents)

conn = psycopg2.connect("dbname=meongtory user=${DB_USER} password=${DB_PASSWORD} host=db port=5432")
cur = conn.cursor()
for doc, emb in zip(documents, embeddings):
    cur.execute("INSERT INTO documents (content, embedding) VALUES (%s, %s)", (doc, emb.tolist()))
conn.commit()
cur.close()
conn.close()
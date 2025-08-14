from langchain_core.documents import Document
from langchain_postgres import PGVector
from langchain_huggingface import HuggingFaceEmbeddings
from sentence_transformers import SentenceTransformer
import psycopg2

model = SentenceTransformer('all-MiniLM-L6-v2')
documents = [
    Document(
        page_content="강아지 입양 절차는 동물보호소 방문, 신분증 제출, 입양 신청서 작성, 면담, 입양비 납부 순으로 진행됩니다.",
        metadata={"source": "adoption_guide"}
    ),
    Document(
        page_content="고양이 입양 시 고려해야 할 점은 집 환경, 사료 선택, 건강 검진 주기입니다.",
        metadata={"source": "cat_adoption"}
    ),
    Document(
        page_content="애완동물 건강 관리를 위해 정기적인 예방접종과 구충제 투여가 중요합니다.",
        metadata={"source": "pet_care"}
    )
]

conn_string = "postgresql+psycopg2://jjj:1q2w3e4r!@db:5432/meong"
vectorstore = PGVector(
    connection=conn_string,
    embeddings=HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2"),
    collection_name="chatbot_vectors",
    distance_strategy="cosine",
    use_jsonb=True
)

# 기존 데이터 삭제
with psycopg2.connect(dbname="meong", user="jjj", password="1q2w3e4r!", host="db", port="5432") as conn:
    with conn.cursor() as cur:
        cur.execute("""
            DELETE FROM langchain_pg_embedding
            WHERE collection_id = (
                SELECT uuid FROM langchain_pg_collection WHERE name = %s
            )
        """, ("chatbot_vectors",))
        conn.commit()

# 새 데이터 삽입
vectorstore.add_documents(documents)
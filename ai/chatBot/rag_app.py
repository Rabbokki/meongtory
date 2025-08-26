﻿from pydantic import BaseModel
from langchain_openai import ChatOpenAI
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_postgres import PGVector
from langchain.prompts import PromptTemplate
from langchain_core.documents import Document
import os
import logging
import psycopg2
import json

# 로깅 설정
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# 환경 변수
DB_USER = os.getenv("DB_USER", "jjj")
DB_PASSWORD = os.getenv("DB_PASSWORD", "1q2w3e4r!")
DB_HOST = os.getenv("DB_HOST", "db")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "meong")
CONNECTION_STRING = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "all-MiniLM-L6-v2")
VECTORSTORE_COLLECTION_NAME = os.getenv("VECTORSTORE_COLLECTION_NAME", "chatbot_vectors")
VECTORSTORE_DISTANCE_STRATEGY = os.getenv("VECTORSTORE_DISTANCE_STRATEGY", "cosine")
VECTORSTORE_SEARCH_LIMIT = int(os.getenv("VECTORSTORE_SEARCH_LIMIT", "5"))
SAMPLE_DATA_PATH = os.getenv("SAMPLE_DATA_PATH", "/app/chatBot/sample_data.json")
PROMPT_TEMPLATE_PATH = os.getenv("PROMPT_TEMPLATE_PATH", "/app/chatBot/prompt_template.txt")

# 임베딩 모델
try:
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)
    logger.info(f"HuggingFaceEmbeddings initialized successfully with model: {EMBEDDING_MODEL_NAME}")
except Exception as e:
    logger.error(f"Failed to initialize HuggingFaceEmbeddings: {e}")
    raise Exception("Embedding initialization failed")

# PGVector 초기화
try:
    logger.debug(f"Attempting to connect to database with: {CONNECTION_STRING}")
    vectorstore = PGVector(
        connection=CONNECTION_STRING,
        embeddings=embeddings,
        collection_name=VECTORSTORE_COLLECTION_NAME,
        distance_strategy=VECTORSTORE_DISTANCE_STRATEGY,
        use_jsonb=True
    )
    logger.info("PGVector initialized successfully")
    # 테이블 및 컬렉션 확인
    with psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    ) as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'langchain_pg_embedding')")
            table_exists = cur.fetchone()[0]
            logger.debug(f"langchain_pg_embedding table exists: {table_exists}")
            cur.execute("SELECT COUNT(*) FROM langchain_pg_collection WHERE name = %s", (VECTORSTORE_COLLECTION_NAME,))
            collection_count = cur.fetchone()[0]
            logger.debug(f"{VECTORSTORE_COLLECTION_NAME} collection exists: {collection_count}")
except Exception as e:
    logger.error(f"Failed to initialize PGVector: {e}", exc_info=True)
    raise Exception(f"Vectorstore initialization failed: {str(e)}")

# 샘플 데이터 삽입
def initialize_vectorstore():
    try:
        logger.debug("Starting initialize_vectorstore")
        logger.info(f"Checking for existing data in {VECTORSTORE_COLLECTION_NAME}")
        existing_docs = vectorstore.similarity_search("강아지 입양", k=1)
        logger.debug(f"Existing docs: {existing_docs}")

        # 기존 데이터 확인 및 삭제
        with psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        ) as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT COUNT(*)
                    FROM langchain_pg_embedding e
                    JOIN langchain_pg_collection c ON e.collection_id = c.uuid
                    WHERE c.name = %s
                """, (VECTORSTORE_COLLECTION_NAME,))
                count = cur.fetchone()[0]
                logger.debug(f"Existing records in {VECTORSTORE_COLLECTION_NAME}: {count}")

                if count > 0:
                    logger.info(f"Deleting existing data in {VECTORSTORE_COLLECTION_NAME}")
                    cur.execute("""
                        DELETE FROM langchain_pg_embedding
                        WHERE collection_id = (
                            SELECT uuid FROM langchain_pg_collection WHERE name = %s
                        )
                    """, (VECTORSTORE_COLLECTION_NAME,))
                    conn.commit()
                    logger.info("Existing data deleted")

        # 샘플 데이터 삽입
        logger.info(f"Inserting sample data into {VECTORSTORE_COLLECTION_NAME}")
        try:
            with open(SAMPLE_DATA_PATH, 'r', encoding='utf-8') as f:
                sample_data = json.load(f)
            sample_docs = [Document(**doc) for doc in sample_data]
        except Exception as e:
            logger.error(f"Failed to load sample data from {SAMPLE_DATA_PATH}: {str(e)}")
            raise Exception(f"Sample data loading failed: {str(e)}")
        vectorstore.add_documents(sample_docs)
        logger.info("Sample data inserted successfully")
    except Exception as e:
        logger.error(f"Failed to insert sample data: {str(e)}")
        raise Exception(f"Sample data insertion failed: {str(e)}")

# OpenAI 모델
try:
    llm = ChatOpenAI(
        api_key=OPENAI_API_KEY,
        model=OPENAI_MODEL,
        max_tokens=100  # 응답 길이 제한
    )
    logger.info("ChatOpenAI initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize ChatOpenAI: {e}")
    raise Exception("LLM initialization failed")

# 프롬프트 템플릿
try:
    with open(PROMPT_TEMPLATE_PATH, 'r', encoding='utf-8') as f:
        prompt_template_content = f.read()
    prompt_template = PromptTemplate(input_variables=["context", "query"], template=prompt_template_content)
    logger.info(f"Prompt template loaded successfully from {PROMPT_TEMPLATE_PATH}")
except Exception as e:
    logger.error(f"Failed to load prompt template from {PROMPT_TEMPLATE_PATH}: {e}")
    raise Exception("Prompt template loading failed")

class QueryRequest(BaseModel):
    query: str

async def process_rag_query(query: str):
    try:
        logger.info(f"Processing query: {query}")
        results = vectorstore.similarity_search(query, k=VECTORSTORE_SEARCH_LIMIT)
        context = "\n".join([doc.page_content for doc in results])
        prompt = prompt_template.format(context=context, query=query)
        response = llm.invoke(prompt)
        logger.info(f"Query response: {response.content}")
        return {"answer": response.content}
    except Exception as e:
        logger.error(f"Error processing query: {e}", exc_info=True)
        raise Exception(f"Query processing failed: {str(e)}")

# 서버 시작 시 vectorstore 초기화
# initialize_vectorstore()  # 샘플 데이터 로딩 비활성화
#!/usr/bin/env python3
"""
사료 검색 디버깅 스크립트
"""

import os
import sys
from dotenv import load_dotenv
from embedding_update import EmbeddingUpdater

# 환경변수 로드
load_dotenv()

def debug_saeryo_search():
    """사료 검색 디버깅"""
    updater = EmbeddingUpdater()
    
    print("=== 사료 검색 디버깅 ===")
    
    # 1. 사료가 포함된 상품들 확인
    print("\n1. 사료가 포함된 상품들:")
    with updater.get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT naver_product_id, title 
                FROM naver_product 
                WHERE title LIKE '%사료%' 
                LIMIT 10
            """)
            products = cursor.fetchall()
            
            for product_id, title in products:
                print(f"- ID: {product_id}, 제목: {title}")
    
    # 2. "사료" 검색어의 임베딩 생성
    print("\n2. '사료' 검색어 임베딩 생성:")
    query_embedding = updater.generate_embedding("사료")
    if query_embedding:
        print(f"임베딩 차원: {len(query_embedding)}")
        print(f"임베딩 샘플: {query_embedding[:5]}...")
    else:
        print("임베딩 생성 실패!")
        return
    
    # 3. 유사도 검색 (임계값 없이)
    print("\n3. 유사도 검색 결과 (임계값 없음):")
    similar_products = updater.search_similar_products(query_embedding, 10, similarity_threshold=0.0)
    
    for i, product in enumerate(similar_products, 1):
        print(f"{i}. 유사도: {product.get('similarity', 0):.3f} - {product.get('title', '제목 없음')}")
    
    # 4. 사료가 포함된 상품들의 임베딩과 유사도 계산
    print("\n4. 사료 포함 상품들의 개별 유사도:")
    with updater.get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute("""
                SELECT naver_product_id, title, title_embedding 
                FROM naver_product 
                WHERE title LIKE '%사료%' AND title_embedding IS NOT NULL
                LIMIT 5
            """)
            products = cursor.fetchall()
            
            for product_id, title, embedding in products:
                if embedding:
                    # 유사도 계산
                    similarity = updater.calculate_similarity(query_embedding, embedding)
                    print(f"- 유사도: {similarity:.3f} - {title}")

if __name__ == "__main__":
    debug_saeryo_search()

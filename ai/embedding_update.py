#!/usr/bin/env python3
"""
네이버 상품 title을 OpenAI 임베딩으로 변환하여 DB에 저장하는 스크립트
"""

import os
import sys
import time
import psycopg2
import requests
import json
from typing import List, Optional
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()

class EmbeddingUpdater:
    def __init__(self):
        self.openai_api_key = os.getenv('OPENAI_API_KEY')
        
        # 환경변수에서 DB 연결 정보 가져오기
        db_host = os.getenv('DB_HOST', 'localhost')
        db_port = os.getenv('DB_PORT', '5432')
        db_name = os.getenv('DB_NAME', 'meong')
        db_user = os.getenv('DB_USER', 'jjj')
        db_password = os.getenv('DB_PASSWORD', '1q2w3e4r!')
        
        self.db_url = f'postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
        
        if not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY 환경변수가 설정되지 않았습니다.")
    
    def get_db_connection(self):
        """데이터베이스 연결"""
        return psycopg2.connect(self.db_url)
    
    def generate_embedding(self, text: str) -> Optional[List[float]]:
        """OpenAI API를 사용하여 텍스트를 임베딩으로 변환"""
        try:
            headers = {
                'Authorization': f'Bearer {self.openai_api_key}',
                'Content-Type': 'application/json'
            }
            
            data = {
                'input': text,
                'model': 'text-embedding-ada-002'
            }
            
            response = requests.post(
                'https://api.openai.com/v1/embeddings',
                headers=headers,
                json=data,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result['data'][0]['embedding']
            else:
                print(f"OpenAI API 오류: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"임베딩 생성 실패: {e}")
            return None
    
    def embedding_to_vector_string(self, embedding: List[float]) -> str:
        """임베딩을 PostgreSQL vector 형식의 문자열로 변환"""
        if not embedding:
            return None
        
        vector_str = '[' + ','.join(map(str, embedding)) + ']'
        return vector_str
    
    def get_products_without_embedding(self, limit: int = 100) -> List[tuple]:
        """임베딩이 없는 상품들을 조회"""
        with self.get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT naver_product_id, title 
                    FROM naver_product 
                    WHERE title_embedding IS NULL 
                    AND title IS NOT NULL 
                    AND title != ''
                    LIMIT %s
                """, (limit,))
                return cursor.fetchall()
    
    def update_product_embedding(self, product_id: int, embedding_vector: str):
        """상품의 임베딩을 업데이트"""
        with self.get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE naver_product 
                    SET title_embedding = %s::vector, updated_at = CURRENT_TIMESTAMP
                    WHERE naver_product_id = %s
                """, (embedding_vector, product_id))
                conn.commit()
    
    def count_products_without_embedding(self) -> int:
        """임베딩이 없는 상품 수 조회"""
        with self.get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT COUNT(*) 
                    FROM naver_product 
                    WHERE title_embedding IS NULL 
                    AND title IS NOT NULL 
                    AND title != ''
                """)
                return cursor.fetchone()[0]
    
    def update_all_embeddings(self, batch_size: int = 100):
        """모든 상품의 임베딩을 업데이트"""
        print("네이버 상품 임베딩 업데이트를 시작합니다...")
        
        total_processed = 0
        total_updated = 0
        
        while True:
            # 임베딩이 없는 상품들을 배치로 조회
            products = self.get_products_without_embedding(batch_size)
            
            if not products:
                print("더 이상 업데이트할 상품이 없습니다.")
                break
            
            print(f"배치 처리 중: {len(products)}개 상품")
            
            for product_id, title in products:
                try:
                    # 임베딩 생성
                    embedding = self.generate_embedding(title)
                    
                    if embedding:
                        # PostgreSQL vector 형식으로 변환
                        vector_string = self.embedding_to_vector_string(embedding)
                        
                        # DB 업데이트
                        self.update_product_embedding(product_id, vector_string)
                        
                        total_updated += 1
                        print(f"✓ 상품 ID {product_id}: '{title[:50]}...' 임베딩 업데이트 완료")
                    else:
                        print(f"✗ 상품 ID {product_id}: 임베딩 생성 실패")
                    
                    total_processed += 1
                    
                    # API 호출 제한을 위한 딜레이 (초당 3회 제한)
                    time.sleep(0.35)
                    
                except Exception as e:
                    print(f"✗ 상품 ID {product_id} 처리 실패: {e}")
                    total_processed += 1
            
            # 진행 상황 출력
            print(f"진행 상황: {total_processed}개 처리됨, {total_updated}개 업데이트됨")
            print("-" * 50)
        
        print(f"임베딩 업데이트 완료: 총 {total_processed}개 처리됨, {total_updated}개 업데이트됨")

def main():
    try:
        updater = EmbeddingUpdater()
        
        # 임베딩이 없는 상품 수 확인
        count = updater.count_products_without_embedding()
        print(f"임베딩이 없는 상품 수: {count}개")
        
        if count == 0:
            print("모든 상품에 임베딩이 이미 설정되어 있습니다.")
            return
        
        # 사용자 확인
        response = input(f"{count}개 상품의 임베딩을 업데이트하시겠습니까? (y/N): ")
        if response.lower() != 'y':
            print("취소되었습니다.")
            return
        
        # 임베딩 업데이트 실행
        updater.update_all_embeddings()
        
    except Exception as e:
        print(f"오류 발생: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

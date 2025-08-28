#!/usr/bin/env python3
"""
네이버 상품 title을 OpenAI 임베딩으로 변환하여 DB에 저장하는 스크립트
MyPet 태깅 기능을 포함한 개인화된 검색 및 추천 시스템
"""

import os
import sys
import time
import psycopg2
import requests
import json
import httpx
from typing import List, Optional, Dict, Any
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
        
        # 백엔드 서비스 URL
        self.backend_url = os.getenv('BACKEND_URL', 'http://backend:8080')
        self.internal_api_key = os.getenv('INTERNAL_API_KEY', 'default-internal-key')
        
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
    
    def get_products_without_embedding(self, limit: int = 500) -> List[tuple]:
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
    
    def update_all_embeddings(self, batch_size: int = 500):
        """모든 상품의 임베딩을 업데이트"""
        print("네이버 상품 임베딩 업데이트를 시작합니다...")
        
        total_processed = 0
        total_updated = 0
        
        while True:
            # 임베딩이 없는 상품들을 배치로 조회 (전체 상품 처리)
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

    async def get_mypet_info(self, pet_id: int) -> Optional[Dict[str, Any]]:
        """백엔드에서 MyPet 정보를 가져오는 함수 (내부 통신)"""
        try:
            headers = {"X-Internal-Key": self.internal_api_key}
            
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.backend_url}/api/mypet/internal/{pet_id}", headers=headers)
                if response.status_code == 200:
                    pet_data = response.json()
                    if pet_data.get('success'):
                        return pet_data.get('data', {})
                    else:
                        print(f"Failed to get pet info for petId {pet_id}: {pet_data.get('error')}")
                        return None
                else:
                    print(f"Failed to get pet info for petId {pet_id}: HTTP {response.status_code}")
                    return None
        except Exception as e:
            print(f"Error getting pet info for petId {pet_id}: {str(e)}")
            return None

    def extract_pet_info_from_query(self, query: str) -> tuple[str, Optional[int]]:
        """쿼리에서 @태그와 petId를 추출"""
        import re
        
        # @태그 패턴 매칭
        pet_matches = re.findall(r'@([ㄱ-ㅎ가-힣a-zA-Z0-9_]+)', query)
        
        if pet_matches:
            pet_name = pet_matches[0]
            # petId는 별도로 전달받아야 함 (여기서는 이름만 반환)
            return query, pet_name
        else:
            return query, None

    def enhance_query_with_pet_info(self, query: str, pet_info: Dict[str, Any]) -> str:
        """펫 정보를 쿼리에 포함하여 개인화된 검색 수행"""
        if not pet_info:
            return query
        
        # 펫 기본 정보
        pet_name = pet_info.get('name', 'N/A')
        pet_breed = pet_info.get('breed', 'N/A')
        pet_age = pet_info.get('age', 'N/A')
        pet_gender = pet_info.get('gender', 'N/A')
        pet_type = pet_info.get('type', 'N/A')
        pet_weight = pet_info.get('weight', 'N/A')
        pet_microchip = pet_info.get('microchipId', 'N/A')
        
        # 의료기록 정보
        medical_history = pet_info.get('medicalHistory', '')
        vaccinations = pet_info.get('vaccinations', '')
        special_needs = pet_info.get('specialNeeds', '')
        notes = pet_info.get('notes', '')
        
        # 의료기록 정보 구성
        medical_info = ""
        if medical_history:
            medical_info += f"의료기록: {medical_history}, "
        if vaccinations:
            medical_info += f"예방접종: {vaccinations}, "
        if special_needs:
            medical_info += f"특별관리: {special_needs}, "
        if notes:
            medical_info += f"메모: {notes}, "
        
        # 개인화된 쿼리 구성
        enhanced_query = f"""
펫 정보: 이름={pet_name}, 품종={pet_breed}, 나이={pet_age}세, 성별={pet_gender}, 종류={pet_type}, 체중={pet_weight}kg, 마이크로칩={pet_microchip}, {medical_info}

사용자 검색어: {query}

위의 펫 정보를 고려하여 개인화된 상품을 추천해주세요.
"""
        return enhanced_query.strip()

    def filter_products_by_pet(self, products: List[Dict[str, Any]], pet_info: Dict[str, Any], original_query: str = "") -> List[Dict[str, Any]]:
        """펫 정보와 검색어를 기반으로 상품을 필터링하고 점수 조정"""
        if not pet_info:
            return products
        
        pet_name = pet_info.get('name', '').lower()
        breed = pet_info.get('breed', '').lower()
        age = pet_info.get('age', 0)
        gender = pet_info.get('gender', '').lower()
        
        # 검색어에서 카테고리 키워드 추출
        query_lower = original_query.lower()
        
        # 펫 관련 키워드 정의
        pet_keywords = {
            '강아지': ['강아지', '개', '반려견', 'puppy', 'dog'],
            '고양이': ['고양이', '고양', '반려묘', 'cat', 'kitten'],
            '사료': ['사료', '먹이', '식사', 'food', 'feed'],
            '간식': ['간식', '스낵', 'treat', 'snack'],
            '장난감': ['장난감', 'toy', 'play'],
            '용품': ['용품', '도구', 'tool', 'accessory'],
            '의류': ['의류', '옷', 'clothes', 'wear', '티셔츠', '나시', '실내복', '올인원'],
            '건강': ['건강', '의료', 'health', 'medical']
        }
        
        # 검색어에서 요청된 카테고리 확인
        requested_category = None
        for category, keywords in pet_keywords.items():
            if any(keyword in query_lower for keyword in keywords):
                requested_category = category
                break
        
        for product in products:
            score_boost = 0
            title = product.get('title', '').lower()
            description = product.get('description', '').lower()
            category1 = product.get('category1', '').lower()
            category2 = product.get('category2', '').lower()
            
            product_text = f"{title} {description} {category1} {category2}"
            
            # 1. 검색어 카테고리 매칭 (최우선)
            if requested_category:
                category_keywords = pet_keywords.get(requested_category, [])
                if any(keyword in product_text for keyword in category_keywords):
                    score_boost += 0.5  # 높은 점수
                    print(f"카테고리 매칭: {requested_category} - {title[:50]}...")
            
            # 2. 품종 매칭 (중간 점수)
            if breed and any(breed_keyword in product_text for breed_keyword in pet_keywords.get('강아지', []) + pet_keywords.get('고양이', [])):
                score_boost += 0.2
            
            # 3. 나이 기반 필터링
            if age:
                if age < 1:  # 어린 동물
                    if any(keyword in product_text for keyword in ['어린', '유아', 'baby', 'young']):
                        score_boost += 0.1
                elif age > 7:  # 노령 동물
                    if any(keyword in product_text for keyword in ['노령', '시니어', 'senior', 'old']):
                        score_boost += 0.1
            
            # 4. 성별 기반 필터링
            if gender:
                if gender == '수컷' and any(keyword in product_text for keyword in ['수컷', 'male', '남성']):
                    score_boost += 0.05
                elif gender == '암컷' and any(keyword in product_text for keyword in ['암컷', 'female', '여성']):
                    score_boost += 0.05
            
            # 5. 기타 카테고리 매칭 (낮은 점수)
            for category, keywords in pet_keywords.items():
                if category != requested_category and any(keyword in product_text for keyword in keywords):
                    score_boost += 0.05
            
            # 유사도 점수에 펫 기반 점수 추가
            current_similarity = product.get('similarity', 0.0)
            product['similarity'] = min(1.0, current_similarity + score_boost)
            product['pet_score_boost'] = score_boost
        
        # 펫 기반 점수로 재정렬
        products.sort(key=lambda x: x.get('similarity', 0.0), reverse=True)
        return products

    async def search_similar_products_with_pet(self, query: str, pet_id: int, limit: int = 10) -> List[Dict[str, Any]]:
        """MyPet 정보를 포함한 개인화된 상품 검색"""
        try:
            print(f"MyPet 검색 요청: query='{query}', petId={pet_id}, limit={limit}")
            
            # 1. 쿼리에서 @태그 추출 (다중 펫 처리)
            pet_tags = self.extract_pet_tags_from_query(query)
            print(f"추출된 펫 태그: {pet_tags}")
            
            # 2. 카테고리 키워드 추출
            category_keywords = self.extract_category_keywords(query)
            print(f"카테고리 키워드: {category_keywords}")
            
            # 3. MyPet 정보 가져오기
            pet_info = await self.get_mypet_info(pet_id)
            if not pet_info:
                print(f"펫 정보를 찾을 수 없습니다: petId={pet_id}")
                return []
            
            # 4. 개인화된 검색 수행 (카테고리별 검색 강화)
            results = await self.search_products_by_category_and_pet(
                query, pet_info, category_keywords, limit
            )
            
            print(f"펫 기반 필터링 완료: {len(results)}개 상품")
            print(f"최종 결과: {len(results)}개 상품 (요청: {limit}개)")
            
            return results
            
        except Exception as e:
            print(f"MyPet 검색 오류: {e}")
            return []
    
    def extract_pet_tags_from_query(self, query: str) -> List[str]:
        """쿼리에서 @태그들을 추출"""
        import re
        pet_matches = re.findall(r'@([ㄱ-ㅎ가-힣a-zA-Z0-9_]+)', query)
        return pet_matches
    
    def extract_category_keywords(self, query: str) -> List[str]:
        """쿼리에서 카테고리 키워드 추출"""
        query_lower = query.lower()
        categories = {
            '사료': ['사료', '먹이', '식사', 'food', 'feed'],
            '간식': ['간식', '스낵', 'treat', 'snack'],
            '장난감': ['장난감', 'toy', 'play'],
            '의류': ['옷', '의류', 'clothes', 'wear', '티셔츠', '나시', '실내복', '올인원', '코트', '패딩'],
            '용품': ['용품', '도구', 'tool', 'accessory', '목줄', '하네스', '배변패드'],
            '건강': ['건강', '의료', 'health', 'medical', '영양제', '비타민'],
            '미용': ['미용', 'grooming', '샴푸', '브러시', '가위']
        }
        
        found_categories = []
        for category, keywords in categories.items():
            if any(keyword in query_lower for keyword in keywords):
                found_categories.append(category)
        
        return found_categories
    
    async def search_products_by_category_and_pet(self, query: str, pet_info: Dict[str, Any], category_keywords: List[str], limit: int) -> List[Dict[str, Any]]:
        """카테고리와 펫 정보를 기반으로 상품 검색"""
        try:
            # 1. 기본 쿼리 임베딩 생성
            basic_query_embedding = self.generate_embedding(query)
            if not basic_query_embedding:
                return []
            
            # 2. 펫 정보 기반 강화 쿼리 생성
            enhanced_query = self.create_enhanced_query_for_search(query, pet_info, category_keywords)
            print(f"강화된 검색 쿼리: {enhanced_query}")
            
            # 3. 강화된 쿼리로 임베딩 검색
            query_vector_string = self.embedding_to_vector_string(basic_query_embedding)
            
            # 카테고리가 명확한 경우 더 많은 상품 검색 후 필터링
            search_limit = limit * 5 if category_keywords else limit * 2
            
            with self.get_db_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        SELECT 
                            naver_product_id,
                            title,
                            description,
                            price,
                            image_url,
                            mall_name,
                            product_url,
                            brand,
                            maker,
                            category1,
                            category2,
                            category3,
                            category4,
                            review_count,
                            rating,
                            search_count,
                            created_at,
                            updated_at,
                            1 - (title_embedding <=> %s::vector) as similarity
                        FROM naver_product 
                        WHERE title_embedding IS NOT NULL
                        ORDER BY title_embedding <=> %s::vector
                        LIMIT %s
                    """, (query_vector_string, query_vector_string, search_limit))
                    
                    results = []
                    for row in cursor.fetchall():
                        product = {
                            'id': row[0],
                            'title': row[1],
                            'description': row[2],
                            'price': row[3],
                            'image_url': row[4],
                            'mall_name': row[5],
                            'product_url': row[6],
                            'brand': row[7],
                            'maker': row[8],
                            'category1': row[9],
                            'category2': row[10],
                            'category3': row[11],
                            'category4': row[12],
                            'review_count': row[13],
                            'rating': row[14],
                            'search_count': row[15],
                            'created_at': row[16].isoformat() if row[16] else None,
                            'updated_at': row[17].isoformat() if row[17] else None,
                            'similarity': float(row[18]) if row[18] else 0.0
                        }
                        results.append(product)
            
            # 4. 펫 정보와 카테고리 기반 필터링
            filtered_results = self.filter_products_by_pet_and_category(results, pet_info, category_keywords, query)
            
            # 5. 최종 결과 수 제한
            final_results = filtered_results[:limit]
            
            return final_results
            
        except Exception as e:
            print(f"카테고리별 펫 검색 실패: {e}")
            return []
    
    def create_enhanced_query_for_search(self, query: str, pet_info: Dict[str, Any], category_keywords: List[str]) -> str:
        """검색용 강화 쿼리 생성"""
        pet_name = pet_info.get('name', 'N/A')
        pet_breed = pet_info.get('breed', 'N/A')
        pet_age = pet_info.get('age', 'N/A')
        pet_gender = pet_info.get('gender', 'N/A')
        pet_type = pet_info.get('type', 'N/A')
        pet_weight = pet_info.get('weight', 'N/A')
        
        # 카테고리별 특화 키워드 추가
        category_specific = ""
        if '의류' in category_keywords:
            category_specific = f"{pet_breed} {pet_type} 의류 옷"
        elif '사료' in category_keywords:
            category_specific = f"{pet_breed} {pet_type} 사료 먹이"
        elif '간식' in category_keywords:
            category_specific = f"{pet_breed} {pet_type} 간식 스낵"
        elif '장난감' in category_keywords:
            category_specific = f"{pet_breed} {pet_type} 장난감"
        
        enhanced_query = f"{query} {category_specific} {pet_breed} {pet_type}"
        return enhanced_query.strip()
    
    def filter_products_by_pet_and_category(self, products: List[Dict[str, Any]], pet_info: Dict[str, Any], category_keywords: List[str], original_query: str) -> List[Dict[str, Any]]:
        """펫 정보와 카테고리를 기반으로 상품 필터링"""
        try:
            pet_name = pet_info.get('name', '').lower()
            breed = pet_info.get('breed', '').lower()
            age = pet_info.get('age', 0)
            gender = pet_info.get('gender', '').lower()
            pet_type = pet_info.get('type', '').lower()
            weight = pet_info.get('weight', 0)
            
            # 카테고리별 필터링 키워드
            category_filters = {
                '의류': ['옷', '의류', 'clothes', 'wear', '티셔츠', '나시', '실내복', '올인원', '코트', '패딩', '조끼'],
                '사료': ['사료', '먹이', '식사', 'food', 'feed', '드라이', '웻'],
                '간식': ['간식', '스낵', 'treat', 'snack', '껌', '비스킷'],
                '장난감': ['장난감', 'toy', 'play', '공', '로프', '인형'],
                '용품': ['용품', '도구', 'tool', 'accessory', '목줄', '하네스', '배변패드', '캐리어'],
                '건강': ['건강', '의료', 'health', 'medical', '영양제', '비타민', '프로바이오틱스'],
                '미용': ['미용', 'grooming', '샴푸', '브러시', '가위', '클리퍼']
            }
            
            filtered_products = []
            for product in products:
                title = product['title'].lower()
                description = product.get('description', '').lower()
                
                score = 0
                
                # 1. 카테고리 매칭 점수
                for category in category_keywords:
                    if category in category_filters:
                        for keyword in category_filters[category]:
                            if keyword in title:
                                score += 3
                            if keyword in description:
                                score += 1
                
                # 2. 펫 타입 매칭 점수
                if pet_type in title:
                    score += 2
                if breed in title:
                    score += 2
                
                # 3. 크기별 매칭 점수
                if weight < 10:  # 소형
                    if any(word in title for word in ['소형', '미니', '스몰', '퍼피']):
                        score += 2
                elif weight > 25:  # 대형
                    if any(word in title for word in ['대형', '라지', '자이언트', '어덜트']):
                        score += 2
                else:  # 중형
                    if any(word in title for word in ['중형', '미디엄']):
                        score += 2
                
                # 4. 나이별 매칭 점수
                if age <= 1:  # 어린
                    if any(word in title for word in ['퍼피', '키튼', '유아', '어린']):
                        score += 2
                elif age >= 7:  # 노령
                    if any(word in title for word in ['시니어', '노령', '어덜트']):
                        score += 2
                else:  # 성견
                    if any(word in title for word in ['어덜트', '성견']):
                        score += 2
                
                # 5. 기본 유사도 점수
                score += product.get('similarity', 0) * 10
                
                if score > 0:
                    product['pet_match_score'] = score
                    filtered_products.append(product)
            
            # 점수로 정렬
            filtered_products.sort(key=lambda x: x.get('pet_match_score', 0), reverse=True)
            
            return filtered_products
            
        except Exception as e:
            print(f"펫 및 카테고리 필터링 실패: {e}")
            return products

    async def search_similar_products(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """임베딩 기반 상품 검색 (일반 검색용)"""
        try:
            # 1. 쿼리 임베딩 생성
            query_embedding = self.generate_embedding(query)
            if not query_embedding:
                print("쿼리 임베딩 생성 실패")
                return []
            
            # 2. 벡터 검색 실행
            query_vector_string = self.embedding_to_vector_string(query_embedding)
            
            with self.get_db_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        SELECT 
                            naver_product_id,
                            title,
                            description,
                            price,
                            image_url,
                            mall_name,
                            product_url,
                            brand,
                            maker,
                            category1,
                            category2,
                            category3,
                            category4,
                            review_count,
                            rating,
                            search_count,
                            created_at,
                            updated_at,
                            1 - (title_embedding <=> %s::vector) as similarity
                        FROM naver_product 
                        WHERE title_embedding IS NOT NULL
                        ORDER BY title_embedding <=> %s::vector
                        LIMIT %s
                    """, (query_vector_string, query_vector_string, limit))
                    
                    results = []
                    for row in cursor.fetchall():
                        product = {
                            'id': row[0],
                            'title': row[1],
                            'description': row[2],
                            'price': row[3],
                            'image_url': row[4],
                            'mall_name': row[5],
                            'product_url': row[6],
                            'brand': row[7],
                            'maker': row[8],
                            'category1': row[9],
                            'category2': row[10],
                            'category3': row[11],
                            'category4': row[12],
                            'review_count': row[13],
                            'rating': row[14],
                            'search_count': row[15],
                            'created_at': row[16].isoformat() if row[16] else None,
                            'updated_at': row[17].isoformat() if row[17] else None,
                            'similarity': float(row[18]) if row[18] else 0.0
                        }
                        results.append(product)
            
            print(f"일반 검색 완료: {len(results)}개 상품")
            return results
                    
        except Exception as e:
            print(f"임베딩 검색 실패: {e}")
            return []

async def main():
    try:
        updater = EmbeddingUpdater()
        
        # 명령행 인수 확인
        if len(sys.argv) > 1:
            if sys.argv[1] == '--auto':
                # 자동 실행 모드 (임베딩 업데이트)
                auto_mode = True
                search_mode = False
            elif sys.argv[1] == '--search':
                # 검색 모드 (MyPet 태깅 검색 테스트)
                auto_mode = False
                search_mode = True
            else:
                auto_mode = False
                search_mode = False
        else:
            auto_mode = False
            search_mode = False
        
        if search_mode:
            # MyPet 태깅 검색 테스트
            test_query = input("검색어를 입력하세요 (예: @정혜선 강아지 사료): ")
            pet_id = input("petId를 입력하세요 (선택사항, Enter로 건너뛰기): ")
            
            pet_id = int(pet_id) if pet_id.strip() else None
            
            results = await updater.search_similar_products_with_pet(test_query, pet_id, limit=5)
            
            print(f"\n검색 결과 ({len(results)}개):")
            for i, product in enumerate(results, 1):
                print(f"{i}. {product['title']}")
                print(f"   유사도: {product.get('similarity', 0):.3f}")
                print(f"   펫 점수: {product.get('pet_score_boost', 0):.3f}")
                print(f"   가격: {product.get('price', 0):,}원")
                print()
            
            return
        
        # 기존 임베딩 업데이트 로직
        count = updater.count_products_without_embedding()
        print(f"임베딩이 없는 상품 수: {count}개")
        
        if count == 0:
            print("모든 상품에 임베딩이 이미 설정되어 있습니다.")
            return
        
        if auto_mode:
            print("자동 실행 모드: 사용자 확인 없이 임베딩 업데이트를 시작합니다.")
        else:
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
    import asyncio
    asyncio.run(main())

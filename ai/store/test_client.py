#!/usr/bin/env python3
"""
StoreAI API 테스트 클라이언트
"""

import requests
import json
import time
from typing import Dict, Any

class StoreAITestClient:
    def __init__(self, base_url: str = "http://localhost:9000"):
        self.base_url = base_url
        self.session = requests.Session()
    
    def test_health(self) -> Dict[str, Any]:
        """헬스 체크 테스트"""
        print("🔍 헬스 체크 테스트...")
        try:
            response = self.session.get(f"{self.base_url}/storeai/health")
            result = {
                "success": response.status_code == 200,
                "status_code": response.status_code,
                "response": response.json() if response.status_code == 200 else response.text
            }
            print(f"✅ 헬스 체크 결과: {result}")
            return result
        except Exception as e:
            print(f"❌ 헬스 체크 실패: {e}")
            return {"success": False, "error": str(e)}
    
    def test_root(self) -> Dict[str, Any]:
        """루트 엔드포인트 테스트"""
        print("🏠 루트 엔드포인트 테스트...")
        try:
            response = self.session.get(f"{self.base_url}/")
            result = {
                "success": response.status_code == 200,
                "status_code": response.status_code,
                "response": response.json() if response.status_code == 200 else response.text
            }
            print(f"✅ 루트 엔드포인트 결과: {result}")
            return result
        except Exception as e:
            print(f"❌ 루트 엔드포인트 실패: {e}")
            return {"success": False, "error": str(e)}
    
    def test_categories(self) -> Dict[str, Any]:
        """카테고리 목록 테스트"""
        print("📂 카테고리 목록 테스트...")
        try:
            response = self.session.get(f"{self.base_url}/storeai/categories")
            result = {
                "success": response.status_code == 200,
                "status_code": response.status_code,
                "response": response.json() if response.status_code == 200 else response.text
            }
            print(f"✅ 카테고리 목록 결과: {result}")
            return result
        except Exception as e:
            print(f"❌ 카테고리 목록 실패: {e}")
            return {"success": False, "error": str(e)}
    
    def test_breed_recommendations(self, breed: str = "골든리트리버", pet_type: str = "dog") -> Dict[str, Any]:
        """품종별 추천 테스트"""
        print(f"🐕 품종별 추천 테스트 ({breed})...")
        try:
            response = self.session.get(f"{self.base_url}/storeai/breed-recommendations/{breed}", 
                                      params={"pet_type": pet_type})
            result = {
                "success": response.status_code == 200,
                "status_code": response.status_code,
                "response": response.json() if response.status_code == 200 else response.text
            }
            print(f"✅ 품종별 추천 결과: {result}")
            return result
        except Exception as e:
            print(f"❌ 품종별 추천 실패: {e}")
            return {"success": False, "error": str(e)}
    
    def test_season(self) -> Dict[str, Any]:
        """계절 정보 테스트"""
        print("🌤️ 계절 정보 테스트...")
        try:
            response = self.session.get(f"{self.base_url}/storeai/season")
            result = {
                "success": response.status_code == 200,
                "status_code": response.status_code,
                "response": response.json() if response.status_code == 200 else response.text
            }
            print(f"✅ 계절 정보 결과: {result}")
            return result
        except Exception as e:
            print(f"❌ 계절 정보 실패: {e}")
            return {"success": False, "error": str(e)}
    
    def test_recommendation(self, age: int = 3, breed: str = "골든리트리버", 
                          pet_type: str = "dog", recommendation_type: str = "SIMILAR") -> Dict[str, Any]:
        """상품 추천 테스트"""
        print(f"🎯 상품 추천 테스트 ({age}살 {breed})...")
        try:
            payload = {
                "age": age,
                "breed": breed,
                "petType": pet_type,
                "recommendationType": recommendation_type
            }
            
            response = self.session.post(f"{self.base_url}/storeai/recommend", 
                                       json=payload,
                                       headers={"Content-Type": "application/json"})
            
            result = {
                "success": response.status_code == 200,
                "status_code": response.status_code,
                "response": response.json() if response.status_code == 200 else response.text
            }
            print(f"✅ 상품 추천 결과: {result}")
            return result
        except Exception as e:
            print(f"❌ 상품 추천 실패: {e}")
            return {"success": False, "error": str(e)}
    
    def run_all_tests(self) -> Dict[str, Any]:
        """모든 테스트 실행"""
        print("🧪 StoreAI API 전체 테스트 시작")
        print("=" * 50)
        
        results = {}
        
        # 기본 엔드포인트 테스트
        results["health"] = self.test_health()
        time.sleep(1)
        
        results["root"] = self.test_root()
        time.sleep(1)
        
        results["categories"] = self.test_categories()
        time.sleep(1)
        
        results["season"] = self.test_season()
        time.sleep(1)
        
        # 품종별 추천 테스트
        results["breed_recommendations"] = self.test_breed_recommendations()
        time.sleep(1)
        
        # 상품 추천 테스트
        results["recommendation"] = self.test_recommendation()
        time.sleep(1)
        
        # 다양한 추천 타입 테스트
        recommendation_types = ["SIMILAR", "COMPLEMENTARY", "SEASONAL", "BREED_SPECIFIC", "AGE_SPECIFIC"]
        for rec_type in recommendation_types:
            results[f"recommendation_{rec_type.lower()}"] = self.test_recommendation(
                recommendation_type=rec_type
            )
            time.sleep(1)
        
        # 결과 요약
        print("\n" + "=" * 50)
        print("📊 테스트 결과 요약")
        print("=" * 50)
        
        success_count = 0
        total_count = len(results)
        
        for test_name, result in results.items():
            status = "✅ 성공" if result.get("success", False) else "❌ 실패"
            print(f"{test_name:30} {status}")
            if result.get("success", False):
                success_count += 1
        
        print(f"\n총 {total_count}개 테스트 중 {success_count}개 성공 ({success_count/total_count*100:.1f}%)")
        
        return results

def main():
    """메인 실행 함수"""
    print("🚀 StoreAI API 테스트 클라이언트")
    print("=" * 50)
    
    # 서버 URL 설정
    base_url = input("서버 URL을 입력하세요 (기본값: http://localhost:9000): ").strip()
    if not base_url:
        base_url = "http://localhost:9000"
    
    # 테스트 클라이언트 생성
    client = StoreAITestClient(base_url)
    
    # 테스트 실행
    results = client.run_all_tests()
    
    # 결과 저장
    with open("storeai_test_results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n📄 테스트 결과가 'storeai_test_results.json' 파일에 저장되었습니다.")

if __name__ == "__main__":
    main()

# 네이버 쇼핑 API 테스트 체크리스트

## ✅ 사전 준비
- [ ] Java 17 이상 설치
- [ ] 네이버 개발자 센터에서 API 키 발급
- [ ] 환경 변수 설정 (NAVER_API_CLIENT_ID, NAVER_API_CLIENT_SECRET)
- [ ] 데이터베이스 연결 확인

## ✅ 빌드 테스트
- [ ] `./gradlew compileJava` 성공
- [ ] `./gradlew build -x test` 성공
- [ ] 애플리케이션 시작 성공

## ✅ API 기능 테스트

### 1. 네이버 쇼핑 실시간 검색
- [ ] POST `/api/naver-shopping/search` 성공
- [ ] 검색 결과 정상 반환
- [ ] 에러 처리 확인 (잘못된 API 키)

### 2. 저장된 상품 검색
- [ ] GET `/api/naver-shopping/products/search` 성공
- [ ] 키워드 검색 정상 작동
- [ ] 페이징 정상 작동

### 3. 카테고리별 검색
- [ ] GET `/api/naver-shopping/products/category/{category}` 성공
- [ ] 카테고리 필터링 정상 작동

### 4. 가격 범위별 검색
- [ ] GET `/api/naver-shopping/products/price-range` 성공
- [ ] 가격 필터링 정상 작동

### 5. 인기 상품 조회
- [ ] GET `/api/naver-shopping/products/popular` 성공
- [ ] searchCount 기준 정렬 확인

### 6. 높은 평점 상품 조회
- [ ] GET `/api/naver-shopping/products/top-rated` 성공
- [ ] rating 기준 정렬 확인

### 7. 카트 기능
- [ ] POST `/api/naver-shopping/cart/{naverProductId}` 성공
- [ ] 네이버 상품이 카트에 정상 추가
- [ ] 수량 증가 로직 확인
- [ ] 기존 카트 조회에서 네이버 상품 포함 확인

### 8. 상품 연결
- [ ] POST `/api/naver-shopping/link/{naverProductId}/product/{productId}` 성공
- [ ] 네이버 상품과 기존 상품 연결 확인

## ✅ 데이터베이스 테스트
- [ ] NaverProduct 테이블 생성 확인
- [ ] Cart 테이블에 naver_product_id 컬럼 추가 확인
- [ ] 데이터 저장/조회 정상 작동

## ✅ 에러 처리 테스트
- [ ] 잘못된 API 키로 요청 시 401 에러
- [ ] 존재하지 않는 상품 ID로 요청 시 적절한 에러 메시지
- [ ] 잘못된 파라미터로 요청 시 400 에러

## ✅ 성능 테스트
- [ ] 대량 데이터 검색 시 응답 시간 확인
- [ ] 페이징 성능 확인
- [ ] 동시 요청 처리 확인

## ✅ 통합 테스트
- [ ] 기존 Product와 NaverProduct 동시 카트 관리
- [ ] 주문 프로세스에서 네이버 상품 처리
- [ ] 프론트엔드 연동 테스트

## 🐛 발견된 문제점
- [ ] 문제 1: 
- [ ] 문제 2: 
- [ ] 문제 3: 

## 📝 개선 사항
- [ ] 개선 1: 
- [ ] 개선 2: 
- [ ] 개선 3: 


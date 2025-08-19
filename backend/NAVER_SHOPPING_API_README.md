# 네이버 쇼핑 API 연동 기능

## 개요
이 프로젝트는 네이버 쇼핑 API를 활용하여 반려동물 관련 상품을 검색하고 관리하는 기능을 제공합니다.

## 주요 기능

### 1. 네이버 쇼핑 API 연동
- 실시간 네이버 쇼핑 검색
- 검색 결과를 DB에 저장하여 빠른 조회
- 상품 정보 업데이트

### 2. 상품 검색 및 필터링
- 키워드 검색
- 카테고리별 검색
- 가격 범위별 검색
- 인기 상품 조회
- 높은 평점 상품 조회

### 3. 카트 기능
- 네이버 상품을 카트에 추가
- 기존 카트 시스템과 통합

### 4. 기존 상품과의 연관관계
- 네이버 상품을 기존 Product와 연결
- 관련 상품 추천

## 설정 방법

### 1. 환경 변수 설정
`.env` 파일에 다음 환경 변수를 추가하세요:

```env
# 네이버 API 설정
NAVER_API_CLIENT_ID=your_naver_api_client_id
NAVER_API_CLIENT_SECRET=your_naver_api_client_secret
```

### 2. 네이버 개발자 센터 설정
1. [네이버 개발자 센터](https://developers.naver.com/)에 접속
2. 애플리케이션 등록
3. "검색" API 사용 신청
4. Client ID와 Client Secret 발급

## API 엔드포인트

### 네이버 쇼핑 검색
```
POST /api/naver-shopping/search
```
실시간으로 네이버 쇼핑 API를 호출하여 검색 결과를 반환합니다.

**요청 예시:**
```json
{
  "query": "강아지 사료",
  "display": 20,
  "start": 1,
  "sort": "sim"
}
```

### 저장된 네이버 상품 검색
```
GET /api/naver-shopping/products/search?keyword=강아지사료&page=0&size=20
```
DB에 저장된 네이버 상품을 키워드로 검색합니다.

### 카테고리별 검색
```
GET /api/naver-shopping/products/category/반려동물용품?page=0&size=20
```

### 가격 범위별 검색
```
GET /api/naver-shopping/products/price-range?minPrice=10000&maxPrice=50000&page=0&size=20
```

### 인기 상품 조회
```
GET /api/naver-shopping/products/popular?page=0&size=20
```

### 높은 평점 상품 조회
```
GET /api/naver-shopping/products/top-rated?page=0&size=20
```

### 카트 기능
```
# 네이버 상품을 카트에 추가
POST /api/naver-shopping/cart/{naverProductId}?quantity=1
```

### 상품 연결
```
POST /api/naver-shopping/link/{naverProductId}/product/{productId}
```

## 데이터베이스 스키마

### NaverProduct 엔티티
- 네이버 쇼핑 API에서 제공하는 상품 정보를 저장
- 기존 Product와 ManyToOne 관계 (선택적)

### Cart 엔티티 (수정됨)
- 기존 Product와 NaverProduct 모두를 담을 수 있도록 확장
- Account와의 ManyToOne 관계 유지

## 사용 예시

### 1. 네이버 쇼핑 검색 및 저장
```java
// 검색 요청
NaverShoppingSearchRequestDto request = NaverShoppingSearchRequestDto.builder()
    .query("강아지 사료")
    .display(20)
    .start(1)
    .sort("sim")
    .build();

// API 호출
NaverShoppingResponseDto response = naverShoppingService.searchProducts(request);

// DB에 저장
naverShoppingService.saveNaverProducts(response.getItems());
```

### 2. 저장된 상품 검색
```java
// 키워드로 검색
Page<NaverProductDto> products = naverShoppingService.searchNaverProductsByKeyword(
    "강아지", 0, 20, accountId
);

// 카테고리로 검색
Page<NaverProductDto> products = naverShoppingService.searchNaverProductsByCategory(
    "반려동물용품", 0, 20, accountId
);
```

### 3. 카트 기능 사용
```java
// 네이버 상품을 카트에 추가
Cart cart = cartService.addNaverProductToCart(accountId, naverProductId, quantity);

// 카트 조회 (기존 상품과 네이버 상품 모두 포함)
List<CartDto> cartItems = cartService.getCartDtoByAccountId(accountId);
```

## 주의사항

1. **API 호출 제한**: 네이버 쇼핑 API는 일일 호출 제한이 있습니다.
2. **데이터 동기화**: 네이버 상품 정보는 주기적으로 업데이트해야 합니다.
3. **인증**: 모든 API 호출은 JWT 토큰 인증이 필요합니다.
4. **에러 처리**: API 호출 실패 시 적절한 에러 처리가 필요합니다.

## 확장 가능한 기능

1. **상품 추천 시스템**: 사용자 행동 기반 상품 추천
2. **가격 비교**: 여러 쇼핑몰의 가격 비교
3. **리뷰 통합**: 네이버 리뷰와 기존 리뷰 통합
4. **알림 기능**: 찜한 상품의 가격 변동 알림
5. **통계 대시보드**: 인기 상품, 검색 통계 등

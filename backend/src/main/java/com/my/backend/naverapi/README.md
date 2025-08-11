# 네이버 API 모듈

이 모듈은 네이버 쇼핑 API를 사용하여 상품 검색 기능을 제공합니다.

## 설정

### 환경 변수 설정

다음 환경 변수를 설정해야 합니다:

```bash
NAVER_API_CLIENT_ID=your_naver_client_id
NAVER_API_CLIENT_SECRET=your_naver_client_secret
```

### 네이버 개발자 센터에서 API 키 발급

1. [네이버 개발자 센터](https://developers.naver.com/)에 접속
2. 애플리케이션 등록
3. "검색" API 사용 신청
4. Client ID와 Client Secret 발급

## API 엔드포인트

### 상품 검색 (GET)

```
GET /api/naver/products/search
```

#### 쿼리 파라미터

- `query` (optional): 검색어 (기본값: "")
- `display` (optional): 검색 결과 개수 (기본값: 1, 최대: 100)
- `start` (optional): 검색 시작 위치 (기본값: 1, 최대: 1000)
- `sort` (optional): 정렬 방법 (기본값: "sim")
  - `sim`: 정확도순
  - `date`: 날짜순
  - `asc`: 가격오름차순
  - `dsc`: 가격내림차순

#### 예시

```bash
curl "http://localhost:8080/api/naver/products/search?query=강아지사료&display=10&sort=asc"
```

### 상품 검색 (POST)

```
POST /api/naver/products/search
```

#### 요청 본문

```json
{
  "query": "강아지사료",
  "display": 10,
  "start": 1,
  "sort": "asc"
}
```

## 응답 형식

```json
{
  "success": true,
  "data": {
    "lastBuildDate": "Mon, 29 Jul 2024 07:00:00 +0900",
    "total": 1000,
    "start": 1,
    "display": 10,
    "items": [
      {
        "title": "상품명",
        "link": "상품 링크",
        "image": "상품 이미지 URL",
        "lprice": 10000,
        "hprice": 15000,
        "mallName": "쇼핑몰명",
        "productId": "상품ID",
        "productType": "상품타입",
        "brand": "브랜드",
        "maker": "제조사",
        "category1": "카테고리1",
        "category2": "카테고리2",
        "category3": "카테고리3",
        "category4": "카테고리4"
      }
    ]
  }
}
```

## 파일 구조

```
naverapi/
├── controller/
│   └── NaverApiController.java      # API 엔드포인트
├── service/
│   └── NaverApiService.java         # 비즈니스 로직
├── dto/
│   ├── NaverProductSearchRequestDto.java   # 요청 DTO
│   └── NaverProductSearchResponseDto.java  # 응답 DTO
├── config/
│   └── NaverApiConfig.java          # 설정 클래스
├── exception/
│   └── NaverApiException.java       # 커스텀 예외
└── README.md                        # 이 파일
```

## 주의사항

- 네이버 API는 일일 호출 제한이 있습니다 (25,000회)
- 검색어는 URL 인코딩이 필요할 수 있습니다
- API 응답은 JSON 형식입니다

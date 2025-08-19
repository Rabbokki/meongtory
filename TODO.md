# 네이버 API 상품 검색 기능 구현 투두리스트

## ✅ 완료된 작업
- [x] 백엔드 네이버 API 모듈 구조 생성
- [x] Controller, Service, DTO, Config, Exception 클래스 구현
- [x] application.yml에 네이버 API 설정 추가
- [x] README 문서 작성

## 🔄 진행 중인 작업
- [ ] 네이버 개발자 센터에서 API 키 발급

## 📋 남은 작업

### 1. 네이버 API 설정 (우선순위: 높음)
- [ ] 네이버 개발자 센터(https://developers.naver.com/) 접속
- [ ] 애플리케이션 등록
- [ ] "검색" API 사용 신청
- [ ] Client ID와 Client Secret 발급
- [ ] 환경 변수 설정 (.env 파일 또는 시스템 환경변수)

### 2. 백엔드 테스트 (우선순위: 높음)
- [ ] Spring Boot 애플리케이션 실행
- [ ] API 엔드포인트 테스트
  - [ ] GET `/api/naver/products/search?query=강아지사료&display=10`
  - [ ] POST `/api/naver/products/search` (JSON 본문으로)
- [ ] 에러 처리 테스트
- [ ] 로깅 확인

### 3. 프론트엔드 구현 (우선순위: 높음)
- [ ] 네이버 API 호출 함수 생성 (`frontend/lib/api/naver.ts`)
- [ ] 상품 검색 페이지 생성
  - [ ] 검색 입력 필드
  - [ ] 검색 결과 목록 표시
  - [ ] 정렬 옵션 (가격순, 정확도순 등)
  - [ ] 페이지네이션
- [ ] 상품 카드 컴포넌트 생성
  - [ ] 상품 이미지
  - [ ] 상품명
  - [ ] 가격 정보
  - [ ] 쇼핑몰명
  - [ ] 상품 링크

### 4. UI/UX 개선 (우선순위: 중간)
- [ ] 로딩 상태 표시
- [ ] 에러 메시지 표시
- [ ] 검색 결과 없음 상태
- [ ] 반응형 디자인 적용
- [ ] 검색 히스토리 기능

### 5. 추가 기능 (우선순위: 낮음)
- [ ] 검색 결과 캐싱
- [ ] 인기 검색어 표시
- [ ] 카테고리별 필터링
- [ ] 가격 범위 필터링
- [ ] 즐겨찾기 기능

### 6. 최적화 및 보안 (우선순위: 낮음)
- [ ] API 호출 제한 설정
- [ ] 요청/응답 로깅 최적화
- [ ] 에러 처리 개선
- [ ] 보안 헤더 추가

## 🚀 다음 단계 (즉시 실행 가능)

### 1. 네이버 API 키 발급
```bash
# 1. 네이버 개발자 센터 접속
# 2. 애플리케이션 등록
# 3. 검색 API 사용 신청
# 4. Client ID, Client Secret 복사
```

### 2. 환경 변수 설정
```bash
# .env 파일 또는 시스템 환경변수에 추가
NAVER_API_CLIENT_ID=your_client_id_here
NAVER_API_CLIENT_SECRET=your_client_secret_here
```

### 3. 백엔드 실행 및 테스트
```bash
cd backend
./gradlew bootRun

# API 테스트
curl "http://localhost:8080/api/naver/products/search?query=강아지사료&display=5"
```

### 4. 프론트엔드 API 함수 생성
```typescript
// frontend/lib/api/naver.ts 파일 생성 필요
```

## 📝 참고 사항
- 네이버 API 일일 호출 제한: 25,000회
- 검색 결과 최대 100개까지 한 번에 요청 가능
- 정렬 옵션: sim(정확도순), date(날짜순), asc(가격오름차순), dsc(가격내림차순)

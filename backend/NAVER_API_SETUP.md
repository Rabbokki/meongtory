# 네이버 API 설정 가이드

## 1. 네이버 개발자 센터 설정

### 1.1 애플리케이션 등록
1. [네이버 개발자 센터](https://developers.naver.com/)에 접속
2. 로그인 후 "애플리케이션 등록" 클릭
3. 애플리케이션 정보 입력:
   - 애플리케이션 이름: `meongtory-shopping`
   - 사용 API: `검색` 선택
   - 비로그인 오픈 API 서비스 환경: `웹 서비스 URL`에 `http://localhost:8080` 입력

### 1.2 API 키 발급
- Client ID와 Client Secret을 복사해두세요

## 2. 환경 변수 설정

### 2.1 application.yml 설정
```yaml
naver:
  api:
    client-id: ${NAVER_API_CLIENT_ID}
    client-secret: ${NAVER_API_CLIENT_SECRET}
    shopping-url: https://openapi.naver.com/v1/search/shop.json
```

### 2.2 환경 변수 설정
`.env` 파일 또는 시스템 환경 변수에 다음을 추가:

```env
NAVER_API_CLIENT_ID=your_naver_client_id_here
NAVER_API_CLIENT_SECRET=your_naver_client_secret_here
```

## 3. 테스트 방법

### 3.1 애플리케이션 실행
```bash
cd backend
./gradlew bootRun
```

### 3.2 API 테스트
1. `test-naver-api.http` 파일을 사용하여 API 테스트
2. IntelliJ IDEA나 VS Code에서 HTTP 요청 실행
3. 또는 Postman, curl 등을 사용

### 3.3 테스트 순서
1. 먼저 실시간 검색 API 테스트
2. 검색 결과가 DB에 저장되는지 확인
3. 저장된 상품 검색 테스트
4. 카트 기능 테스트

## 4. 주의사항

### 4.1 API 호출 제한
- 네이버 검색 API는 일일 25,000회 호출 제한
- 초당 10회 호출 제한

### 4.2 에러 처리
- API 키가 올바르지 않으면 401 에러
- 호출 제한 초과 시 429 에러
- 잘못된 파라미터 시 400 에러

## 5. 문제 해결

### 5.1 401 에러 (Unauthorized)
- Client ID와 Client Secret 확인
- 애플리케이션 등록 상태 확인

### 5.2 429 에러 (Too Many Requests)
- API 호출 제한 확인
- 잠시 후 재시도

### 5.3 빌드 오류
- Java 17 이상 필요
- `java -version`으로 버전 확인


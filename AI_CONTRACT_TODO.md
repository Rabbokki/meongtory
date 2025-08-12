# AI 계약서 생성 기능 TODO List

## ✅ 완료된 기능

### 1. 프론트엔드
- [x] 계약서 템플릿 관리 페이지 (`contract-template-page.tsx`)
- [x] 계약서 생성 페이지 (`contract-generation-page.tsx`)
- [x] 메인 웹사이트에 계약서 기능 통합
- [x] 네비게이션에 "AI 계약서" 메뉴 추가
- [x] 계약서 관련 타입 정의

### 2. 백엔드
- [x] 계약서 템플릿 엔티티 (`ContractTemplate.java`)
- [x] 계약서 섹션 엔티티 (`ContractSection.java`)
- [x] 생성된 계약서 엔티티 (`GeneratedContract.java`)
- [x] AI 추천 엔티티 (`AISuggestion.java`)
- [x] 계약서 관련 DTO들
- [x] Repository 클래스들
- [x] Service 클래스들
- [x] Controller 클래스들
- [x] OpenAI API 연동 설정
- [x] RestTemplate 설정

## 🔄 진행 중인 기능

### 1. AI 추천 시스템
- [x] ChatGPT OpenAI-4.1 연동
- [x] AI 추천 말풍선 UI
- [x] 추천 내용 적용 기능
- [ ] 더 정교한 프롬프트 엔지니어링
- [ ] 추천 히스토리 관리

### 2. 계약서 생성 시스템
- [x] 템플릿 선택 기능
- [x] 섹션 커스터마이징
- [x] 기본 정보 입력
- [ ] PDF/Word 파일 생성
- [ ] 파일 다운로드 기능

## 📋 남은 작업

### 1. 템플릿 관리 기능
- [ ] 기본 템플릿 데이터 생성
- [ ] 템플릿 카테고리별 분류
- [ ] 템플릿 검색 및 필터링 개선
- [ ] 템플릿 버전 관리

### 2. AI 추천 기능 개선
- [ ] 반려동물 특성별 맞춤 추천
- [ ] 기존 계약서 패턴 학습
- [ ] 추천 신뢰도 점수 시스템
- [ ] 사용자 피드백 시스템

### 3. 계약서 생성 기능 완성
- [ ] PDF 생성 라이브러리 연동 (iText, Apache PDFBox)
- [ ] Word 문서 생성 (Apache POI)
- [ ] 계약서 서명 기능
- [ ] 계약서 템플릿 미리보기

### 4. 사용자 경험 개선
- [ ] 드래그 앤 드롭으로 섹션 순서 변경
- [ ] 실시간 계약서 미리보기
- [ ] 계약서 저장 및 불러오기
- [ ] 계약서 공유 기능

### 5. 보안 및 검증
- [ ] 계약서 내용 검증
- [ ] 사용자 권한 관리
- [ ] 계약서 무결성 검증
- [ ] 감사 로그 시스템

### 6. 데이터베이스 마이그레이션
- [ ] 계약서 관련 테이블 생성 스크립트
- [ ] 기본 템플릿 데이터 삽입
- [ ] 인덱스 최적화

### 7. 테스트
- [ ] 단위 테스트 작성
- [ ] 통합 테스트 작성
- [ ] E2E 테스트 작성
- [ ] 성능 테스트

### 8. 배포 및 운영
- [ ] 환경별 설정 분리
- [ ] 로깅 시스템 구축
- [ ] 모니터링 시스템 구축
- [ ] 백업 및 복구 전략

## 🎯 우선순위

### 높음 (1-2주)
1. PDF/Word 파일 생성 기능
2. 기본 템플릿 데이터 생성
3. 파일 다운로드 기능

### 중간 (3-4주)
1. AI 추천 시스템 개선
2. 사용자 경험 개선
3. 보안 및 검증 기능

### 낮음 (1-2개월)
1. 고급 기능 (서명, 공유 등)
2. 성능 최적화
3. 모니터링 시스템

## 📝 기술 스택

### 프론트엔드
- React + TypeScript
- Tailwind CSS
- Shadcn/ui 컴포넌트
- Axios (API 통신)

### 백엔드
- Spring Boot
- Spring Data JPA
- Spring Security
- OpenAI API (ChatGPT)
- Apache PDFBox (PDF 생성)
- Apache POI (Word 생성)

### 데이터베이스
- PostgreSQL
- JPA/Hibernate

## 🔧 환경 설정

### 필요한 환경 변수
```bash
# OpenAI API
OPENAI_API_KEY=your-openai-api-key

# Database
DB_URL=jdbc:postgresql://localhost:5432/meongtory
DB_USERNAME=postgres
DB_PASSWORD=password

# Server
SERVER_PORT=8080
```

### 필요한 의존성
```xml
<!-- PDF 생성 -->
<dependency>
    <groupId>org.apache.pdfbox</groupId>
    <artifactId>pdfbox</artifactId>
    <version>2.0.29</version>
</dependency>

<!-- Word 생성 -->
<dependency>
    <groupId>org.apache.poi</groupId>
    <artifactId>poi-ooxml</artifactId>
    <version>5.2.3</version>
</dependency>
``` 
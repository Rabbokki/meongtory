# AI Auto Comment & Enhanced Profanity Filter

## 개요
이 프로젝트는 커뮤니티 게시글에 자동으로 댓글을 생성하는 AI 기능과 강화된 비속어 필터링 시스템을 포함합니다.

## 주요 기능

### 1. AI 자동 댓글 생성
- 게시글이 작성되면 자동으로 관련성 높은 댓글을 생성
- 비동기 처리로 게시글 작성 속도에 영향 없음
- 실패 시에도 게시글 작성은 정상 진행

### 2. 강화된 비속어 필터링 시스템

#### 2단계 필터링 구조
1. **1차 필터: 정규식 기반 보조 검사**
   - 빠르고 비용 없는 검사
   - 기본적인 비속어 패턴 감지
   - 특수문자나 숫자로 변형된 비속어도 감지

2. **2차 필터: OpenAI Moderation API (필수 호출)**
   - 정규식에서 안 걸리더라도 항상 호출
   - AI 기반 정교한 부적절한 내용 감지
   - Moderation API 응답(flagged, categories, category_scores)을 서버 로그에 출력
   - harassment/hate score > 0.3 시 부적절로 판단
   - API 키가 없거나 실패 시 정규식 필터만 사용

#### 지원하는 비속어 패턴 (보조 필터) - 한국 욕 + 변형
```java
private static final String[] BAD_WORD_PATTERNS = {
    "개[\\W_0-9]*새[\\W_0-9]*끼",
    "개[\\W_0-9]*같",   // 개같다, 개같은
    "ㅅ[\\W_0-9]*ㅂ",
    "씨[\\W_0-9]*발",
    "병[\\W_0-9]*신",
    "미친",
    "좆",
    "fuck",
    "shit"
};
```

#### 적용 범위
- **게시글 작성/수정**: title + content 검사
- **댓글 작성/수정**: content 검사

#### 에러 처리
- 비속어 감지 시 400 Bad Request + JSON 응답
- GlobalExceptionHandler를 통한 일관된 에러 처리
- 프론트엔드에서 토스트 메시지로 사용자에게 알림
- DB 저장 차단
- 500 에러 방지

## 설정

### OpenAI API 키 설정
```yaml
# application.yml
openai:
  api:
    key: ${OPENAI_API_KEY}
```

### 환경 변수
```bash
OPENAI_API_KEY=your-openai-api-key-here
```

## 사용법

### 백엔드
비속어 필터링은 자동으로 적용되며, 별도 설정이 필요하지 않습니다.

### 프론트엔드
에러 처리는 이미 구현되어 있으며, 400 상태 코드 시 자동으로 토스트 메시지가 표시됩니다.

#### 에러 처리 패턴
```javascript
try {
  await axios.post('/api/community/posts/create', data);
  toast.success("게시글이 등록되었습니다 ✅");
} catch (error) {
  if (error.response && error.response.status === 400) {
    const msg = error.response.data?.message || "🚫 비속어를 사용하지 말아주세요.";
    toast.error(msg);
  } else {
    toast.error("게시글 작성 중 오류가 발생했습니다 ❌");
  }
}
```

## 테스트
```bash
# 비속어 필터링 테스트 실행
./gradlew test --tests EnhancedProfanityFilterTest
```

## 기술 스택
- **백엔드**: Spring Boot 3.3.2, Java 17
- **프론트엔드**: Next.js, TypeScript
- **AI**: OpenAI Moderation API
- **데이터베이스**: PostgreSQL

## 주의사항
1. OpenAI API 키가 설정되지 않은 경우 정규식 필터만 동작합니다.
2. API 호출 실패 시에도 정규식 필터는 정상 동작합니다.
3. 정규식에서 걸리더라도 OpenAI Moderation API는 항상 호출됩니다.
4. Moderation API 응답은 서버 로그에 상세히 기록됩니다.
5. 비속어 감지 시 항상 400 Bad Request 응답을 반환합니다.
6. 500 에러는 발생하지 않으며, 일관된 에러 처리가 보장됩니다.

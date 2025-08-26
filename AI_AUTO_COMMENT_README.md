# AI 기반 자동댓글 기능 구현

## 개요

기존의 고정된 랜덤 댓글 시스템을 OpenAI API를 활용한 AI 기반 자동댓글 생성 시스템으로 개선했습니다.

## 주요 변경사항

### 1. 새로운 서비스 추가

#### OpenAiService (`backend/src/main/java/com/my/backend/community/service/OpenAiService.java`)
- OpenAI API를 직접 호출하여 게시글 내용에 맞는 댓글 생성
- 카테고리별 맞춤형 프롬프트 구성
- 실패 시 폴백 댓글 제공

#### 주요 기능:
- `generateComment(String postContent, String category)`: 게시글 내용과 카테고리를 기반으로 AI 댓글 생성
- `buildPrompt(String postContent, String category)`: 카테고리별 프롬프트 구성
- `getFallbackComment(String category)`: AI 실패 시 기본 댓글 제공

### 2. AutoCommentService 개선

#### 기존 기능 유지:
- 게시글 작성 시 자동 댓글 생성
- 작성자: "Meongtory"
- 이메일: "meongtory@meongtory.com"
- 실패 시 게시글 작성에 영향 없음

#### 개선된 기능:
- AI 기반 댓글 생성으로 변경
- 게시글 내용 분석을 통한 맥락에 맞는 댓글
- 카테고리별 맞춤형 반응

### 3. 카테고리별 댓글 톤

| 카테고리 | 댓글 톤 | 예시 |
|---------|---------|------|
| 자유게시판/멍스타그램 | 공감/축하/친근한 멘트 | "좋은 산책이었네요! 🐾" |
| 꿀팁게시판 | 감사/추가 아이디어 제안 | "유익한 정보네요! 👍" |
| Q&A | 간단한 조언/해결책 제안 | "도움이 되는 답변이었어요! 💡" |

## 설정

### 1. 환경변수 설정

`application.yml`에 OpenAI API 설정 추가:
```yaml
openai:
  api:
    key: ${OPENAI_API_KEY}
    url: https://api.openai.com/v1/chat/completions
  model: ${OPENAI_MODEL:gpt-4o-mini}
```

### 2. 필요한 환경변수
- `OPENAI_API_KEY`: OpenAI API 키
- `OPENAI_MODEL`: 사용할 모델 (기본값: gpt-4o-mini)

## 프롬프트 구성

### 시스템 프롬프트
```
당신은 반려견 커뮤니티에서 따뜻하고 공감하는 댓글을 작성하는 AI입니다. 
자연스럽고 친근한 톤으로 1-2문장의 짧은 댓글을 작성해주세요.
```

### 사용자 프롬프트 예시
```
게시글 내용: 오늘 강아지와 산책을 했어요. 정말 즐거웠습니다!

위 게시글에 어울리는 댓글을 작성해주세요.
조건:
- 자연스러운 한국어
- 1~2문장
- 공감하고 축하하는 친근한 멘트
- 따뜻하고 긍정적인 톤
- 이모지 사용 가능
```

## 폴백 시스템

AI 서비스 실패 시 카테고리별 기본 댓글로 대체:

| 카테고리 | 폴백 댓글 |
|---------|-----------|
| 자유게시판/멍스타그램 | "좋은 글 감사합니다! 🐾" |
| 꿀팁게시판 | "유익한 정보네요! 👍" |
| Q&A | "도움이 되는 답변이었어요! 💡" |
| 기타 | "좋은 글 감사합니다 🙌" |

## 테스트

### 단위 테스트 추가
- `AutoCommentServiceTest`: 자동댓글 생성 로직 테스트
- `OpenAiServiceTest`: AI 댓글 생성 및 폴백 로직 테스트

### 테스트 실행
```bash
cd backend
./gradlew test --tests "*AutoCommentServiceTest*"
./gradlew test --tests "*OpenAiServiceTest*"
```

## 프론트엔드 연동

기존 프론트엔드 코드는 수정 없이 동작:
- "🐾 Meongtory" 배지 자동 표시
- 댓글 목록에 AI 생성 댓글 포함
- 수정/삭제 권한 제한 (Meongtory 댓글은 수정 불가)

## 제한사항 및 주의사항

1. **API 키 보안**: OpenAI API 키는 환경변수로 관리
2. **비용 관리**: OpenAI API 사용량에 따른 비용 발생 가능
3. **응답 시간**: AI API 호출로 인한 약간의 지연 발생
4. **실패 처리**: AI 실패 시 폴백 댓글로 대체하여 서비스 중단 방지

## 로깅

AI 댓글 생성 과정의 상세 로그 제공:
- 게시글 내용 및 카테고리 로깅
- AI API 요청/응답 로깅
- 생성된 댓글 내용 로깅
- 오류 발생 시 상세 로그

## 향후 개선 방향

1. **캐싱 시스템**: 유사한 게시글에 대한 댓글 캐싱
2. **성능 최적화**: 비동기 처리로 응답 시간 개선
3. **다양성 증가**: 더 다양한 댓글 패턴 생성
4. **사용자 피드백**: AI 댓글에 대한 사용자 평가 시스템

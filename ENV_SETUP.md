# 환경 변수 설정 가이드

## 🔍 현재 상황
프로젝트에 여러 개의 `.env` 파일이 있어서 환경 변수가 제대로 로드되지 않을 수 있습니다.

### 현재 존재하는 .env 파일들:
- `.env` (루트)
- `.env.backup` (루트)
- `backend/.env`
- `frontend/.env.local`

## 🛠️ 해결 방법

### 1. 환경 변수 파일 정리

#### 권장 방법: 단일 .env 파일 사용
```bash
# 1. 기존 .env 파일들 백업
mv .env .env.root.backup
mv backend/.env backend/.env.backup
mv frontend/.env.local frontend/.env.local.backup

# 2. 루트에 단일 .env 파일 생성
cp env.example .env

# 3. .env 파일 편집하여 실제 값 설정
# 특히 OPENAI_API_KEY 설정 필수
```

#### 또는 각 서비스별 .env 파일 유지
```bash
# 각 서비스별로 필요한 환경 변수만 설정
# backend/.env - 백엔드 관련 설정
# frontend/.env.local - 프론트엔드 관련 설정
# ai/.env - AI 서비스 관련 설정 (선택사항)
```

### 2. 환경 변수 우선순위

Python의 `python-dotenv`는 다음 순서로 .env 파일을 찾습니다:
1. 현재 작업 디렉토리
2. 상위 디렉토리들
3. 시스템 환경 변수

### 3. Docker 환경에서 환경 변수 전달

`docker-compose.yml`에서 환경 변수가 제대로 전달되는지 확인:

```yaml
services:
  backend:
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
  
  ai:
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
```

### 4. 환경 변수 확인 방법

#### Python에서 확인:
```python
import os
print("OPENAI_API_KEY:", os.getenv("OPENAI_API_KEY"))
```

#### Java에서 확인:
```java
String apiKey = System.getenv("OPENAI_API_KEY");
System.out.println("OPENAI_API_KEY: " + apiKey);
```

#### Docker 컨테이너에서 확인:
```bash
# 백엔드 컨테이너에서 확인
docker-compose exec backend env | grep OPENAI

# AI 컨테이너에서 확인
docker-compose exec ai env | grep OPENAI
```

## 🚨 주의사항

1. **API 키 보안**: `.env` 파일은 절대 Git에 커밋하지 마세요
2. **백업**: 기존 .env 파일들을 백업해두세요
3. **테스트**: 환경 변수 변경 후 반드시 테스트하세요

## 📝 체크리스트

- [ ] 기존 .env 파일들 백업
- [ ] 단일 .env 파일 또는 서비스별 .env 파일 설정
- [ ] OPENAI_API_KEY 설정
- [ ] Docker 환경에서 환경 변수 전달 확인
- [ ] Python 스크립트에서 환경 변수 로드 확인
- [ ] 음성 변환 기능 테스트


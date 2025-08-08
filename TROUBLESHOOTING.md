# 음성 변환 문제 해결 가이드

## 🔍 문제 진단

### 1. 환경 변수 확인
```bash
# .env 파일이 존재하는지 확인
ls -la .env

# 환경 변수가 제대로 설정되었는지 확인
echo $OPENAI_API_KEY
```

### 2. Docker 컨테이너 로그 확인
```bash
# 백엔드 컨테이너 로그 확인
docker-compose logs backend

# AI 서비스 컨테이너 로그 확인
docker-compose logs ai
```

### 3. Python 스크립트 직접 테스트
```bash
# AI 컨테이너에 접속
docker-compose exec ai bash

# Python 스크립트 직접 실행
python3 diary/transcribe.py /path/to/test/audio.webm
```

## 🛠️ 해결 방법

### 1. 환경 변수 설정
1. 프로젝트 루트에 `.env` 파일 생성
2. `env.example` 파일을 참고하여 필요한 환경 변수 설정
3. 특히 `OPENAI_API_KEY`가 올바르게 설정되었는지 확인

### 2. Docker 재빌드
```bash
# 컨테이너 중지
docker-compose down

# 이미지 재빌드
docker-compose build --no-cache

# 컨테이너 재시작
docker-compose up -d
```

### 3. Python 경로 문제 해결
- 백엔드에서 Python 스크립트를 실행할 때 절대 경로 사용
- Docker 볼륨 마운트 확인

### 4. API 키 유효성 확인
- OpenAI API 키가 유효한지 확인
- API 사용량 한도 확인
- 네트워크 연결 상태 확인

## 📝 디버깅 로그

### 백엔드 로그에서 확인할 점:
- `🔍 음성 변환 시작` 메시지
- `🔍 Python 스크립트 호출 시작` 메시지
- `🔍 Python 스크립트 실행 완료` 메시지
- Exit Code가 0인지 확인

### Python 스크립트 로그에서 확인할 점:
- `🔍 OpenAI API 키 확인` 메시지
- `🔍 처리할 파일` 메시지
- `🔍 OpenAI API 호출 시작` 메시지
- API 응답 상태 코드

## 🚨 일반적인 오류

### 1. "OPENAI_API_KEY가 환경변수에 설정되지 않았습니다"
- `.env` 파일이 존재하는지 확인
- Docker 환경에서 환경 변수가 전달되는지 확인

### 2. "Python 스크립트 파일을 찾을 수 없습니다"
- 파일 경로가 올바른지 확인
- Docker 볼륨 마운트 확인

### 3. "API 호출 실패 (상태 코드: 401)"
- OpenAI API 키가 유효한지 확인
- API 키에 충분한 크레딧이 있는지 확인

### 4. "HTML 응답(인증/키 문제 가능성)"
- API 키가 올바르게 설정되었는지 확인
- 네트워크 연결 상태 확인

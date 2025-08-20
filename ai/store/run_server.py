#!/usr/bin/env python3
"""
StoreAI 서버 실행 스크립트
"""

import os
import sys
import uvicorn
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

def check_environment():
    """환경 변수 체크"""
    required_vars = []
    optional_vars = ["OPENAI_API_KEY", "DEBUG", "LOG_LEVEL"]
    
    # 필수 환경 변수 체크
    for var in required_vars:
        if not os.getenv(var):
            print(f"⚠️  경고: {var} 환경 변수가 설정되지 않았습니다.")
    
    # 선택적 환경 변수 체크
    for var in optional_vars:
        if not os.getenv(var):
            print(f"ℹ️  정보: {var} 환경 변수가 설정되지 않았습니다. (기본값 사용)")
    
    # OpenAI API 키 체크
    if not os.getenv("OPENAI_API_KEY"):
        print("⚠️  경고: OPENAI_API_KEY가 설정되지 않았습니다. GPT 기능이 제한됩니다.")

def main():
    """메인 실행 함수"""
    print("🚀 StoreAI 서버를 시작합니다...")
    
    # 환경 변수 체크
    check_environment()
    
    # 서버 설정
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "9000"))
    reload = os.getenv("DEBUG", "True").lower() == "true"
    
    print(f"📍 서버 주소: http://{host}:{port}")
    print(f"🔄 자동 재시작: {reload}")
    print(f"📚 API 문서: http://{host}:{port}/docs")
    print(f"🔍 헬스 체크: http://{host}:{port}/storeai/health")
    
    try:
        # 서버 시작
        uvicorn.run(
            "store.api:app",
            host=host,
            port=port,
            reload=reload,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n🛑 서버가 중지되었습니다.")
    except Exception as e:
        print(f"❌ 서버 시작 실패: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

import os
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

# OpenAI API 키 설정 (환경변수에서 가져오기)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# 기타 설정
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", "9000"))

# 상품 추천 관련 설정
MAX_RECOMMENDATIONS = 5
DEFAULT_TEMPERATURE = 0.7
MAX_TOKENS = 500

# 로깅 설정
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
LOG_FILE = "store_ai.log"

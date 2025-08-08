import os
import requests
from dotenv import load_dotenv
from typing import Optional

# .env 파일에서 환경변수 로드 (여러 위치 확인)
load_dotenv()  # 현재 디렉토리
load_dotenv("../.env")  # 상위 디렉토리
load_dotenv("../../.env")  # 루트 디렉토리

def transcribe_audio(file_path: str, language: str = "ko") -> str:
    """
    OpenAI Whisper API를 사용하여 음성 파일을 텍스트로 변환합니다.
    
    Args:
        file_path (str): 로컬에 저장된 오디오 파일 경로
        language (str): 음성 언어 (기본값: "ko" - 한국어)
    
    Returns:
        str: Whisper가 인식한 텍스트
    
    Raises:
        Exception: API 호출 실패 시 예외 발생
    """
    # OpenAI API 키 확인
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise Exception("OPENAI_API_KEY가 환경변수에 설정되지 않았습니다.")
    
    # 파일 존재 여부 확인
    if not os.path.exists(file_path):
        raise Exception(f"파일을 찾을 수 없습니다: {file_path}")
    
    # OpenAI Whisper API 엔드포인트
    url = "https://api.openai.com/v1/audio/transcriptions"
    
    # 헤더 설정
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    # 파일과 파라미터 설정
    files = {
        "file": open(file_path, "rb")
    }
    
    data = {
        "model": "whisper-1",
        "language": language
    }
    
    try:
        # API 요청 전송
        response = requests.post(url, headers=headers, files=files, data=data)
        
        # 응답 확인
        if response.status_code == 200:
            result = response.json()
            transcribed_text = result.get("text", "")
            return transcribed_text
        else:
            # HTML 응답인지 확인 (content-type 또는 응답 내용으로)
            content_type = response.headers.get('content-type', '').lower()
            response_text = response.text.strip()
            
            if content_type.startswith('text/html') or response_text.startswith('<!DOCTYPE html') or response_text.startswith('<html'):
                raise Exception("HTML 응답(인증/키 문제 가능성)")
            else:
                # 그 외 실패 - status_code와 앞 200자 포함
                error_preview = response.text[:200] if response.text else "빈 응답"
                raise Exception(f"API 호출 실패 (상태 코드: {response.status_code}): {error_preview}")
            
    except requests.exceptions.RequestException as e:
        raise Exception(f"네트워크 오류: {str(e)}")
    except Exception as e:
        raise Exception(f"음성 변환 중 오류 발생: {str(e)}")
    finally:
        # 파일 핸들러 닫기
        if 'files' in locals() and 'file' in files:
            files['file'].close()

# 사용 예시
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) != 2:
        print("사용법: python transcribe.py <audio_file_path>")
        sys.exit(1)
    
    try:
        file_path = sys.argv[1]
        text = transcribe_audio(file_path)
        print(text)  # 텍스트만 출력 (Java에서 파싱하기 위해)
    except Exception as e:
        print(f"오류: {e}")
        sys.exit(1)

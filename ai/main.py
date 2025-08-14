from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import openai
import io
import tempfile
import sys
import os

# AI 서비스 모듈들 import
from contract.service import ContractAIService
from contract.models import ContractSuggestionRequest, ClauseSuggestionRequest, ContractGenerationRequest
from story.service import StoryAIService
from story.models import BackgroundStoryRequest
from breeding.breeding import predict_breeding
from breed.breed_api import router as breed_router
from emotion.emotion_api import router as emotion_router

# transcribe.py 모듈을 import하기 위해 경로 추가
sys.path.append(os.path.join(os.path.dirname(__file__), 'diary'))
from transcribe import transcribe_audio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://43.201.106.146:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(breed_router)
app.include_router(emotion_router)

# OpenAI 설정
openai.api_key = os.getenv("OPENAI_API_KEY", "")
if not openai.api_key:
    print("Warning: OPENAI_API_KEY not set")

# 서비스 인스턴스 생성
story_service = StoryAIService()
contract_service = ContractAIService()

# 배경스토리 요청 모델
class BackgroundStoryRequest(BaseModel):
    petName: str
    breed: str
    age: str
    gender: str
    personality: str = ""
    userPrompt: str = ""

@app.post("/generate-story")
async def generate_background_story(request: BackgroundStoryRequest):
    """배경 스토리 생성"""
    try:
        result = await story_service.generate_background_story(request)
        return result
    except Exception as e:
        print(f"배경 스토리 생성 오류: {str(e)}")
        raise HTTPException(status_code=500, detail=f"배경 스토리 생성 중 오류 발생: {str(e)}")

@app.post("/contract-suggestions")
async def get_contract_suggestions(request: ContractSuggestionRequest):
    """계약서 조항 추천"""
    return await contract_service.get_contract_suggestions(request)

@app.post("/clause-suggestions")
async def get_clause_suggestions(request: ClauseSuggestionRequest):
    """조항 추천"""
    return await contract_service.get_clause_suggestions(request)

@app.post("/generate-contract")
async def generate_contract(request: ContractGenerationRequest):
    """계약서 생성"""
    return await contract_service.generate_contract(request)

@app.post("/predict-breeding")
async def predict_breeding_endpoint(parent1: UploadFile = File(...), parent2: UploadFile = File(...)):
    """교배 예측"""
    try:
        print(f"교배 예측 시작 - parent1: {parent1.filename}, parent2: {parent2.filename}")
        
        # 두 개의 이미지 파일 읽기
        image1_bytes = await parent1.read()
        image2_bytes = await parent2.read()
        
        print(f"이미지 읽기 완료 - parent1: {len(image1_bytes)} bytes, parent2: {len(image2_bytes)} bytes")
        
        # 교배 예측 실행
        result = predict_breeding(image1_bytes, image2_bytes)
        print(f"교배 예측 완료: {result}")
        return result
        
    except Exception as e:
        import traceback
        print(f"교배 예측 에러: {str(e)}")
        print(f"에러 상세: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"교배 예측 중 오류 발생: {str(e)}")

@app.post("/transcribe")
async def transcribe_audio_endpoint(file: UploadFile = File(...)):
    """
    기존 transcribe.py의 함수를 사용하여 음성 파일을 텍스트로 변환합니다.
    """
    try:
        # 임시 파일로 저장
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # 기존 transcribe.py의 함수 사용
            transcribed_text = transcribe_audio(temp_file_path)
            
            # 임시 파일 삭제
            os.unlink(temp_file_path)
            
            return {"transcript": transcribed_text}
            
        except Exception as e:
            # 임시 파일 정리
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
            raise e
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"음성 변환 중 오류 발생: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Dog Breed Classifier API"}

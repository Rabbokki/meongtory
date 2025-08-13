from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from model import DogBreedClassifier
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

# transcribe.py 모듈을 import하기 위해 경로 추가
sys.path.append(os.path.join(os.path.dirname(__file__), 'diary'))
from transcribe import transcribe_audio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 서비스 인스턴스 생성
classifier = DogBreedClassifier()
contract_service = ContractAIService()
story_service = StoryAIService()

@app.post("/predict")
async def predict_dog_breed(file: UploadFile = File(...)):
    """강아지 품종 예측"""
    image_bytes = io.BytesIO(await file.read())
    result = classifier.predict(image_bytes)
    return result

@app.post("/generate-story")
async def generate_background_story(request: BackgroundStoryRequest):
    """배경 스토리 생성"""
    return await story_service.generate_background_story(request)

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

@app.post("/breeding-predict")
async def predict_breeding_endpoint(file1: UploadFile = File(...), file2: UploadFile = File(...)):
    """교배 예측"""
    try:
        # 두 개의 이미지 파일 읽기
        image1_bytes = await file1.read()
        image2_bytes = await file2.read()
        
        # 교배 예측 실행
        result = predict_breeding(image1_bytes, image2_bytes)
        return result
        
    except Exception as e:
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)
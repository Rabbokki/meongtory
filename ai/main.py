from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from model import DogBreedClassifier
import io

# AI 서비스 모듈들 import
from contract.service import ContractAIService
from contract.models import ContractSuggestionRequest, ClauseSuggestionRequest, ContractGenerationRequest
from story.service import StoryAIService
from story.models import BackgroundStoryRequest

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

@app.get("/")
async def root():
    return {"message": "Dog Breed Classifier API"}
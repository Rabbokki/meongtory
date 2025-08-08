from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import openai
from breed.breed_api import router as breed_router
from emotion.emotion_api import router as emotion_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    try:
        # 프롬프트 구성
        prompt = build_story_prompt(request)
        
        # OpenAI API 호출
        model_name = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
        response = openai.ChatCompletion.create(
            model=model_name,
            messages=[
                {"role": "system", "content": "당신은 따뜻하고 감동적인 입양 동물의 배경 스토리를 작성하는 전문가입니다."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        
        story = response.choices[0].message.content.strip()
        
        return {
            "story": story,
            "status": "success",
            "message": "배경 스토리가 성공적으로 생성되었습니다."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"스토리 생성 실패: {str(e)}")

def build_story_prompt(request: BackgroundStoryRequest) -> str:
    prompt = f"""다음 정보를 바탕으로 입양 동물의 감동적인 배경 스토리를 작성해주세요:

동물 이름: {request.petName}
품종: {request.breed}
나이: {request.age}
성별: {request.gender}"""

    if request.personality:
        prompt += f"\n성격: {request.personality}"
    
    if request.userPrompt:
        prompt += f"\n추가 요청사항: {request.userPrompt}"
    
    prompt += """

다음 조건을 만족하는 스토리를 작성해주세요:
1. 따뜻하고 감동적인 톤으로 작성
2. 200-300자 정도의 적절한 길이
3. 입양을 고려하는 사람들이 공감할 수 있는 내용
4. 동물의 개성과 특성을 잘 드러내는 내용
5. 새로운 가족을 기다리는 마음을 표현
6. 자연스럽고 읽기 쉬운 한국어로 작성"""
    
    return prompt

@app.get("/")
async def root():
    return {"message": "Dog Breed Classifier API"}

import os
import openai
from fastapi import HTTPException
from .models import BackgroundStoryRequest
from .prompts import build_story_prompt

class StoryAIService:
    def __init__(self):
        # OpenAI 설정
        openai.api_key = os.getenv("OPENAI_API_KEY", "")
        if not openai.api_key:
            print("Warning: OPENAI_API_KEY not set")
    
    async def generate_background_story(self, request: BackgroundStoryRequest):
        """배경 스토리 생성 서비스"""
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
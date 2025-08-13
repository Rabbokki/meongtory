import os
import openai
from pydantic import BaseModel
from model import DogBreedClassifier
import io
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv()

# OpenAI 설정
openai.api_key = os.getenv("OPENAI_API_KEY", "")
if not openai.api_key:
    raise ValueError("OPENAI_API_KEY not set")

classifier = DogBreedClassifier()

class BreedingPrediction(BaseModel):
    result_breed: str
    probability: int
    traits: list[str]
    description: str
    image: str

def predict_breeding(parent1_image: bytes, parent2_image: bytes) -> BreedingPrediction:
    """
    두 부모 이미지를 받아 품종을 분석하고 LLM으로 교배 시뮬레이션
    Args:
        parent1_image: 첫 번째 부모 이미지 바이트
        parent2_image: 두 번째 부모 이미지 바이트
    Returns:
        BreedingPrediction 객체
    """
    try:
        # 1. 품종 예측
        parent1_breed = classifier.predict(io.BytesIO(parent1_image))["breed"]
        parent2_breed = classifier.predict(io.BytesIO(parent2_image))["breed"]

        # 2. LLM 프롬프트 구성
        prompt = f"""다음 두 부모 강아지의 품종 정보를 바탕으로 자녀 강아지의 예상 품종, 특성, 설명을 생성해주세요:

부모 1 품종: {parent1_breed}
부모 2 품종: {parent2_breed}

다음 조건을 만족하는 응답을 작성해주세요:
1. 예상 품종(result_breed): 부모 품종을 조합한 혼합견 이름 또는 일반적인 혼합견
2. 확률(probability): 예측의 신뢰도(0-100%)
3. 특성(traits): 자녀가 가질 가능성이 높은 특성(4-5개, 예: ["활발함", "친화적"])
4. 설명(description): 자녀의 예상 특성과 매력을 설명하는 100-200자 텍스트
5. 자연스럽고 읽기 쉬운 한국어로 작성
6. JSON 형식으로 반환
"""
        # 3. OpenAI API 호출
        model_name = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")
        response = openai.ChatCompletion.create(
            model=model_name,
            messages=[
                {"role": "system", "content": "당신은 강아지 품종과 특성을 예측하는 전문가입니다."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=300,
            temperature=0.7
        )

        # 4. 응답 파싱
        result = response.choices[0].message.content.strip()
        import json
        prediction = json.loads(result)

        return BreedingPrediction(
            result_breed=prediction["result_breed"],
            probability=prediction["probability"],
            traits=prediction["traits"],
            description=prediction["description"],
            image=""  # 이미지 생성 없음
        )
    except Exception as e:
        raise Exception(f"교배 예측 실패: {str(e)}")
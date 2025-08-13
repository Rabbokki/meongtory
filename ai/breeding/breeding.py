import os
import openai
from pydantic import BaseModel
import sys
import io
from dotenv import load_dotenv

# breed 디렉토리의 model.py를 import하기 위해 경로 추가
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'breed'))
from breed.model import DogBreedClassifier

# 환경 변수 로드
load_dotenv()

# OpenAI 설정
openai.api_key = os.getenv("OPENAI_API_KEY", "")
if not openai.api_key:
    raise ValueError("OPENAI_API_KEY not set")

classifier = DogBreedClassifier()

class BreedingPrediction(BaseModel):
    resultBreed: str
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
        prompt = f"""부모 강아지 품종: {parent1_breed} + {parent2_breed}

자녀 강아지의 예상 정보를 JSON 형식으로 생성해주세요:
- resultBreed: 혼합견 이름
- probability: 예측 확률(0-100)
- traits: 특성 4-5개
- description: 100-200자 설명

자연스러운 한국어로 작성해주세요."""
        # 3. OpenAI API 호출
        model_name = os.getenv("OPENAI_BREEDING_MODEL", "gpt-3.5-turbo")
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

        # probability 값을 정수로 변환 (% 기호 제거)
        probability = prediction["probability"]
        if isinstance(probability, str):
            probability = int(probability.replace("%", ""))
        else:
            probability = int(probability)

        # 5. DALL-E 이미지 생성
        image_url = ""
        try:
            image_model = os.getenv("OPENAI_IMAGE_MODEL", "dall-e-3")
            image_prompt = (
                f"A photorealistic puppy that looks like a mix between a {parent1_breed} and a {parent2_breed}. "
                f"Natural coat colors and texture, soft lighting, shallow depth of field, "
                f"studio-quality photograph, centered, neutral background."
            )
            
            image_response = openai.Image.create(
                model=image_model,
                prompt=image_prompt,
                size="1024x1024",
                quality="standard",
                n=1
            )
            
            image_url = image_response['data'][0]['url']
            print(f"이미지 생성 성공: {image_url}")
            
        except Exception as img_error:
            print(f"이미지 생성 실패: {str(img_error)}")
            image_url = ""

        return BreedingPrediction(
            resultBreed=prediction["resultBreed"],
            probability=probability,
            traits=prediction["traits"],
            description=prediction["description"],
            image=image_url
        )
    except Exception as e:
        raise Exception(f"교배 예측 실패: {str(e)}")
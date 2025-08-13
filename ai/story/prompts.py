from .models import BackgroundStoryRequest

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
1. 사용자가 제공한 구체적인 정보나 요청사항을 반드시 스토리에 포함하고 자연스럽게 녹여내기
2. 일반적인 템플릿 문구보다는 동물의 실제 상황이나 특별한 사연을 중심으로 작성
3. 200-300자 정도의 적절한 길이
4. 입양을 고려하는 사람들이 공감할 수 있는 내용
5. 동물의 개성과 특성을 잘 드러내는 내용
6. 새로운 가족을 기다리는 마음을 표현
7. 자연스럽고 읽기 쉬운 한국어로 작성
8. 사용자가 요청한 톤이나 스타일이 있다면 그에 맞춰 작성"""
    
    return prompt 
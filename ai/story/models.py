from pydantic import BaseModel

# 배경스토리 요청 모델
class BackgroundStoryRequest(BaseModel):
    petName: str
    breed: str
    age: str
    gender: str
    personality: str = ""
    userPrompt: str = "" 
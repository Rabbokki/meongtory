from fastapi import APIRouter, File, UploadFile
import io
from .model import DogEmotionClassifier

router = APIRouter()
emotion_classifier = DogEmotionClassifier()

@router.post("/analyze-emotion")
async def analyze_dog_emotion(image: UploadFile = File(...)):
    image_bytes = io.BytesIO(await image.read())
    result = emotion_classifier.predict(image_bytes)
    return result
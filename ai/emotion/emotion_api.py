from fastapi import APIRouter, File, UploadFile
import io
from .model import DogEmotionClassifier

router = APIRouter()
emotion_classifier = DogEmotionClassifier()

@router.post("/analyze-emotion")
async def analyze_dog_emotion(file: UploadFile = File(...)):
    image_bytes = io.BytesIO(await file.read())
    result = emotion_classifier.predict(image_bytes)
    return result
from fastapi import APIRouter, File, UploadFile
import io
from .model import DogBreedClassifier

router = APIRouter()
classifier = DogBreedClassifier()

@router.post("/predict")
async def predict_dog_breed(file: UploadFile = File(...)):
    image_bytes = io.BytesIO(await file.read())
    result = classifier.predict(image_bytes)
    return result
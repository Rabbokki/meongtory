from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import io
from model import DogBreedClassifier

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

classifier = DogBreedClassifier()

@app.post("/predict")
async def predict_dog_breed(file: UploadFile = File(...)):
    image_bytes = io.BytesIO(await file.read())
    result = classifier.predict(image_bytes)
    return result

@app.get("/")
async def root():
    return {"message": "Dog Breed Classifier API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=9000)
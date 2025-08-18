import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torchvision.models import resnet50, ResNet50_Weights
from PIL import Image
import torch.nn.functional as F
from .emotion_labels import DOG_EMOTIONS, EMOTION_KOREAN

class DogEmotionClassifier:
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = resnet50(weights=ResNet50_Weights.IMAGENET1K_V2)
        
        # 마지막 분류층을 4개 감정으로 변경
        self.model.fc = nn.Linear(2048, 4)
        self.model.eval()
        self.model.to(self.device)
        
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], 
                               std=[0.229, 0.224, 0.225])
        ])
    
    def predict(self, image_bytes):
        image = Image.open(image_bytes).convert('RGB')
        input_tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            outputs = self.model(input_tensor)
            probabilities = F.softmax(outputs, dim=1)
            
        # Get top prediction
        top_prob, top_idx = torch.max(probabilities, 1)
        
        emotion_idx = top_idx.item()
        confidence = top_prob.item() * 100
        
        emotion_en = DOG_EMOTIONS[emotion_idx]
        emotion_kr = EMOTION_KOREAN[emotion_en]
        
        return {
            "emotion": emotion_en,
            "emotion_korean": emotion_kr,
            "confidence": round(confidence, 1)
        }
import torch
import torchvision.transforms as transforms
from torchvision.models import resnet50, ResNet50_Weights
from PIL import Image
import torch.nn.functional as F
from breed.dog_breeds import DOG_BREEDS

class DogBreedClassifier:
    def __init__(self):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = resnet50(weights=ResNet50_Weights.IMAGENET1K_V2)
        self.model.eval()
        self.model.to(self.device)
        
        self.transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),  # ResNet-50 최적 입력 크기
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
            
        # Get top 3 predictions
        top3_prob, top3_indices = torch.topk(probabilities, 3)
        
        results = []
        for i in range(3):
            class_idx = top3_indices[0][i].item()
            confidence = top3_prob[0][i].item() * 100
            
            # Check if it's a dog breed
            if class_idx in DOG_BREEDS:
                breed_name = DOG_BREEDS[class_idx]
            else:
                breed_name = "믹스견"
            
            results.append({
                "breed": breed_name,
                "confidence": round(confidence, 1)
            })
        
        return results[0]  # Return top prediction
# ai/diary/diary_image_classifier.py
import logging
from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel
import io

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DiaryImageClassifier:
    def __init__(self, use_finetuned=False):
        self.model_path = "./clip-finetuned" if use_finetuned else "openai/clip-vit-base-patch32"
        self.model = CLIPModel.from_pretrained(self.model_path)
        self.processor = CLIPProcessor.from_pretrained(self.model_path, clean_up_tokenization_spaces=True)
        self.categories = ["dog medicine", "dog food", "dog toy", "dog clothing", "dog accessory", "dog treat"]
        logger.info(f"CLIP model loaded from {self.model_path}")

    def classify_image(self, image_bytes):
        try:
            # 바이트 데이터를 이미지로 변환
            image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            
            # 텍스트 프롬프트 생성
            text_prompts = [f"This is a {category}" for category in self.categories]
            
            # 입력 전처리
            inputs = self.processor(
                text=text_prompts,
                images=image,
                return_tensors="pt",
                padding=True
            )
            
            # 모델 예측
            with torch.no_grad():
                outputs = self.model(**inputs)
                logits_per_image = outputs.logits_per_image
                probs = logits_per_image.softmax(dim=1)
            
            # 가장 높은 확률의 카테고리 반환
            max_prob_idx = probs.argmax().item()
            predicted_category = self.categories[max_prob_idx]
            confidence = probs[0][max_prob_idx].item()
            
            logger.info(f"Predicted category: {predicted_category} (confidence: {confidence:.4f})")
            return {
                "category": predicted_category,
                "confidence": confidence
            }
        except Exception as e:
            logger.error(f"Image classification failed: {str(e)}")
            raise
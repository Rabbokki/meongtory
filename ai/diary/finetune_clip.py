# ai/diary/finetune_clip.py
import logging
import numpy as np
import pandas as pd
from datasets import load_dataset
from transformers import CLIPProcessor, CLIPModel, Trainer, TrainingArguments
import torch
from PIL import Image
from pathlib import Path
import os
import requests
import urllib.request
from urllib.error import HTTPError, URLError

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 데이터셋 경로
DATASET_PATH = "./product-250-amazon"
CATEGORIES = ["강아지 약", "사료", "장난감", "옷", "용품", "간식"]

def download_images(df, image_dir):
    """
    imUrl에서 이미지를 다운로드하여 imagefolder 구조로 저장
    """
    os.makedirs(image_dir, exist_ok=True)
    for category in CATEGORIES:
        os.makedirs(os.path.join(image_dir, category), exist_ok=True)
    
    for idx, row in df.iterrows():
        try:
            image_url = row['imUrl']
            category = row['label']
            image_path = os.path.join(image_dir, category, f"image_{idx}.jpg")
            # 이미지 다운로드
            response = requests.get(image_url, timeout=10)
            if response.status_code == 200:
                with open(image_path, 'wb') as f:
                    f.write(response.content)
                # 이미지 유효성 확인
                Image.open(image_path).verify()
                logger.info(f"Downloaded {image_url} to {image_path}")
            else:
                logger.warning(f"Failed to download {image_url}: HTTP {response.status_code}")
        except (HTTPError, URLError, Exception) as e:
            logger.warning(f"Failed to download {image_url}: {str(e)}")
            # 손상된 파일 삭제
            if os.path.exists(image_path):
                os.remove(image_path)

def prepare_dataset():
    """
    데이터셋을 로드하고 전처리
    """
    try:
        # CSV 로드
        csv_path = Path(DATASET_PATH) / "data_250.csv"
        df = pd.read_csv(csv_path)
        
        # 카테고리 매핑
        category_mapping = {
            0: '사료',
            1: '장난감',
            2: '옷',
            3: '강아지 약',
            4: '용품',
            5: '간식',
            # 6~19: '용품'으로 통합
            **{i: '용품' for i in range(6, 20)}
        }
        df['label'] = df['categories'].map(category_mapping)
        
        # 이미지 다운로드
        image_dir = Path(DATASET_PATH) / "images"
        download_images(df, image_dir)
        
        # 유효한 이미지 파일만 필터링
        valid_images = []
        for category in CATEGORIES:
            cat_dir = os.path.join(image_dir, category)
            if os.path.exists(cat_dir):
                for img_file in os.listdir(cat_dir):
                    img_path = os.path.join(cat_dir, img_file)
                    try:
                        Image.open(img_path).verify()
                        valid_images.append(img_path)
                    except Exception:
                        logger.warning(f"Invalid image: {img_path}")
                        os.remove(img_path)
        
        if not valid_images:
            raise ValueError("No valid images found in dataset")
        
        # imagefolder 데이터셋 로드
        dataset = load_dataset("imagefolder", data_dir=image_dir, split="train")
        logger.info(f"Dataset loaded from: {image_dir}")
        
        # 데이터셋 전처리
        def preprocess(example):
            # example['image']는 이미 PIL.Image.Image 객체
            image = example['image'] if isinstance(example['image'], Image.Image) else Image.open(example['image']).convert("RGB")
            label = example['label']  # imagefolder는 폴더명에서 레이블 가져옴
            return {
                'image': image,
                'label': label
            }
        
        dataset = dataset.map(preprocess, remove_columns=['image'])
        return dataset
    except Exception as e:
        logger.error(f"Failed to load dataset: {str(e)}")
        raise

def finetune_clip():
    """
    CLIP 모델을 fine-tuning하고 저장
    """
    try:
        # 데이터셋 로드
        dataset = prepare_dataset()
        train_dataset = dataset.train_test_split(test_size=0.2)['train']
        eval_dataset = dataset.train_test_split(test_size=0.2)['test']

        # 모델 및 프로세서 로드
        model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
        processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

        # 학습 설정
        training_args = TrainingArguments(
            output_dir="./clip-finetuned",
            num_train_epochs=3,
            per_device_train_batch_size=16,
            per_device_eval_batch_size=16,
            evaluation_strategy="epoch",
            save_strategy="epoch",
            load_best_model_at_end=True,
            logging_dir="./logs",
            logging_steps=10,
        )

        # 데이터 전처리 함수
        def collate_fn(examples):
            images = [example['image'] for example in examples]
            labels = [example['label'] for example in examples]
            inputs = processor(
                text=CATEGORIES,
                images=images,
                return_tensors="pt",
                padding=True,
                truncation=True
            )
            inputs['labels'] = torch.tensor([CATEGORIES.index(label) for label in labels])
            return inputs

        # Trainer 설정
        trainer = Trainer(
            model=model,
            args=training_args,
            train_dataset=train_dataset,
            eval_dataset=eval_dataset,
            data_collator=collate_fn,
        )

        # 학습 실행
        trainer.train()

        # 모델 저장
        model.save_pretrained("./clip-finetuned")
        processor.save_pretrained("./clip-finetuned")
        logger.info("Fine-tuned model saved to ./clip-finetuned")

        # Hugging Face Hub에 업로드 (선택 사항)
        # $env:HF_TOKEN="your-hf-token"
        # model.push_to_hub("joolegend/finetuned-clip-pet-supplies")
        # processor.push_to_hub("joolegend/finetuned-clip-pet-supplies")
    except Exception as e:
        logger.error(f"Fine-tuning failed: {str(e)}")
        raise

if __name__ == "__main__":
    finetune_clip()
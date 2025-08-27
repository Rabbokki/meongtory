import os
from pathlib import Path
from typing import Dict, Tuple, List

import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.transforms as transforms
import torchvision.models as models
from torchvision.models import ResNet50_Weights
from torchvision import datasets
from torch.utils.data import DataLoader

import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    classification_report,
    confusion_matrix,
    accuracy_score,
    f1_score,
)
import sys


# =========================
# 사용자 설정 (Colab 환경 기준)
# =========================
# Colab에서는 절대 경로 사용
VAL_DIR = "/content/mt/ai/emotion/val"
ORIGINAL_MODEL_PATH = "/content/mt/ai/emotion/checkpoints_finetune/best_model_original.pth"
RETRAINED_MODEL_PATH = "/content/mt/ai/emotion/checkpoints_finetune/best_model.pth"


# =========================
# 라벨 정의 (model.py와 동일 순서)
# =========================
DOG_EMOTIONS = {
    0: "angry",
    1: "happy",
    2: "relaxed",
    3: "sad",
}
EMOTION_KOREAN = {
    "angry": "화남",
    "happy": "행복",
    "relaxed": "편안",
    "sad": "슬픔",
}


# =========================
# model.py의 DogEmotionModel 구조 복제
# =========================
class DogEmotionModel(nn.Module):
    """
    강아지 감정 분류를 위한 ResNet50 기반 모델 (Transfer Learning)
    """

    def __init__(self, num_classes: int = 4, pretrained: bool = True, dropout_rate: float = 0.3):
        super(DogEmotionModel, self).__init__()
        self.num_classes = num_classes

        if pretrained:
            weights = ResNet50_Weights.IMAGENET1K_V2
            backbone = models.resnet50(weights=weights)
        else:
            backbone = models.resnet50(weights=None)

        # avgpool까지 백본 추출
        self.backbone = nn.Sequential(*list(backbone.children())[:-1])

        # 커스텀 분류 헤드
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d((1, 1)),
            nn.Flatten(),
            nn.Dropout(dropout_rate),
            nn.Linear(2048, 512),
            nn.ReLU(inplace=True),
            nn.BatchNorm1d(512),
            nn.Dropout(dropout_rate),
            nn.Linear(512, 256),
            nn.ReLU(inplace=True),
            nn.BatchNorm1d(256),
            nn.Dropout(dropout_rate),
            nn.Linear(256, num_classes),
        )

        self.emotion_labels = ['angry', 'happy', 'relaxed', 'sad']
        self.emotion_to_idx = {emotion: idx for idx, emotion in enumerate(self.emotion_labels)}
        self.idx_to_emotion = {idx: emotion for emotion, idx in self.emotion_to_idx.items()}

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        features = self.backbone(x)
        logits = self.classifier(features)
        return logits


# =========================
# Transform (model.py와 동일)
# =========================
val_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])


# =========================
# 유틸 함수
# =========================
def load_finetuned_weights(model: nn.Module, checkpoint_path: str, device: torch.device) -> None:
    assert os.path.isfile(checkpoint_path), f"파일이 없습니다: {checkpoint_path}"
    ckpt = torch.load(checkpoint_path, map_location=device)
    if isinstance(ckpt, dict) and "model_state_dict" in ckpt:
        model.load_state_dict(ckpt["model_state_dict"])
    else:
        model.load_state_dict(ckpt)


@torch.inference_mode()
def evaluate_model(model: nn.Module, loader: DataLoader, device: torch.device) -> Tuple[float, np.ndarray, np.ndarray]:
    model.eval()
    y_true: List[int] = []
    y_pred: List[int] = []

    for images, labels in loader:
        images = images.to(device, non_blocking=True)
        logits = model(images)
        probs = F.softmax(logits, dim=1)
        preds = probs.argmax(dim=1).cpu().numpy()
        y_pred.extend(list(preds))
        y_true.extend(list(labels.numpy()))

    acc = accuracy_score(y_true, y_pred)
    return acc, np.array(y_true), np.array(y_pred)


def plot_accuracy_compare(acc_init: float, acc_original: float, acc_retrained: float) -> None:
    plt.figure(figsize=(8, 5))
    methods = ["Initial model", "Original fine-tuned", "Retrained model"]
    values = [acc_init * 100, acc_original * 100, acc_retrained * 100]
    bars = plt.bar(methods, values, color=["#9999ff", "#66cc99", "#ff9966"])
    plt.ylabel("Accuracy (%)")
    plt.title("Overall Accuracy Comparison (3-Model)")
    for bar, val in zip(bars, values):
        plt.text(bar.get_x() + bar.get_width()/2.0, bar.get_height() + 0.5, f"{val:.1f}%", ha='center', va='bottom')
    plt.ylim(0, 100)
    plt.grid(axis="y", alpha=0.2)
    plt.xticks(rotation=15)
    plt.tight_layout()
    plt.show()


def plot_confusion_matrices(y_true_init, y_pred_init, y_true_orig, y_pred_orig, y_true_retrained, y_pred_retrained, class_names: List[str]) -> None:
    cm_init = confusion_matrix(y_true_init, y_pred_init, labels=list(range(len(class_names))))
    cm_orig = confusion_matrix(y_true_orig, y_pred_orig, labels=list(range(len(class_names))))
    cm_retrained = confusion_matrix(y_true_retrained, y_pred_retrained, labels=list(range(len(class_names))))

    fig, axes = plt.subplots(1, 3, figsize=(18, 5))
    
    sns.heatmap(cm_init, annot=True, fmt="d", cmap="Blues", ax=axes[0],
                xticklabels=class_names, yticklabels=class_names)
    axes[0].set_title("Initial Model")
    axes[0].set_xlabel("Predicted")
    axes[0].set_ylabel("Actual")

    sns.heatmap(cm_orig, annot=True, fmt="d", cmap="Greens", ax=axes[1],
                xticklabels=class_names, yticklabels=class_names)
    axes[1].set_title("Original Fine-tuned")
    axes[1].set_xlabel("Predicted")
    axes[1].set_ylabel("Actual")

    sns.heatmap(cm_retrained, annot=True, fmt="d", cmap="Oranges", ax=axes[2],
                xticklabels=class_names, yticklabels=class_names)
    axes[2].set_title("Retrained Model")
    axes[2].set_xlabel("Predicted")
    axes[2].set_ylabel("Actual")

    plt.tight_layout()
    plt.show()


def plot_per_class_f1(y_true_init, y_pred_init, y_true_orig, y_pred_orig, y_true_retrained, y_pred_retrained, class_names: List[str]) -> None:
    f1_init = f1_score(y_true_init, y_pred_init, average=None, labels=list(range(len(class_names))))
    f1_orig = f1_score(y_true_orig, y_pred_orig, average=None, labels=list(range(len(class_names))))
    f1_retrained = f1_score(y_true_retrained, y_pred_retrained, average=None, labels=list(range(len(class_names))))

    x = np.arange(len(class_names))

    plt.figure(figsize=(10, 5))
    plt.plot(x, f1_init, marker='o', linewidth=2.0, color="#5967ff", label="Initial")
    plt.plot(x, f1_orig, marker='s', linewidth=2.0, color="#1abc9c", label="Original Fine-tuned")
    plt.plot(x, f1_retrained, marker='^', linewidth=2.0, color="#ff7f0e", label="Retrained")
    plt.xticks(x, class_names)
    plt.ylim(0, 1.0)
    plt.ylabel("F1-score")
    plt.title("Per-class F1-score Comparison (3-Model)")
    plt.legend()
    plt.grid(axis="y", alpha=0.2)
    plt.tight_layout()
    plt.show()


def print_reports(y_true_init, y_pred_init, y_true_orig, y_pred_orig, y_true_retrained, y_pred_retrained, class_names: List[str]) -> None:
    print("=== Initial Model Classification Report ===")
    print(classification_report(y_true_init, y_pred_init, target_names=class_names, digits=3))
    print("\n=== Original Fine-tuned Model Classification Report ===")
    print(classification_report(y_true_orig, y_pred_orig, target_names=class_names, digits=3))
    print("\n=== Retrained Model Classification Report ===")
    print(classification_report(y_true_retrained, y_pred_retrained, target_names=class_names, digits=3))




def main() -> None:
    # GPU 전용 설정 (Colab)
    assert torch.cuda.is_available(), "Colab 런타임에서 GPU를 켜세요: Runtime -> Change runtime type -> GPU"
    device = torch.device("cuda")
    torch.backends.cudnn.benchmark = True
    print("Device:", device)

    # 데이터셋 & 로더
    assert os.path.isdir(VAL_DIR), f"검증 경로가 존재하지 않습니다: {VAL_DIR}"
    val_dataset = datasets.ImageFolder(root=VAL_DIR, transform=val_transform)
    print("ImageFolder class_to_idx:", val_dataset.class_to_idx)

    val_loader = DataLoader(
        val_dataset,
        batch_size=32,
        shuffle=False,
        num_workers=2,
        pin_memory=True,
    )

    # 모델 준비 (3개 모델)
    init_model = DogEmotionModel(num_classes=4, pretrained=True, dropout_rate=0.3).to(device)
    original_model = DogEmotionModel(num_classes=4, pretrained=True, dropout_rate=0.3).to(device)
    retrained_model = DogEmotionModel(num_classes=4, pretrained=True, dropout_rate=0.3).to(device)

    # 원본 파인튜닝 모델 로드
    if os.path.isfile(ORIGINAL_MODEL_PATH):
        load_finetuned_weights(original_model, ORIGINAL_MODEL_PATH, device)
        print(f"✅ 원본 파인튜닝 가중치 로드 완료: {ORIGINAL_MODEL_PATH}")
    else:
        raise FileNotFoundError(f"원본 파인튜닝 모델을 찾을 수 없습니다: {ORIGINAL_MODEL_PATH}")
    
    # 재학습 모델 로드
    if os.path.isfile(RETRAINED_MODEL_PATH):
        load_finetuned_weights(retrained_model, RETRAINED_MODEL_PATH, device)
        print(f"✅ 재학습 가중치 로드 완료: {RETRAINED_MODEL_PATH}")
    else:
        raise FileNotFoundError(f"재학습 모델을 찾을 수 없습니다: {RETRAINED_MODEL_PATH}")

    # 평가 (3개 모델)
    print("🔍 초기 모델(사전학습만) 평가 중...")
    acc_init, y_true_init, y_pred_init = evaluate_model(init_model, val_loader, device)
    
    print("🔍 원본 파인튜닝 모델 평가 중...")
    acc_orig, y_true_orig, y_pred_orig = evaluate_model(original_model, val_loader, device)
    
    print("🔍 재학습 모델 평가 중...")
    acc_retrained, y_true_retrained, y_pred_retrained = evaluate_model(retrained_model, val_loader, device)

    print("\n" + "="*60)
    print("📊 3-모델 성능 비교 결과")
    print("="*60)
    print(f"📌 초기 모델 정확도:        {acc_init*100:.2f}%")
    print(f"🎯 원본 파인튜닝 정확도:    {acc_orig*100:.2f}%")
    print(f"🚀 재학습 모델 정확도:      {acc_retrained*100:.2f}%")
    print("="*60)
    print(f"📈 초기 → 원본 개선:       +{(acc_orig-acc_init)*100:.2f}%p")
    print(f"🔥 원본 → 재학습 개선:     +{(acc_retrained-acc_orig)*100:.2f}%p")
    print(f"⭐ 전체 개선 (초기→재학습): +{(acc_retrained-acc_init)*100:.2f}%p")
    print("="*60)

    # 리포트 및 시각화 (3개 모델)
    class_names = ['angry', 'happy', 'relaxed', 'sad']
    print_reports(y_true_init, y_pred_init, y_true_orig, y_pred_orig, y_true_retrained, y_pred_retrained, class_names)
    plot_accuracy_compare(acc_init, acc_orig, acc_retrained)
    plot_per_class_f1(y_true_init, y_pred_init, y_true_orig, y_pred_orig, y_true_retrained, y_pred_retrained, class_names)
    plot_confusion_matrices(y_true_init, y_pred_init, y_true_orig, y_pred_orig, y_true_retrained, y_pred_retrained, class_names)


if __name__ == "__main__":
    main()



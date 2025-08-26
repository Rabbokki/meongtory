"""
모델 성능 추적 및 평가 서비스 모듈
모델 버전별 성능 자동 평가 및 비교 기능 제공
"""

import torch
import torch.nn.functional as F
import torchvision.transforms as transforms
from torch.utils.data import DataLoader
from torchvision import datasets
import kagglehub
from .dataset import DogEmotionDataset, DataTransforms, DataSplitter
import requests
import logging
import json
import os
import numpy as np
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Tuple, Optional
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns

from .model import DogEmotionModel
from .emotion_labels import DOG_EMOTIONS, EMOTION_KOREAN

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelPerformanceTracker:
    """모델 성능 추적 및 평가 서비스"""
    
    def __init__(self, backend_url: str = None):
        """
        성능 추적 서비스 초기화
        
        Args:
            backend_url (str): 백엔드 서버 URL
        """
        if backend_url is None:
            frontend_url = os.getenv("NEXT_PUBLIC_BACKEND_URL")
            if frontend_url and frontend_url.startswith("https://"):
                self.backend_url = frontend_url
            else:
                self.backend_url = frontend_url or "http://localhost:8080"
        else:
            self.backend_url = backend_url
            
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # 경로 설정
        self.emotion_model_dir = Path(__file__).parent
        self.current_model_path = self.emotion_model_dir / "checkpoints_finetune" / "best_model.pth"
        
        # Kaggle 데이터셋 경로 설정
        try:
            dataset_path = kagglehub.dataset_download("danielshanbalico/dog-emotion")
            self.dataset_path = Path(dataset_path) / "Dog Emotion"
            self.csv_file = self.dataset_path / "labels.csv"
            logger.info(f"Kaggle 데이터셋 경로: {self.dataset_path}")
        except Exception as e:
            logger.warning(f"Kaggle 데이터셋 로드 실패: {e}")
            self.dataset_path = None
            self.csv_file = None
        
        # 검증용 변환 설정
        self.val_transform = DataTransforms.get_val_transforms(224)
        
        logger.info(f"모델 성능 추적 서비스 초기화 완료")
    
    def evaluate_current_model(self) -> Optional[Dict]:
        """
        현재 활성 모델 성능 평가
        
        Returns:
            Dict: 평가 결과 또는 None
        """
        try:
            logger.info("현재 모델 성능 평가 시작")
            
            if not self.current_model_path.exists():
                logger.warning("현재 모델 파일이 존재하지 않습니다")
                return None
            
            if not self.dataset_path or not self.csv_file.exists():
                logger.warning(f"Kaggle 데이터셋이 존재하지 않습니다: {self.dataset_path}")
                return None
            
            # 모델 로드
            model = DogEmotionModel(num_classes=4, pretrained=True, dropout_rate=0.3)
            checkpoint = torch.load(self.current_model_path, map_location=self.device)
            
            if isinstance(checkpoint, dict) and 'model_state_dict' in checkpoint:
                model.load_state_dict(checkpoint['model_state_dict'])
            else:
                model.load_state_dict(checkpoint)
            
            model.to(self.device)
            model.eval()
            
            # 검증 데이터 로드 (CSV 라벨링 방식)
            splitter = DataSplitter(self.csv_file, self.dataset_path, train_ratio=0.7, val_ratio=0.15, test_ratio=0.15)
            train_df, val_df, test_df = splitter.split_data()
            
            # 검증 데이터셋 생성
            val_dataset = DogEmotionDataset(val_df, self.dataset_path, transform=self.val_transform)
            val_loader = DataLoader(val_dataset, batch_size=32, shuffle=False, num_workers=2)
            
            # 성능 평가
            metrics = self._evaluate_model(model, val_loader)
            
            # 결과 저장
            evaluation_result = {
                'timestamp': datetime.now().isoformat(),
                'model_path': str(self.current_model_path),
                'dataset_size': len(val_dataset),
                'class_distribution': self._get_class_distribution_csv(val_df),
                **metrics
            }
            
            logger.info(f"모델 성능 평가 완료 - 정확도: {metrics['accuracy']:.4f}")
            return evaluation_result
            
        except Exception as e:
            logger.error(f"모델 성능 평가 중 오류: {e}")
            return None
    
    def _evaluate_model(self, model: torch.nn.Module, data_loader: DataLoader) -> Dict:
        """
        모델 성능 평가 수행
        
        Args:
            model: 평가할 모델
            data_loader: 평가 데이터 로더
            
        Returns:
            Dict: 평가 메트릭들
        """
        y_true = []
        y_pred = []
        y_probs = []
        
        with torch.no_grad():
            for images, labels in data_loader:
                images = images.to(self.device)
                outputs = model(images)
                probabilities = F.softmax(outputs, dim=1)
                predictions = torch.argmax(outputs, dim=1)
                
                y_true.extend(labels.cpu().numpy())
                y_pred.extend(predictions.cpu().numpy())
                y_probs.extend(probabilities.cpu().numpy())
        
        y_true = np.array(y_true)
        y_pred = np.array(y_pred)
        y_probs = np.array(y_probs)
        
        # 기본 메트릭 계산
        accuracy = accuracy_score(y_true, y_pred)
        f1_macro = f1_score(y_true, y_pred, average='macro')
        f1_weighted = f1_score(y_true, y_pred, average='weighted')
        precision = precision_score(y_true, y_pred, average='weighted', zero_division=0)
        recall = recall_score(y_true, y_pred, average='weighted', zero_division=0)
        
        # 클래스별 메트릭
        class_metrics = self._calculate_per_class_metrics(y_true, y_pred)
        
        # 혼동 행렬
        conf_matrix = confusion_matrix(y_true, y_pred)
        
        # 신뢰도 통계
        confidence_stats = self._calculate_confidence_stats(y_probs, y_pred)
        
        return {
            'accuracy': float(accuracy),
            'f1_score_macro': float(f1_macro),
            'f1_score_weighted': float(f1_weighted),
            'precision': float(precision),
            'recall': float(recall),
            'per_class_metrics': class_metrics,
            'confusion_matrix': conf_matrix.tolist(),
            'confidence_stats': confidence_stats,
            'total_samples': len(y_true)
        }
    
    def _calculate_per_class_metrics(self, y_true: np.ndarray, y_pred: np.ndarray) -> Dict:
        """클래스별 성능 메트릭 계산"""
        class_names = ['angry', 'happy', 'relaxed', 'sad']
        per_class = {}
        
        for i, class_name in enumerate(class_names):
            class_mask = (y_true == i)
            if np.sum(class_mask) > 0:  # 해당 클래스가 존재하는 경우만
                class_accuracy = accuracy_score(y_true[class_mask], y_pred[class_mask]) if np.sum(y_pred == i) > 0 else 0.0
                class_precision = precision_score(y_true, y_pred, labels=[i], average=None, zero_division=0)
                class_recall = recall_score(y_true, y_pred, labels=[i], average=None, zero_division=0)
                class_f1 = f1_score(y_true, y_pred, labels=[i], average=None, zero_division=0)
                
                per_class[class_name] = {
                    'precision': float(class_precision[0]) if len(class_precision) > 0 else 0.0,
                    'recall': float(class_recall[0]) if len(class_recall) > 0 else 0.0,
                    'f1_score': float(class_f1[0]) if len(class_f1) > 0 else 0.0,
                    'support': int(np.sum(class_mask))
                }
        
        return per_class
    
    def _calculate_confidence_stats(self, y_probs: np.ndarray, y_pred: np.ndarray) -> Dict:
        """예측 신뢰도 통계 계산"""
        max_probs = np.max(y_probs, axis=1)
        
        return {
            'mean_confidence': float(np.mean(max_probs)),
            'std_confidence': float(np.std(max_probs)),
            'min_confidence': float(np.min(max_probs)),
            'max_confidence': float(np.max(max_probs)),
            'high_confidence_ratio': float(np.mean(max_probs > 0.8)),  # 80% 이상 신뢰도
            'low_confidence_ratio': float(np.mean(max_probs < 0.5))    # 50% 미만 신뢰도
        }
    
    def _get_class_distribution_csv(self, df) -> Dict:
        """CSV 데이터프레임의 클래스 분포 계산"""
        label_column = 'label' if 'label' in df.columns else 'emotion'
        class_counts = df[label_column].value_counts().to_dict()
        return class_counts
    
    def update_model_version_performance(self, version_id: int, metrics: Dict) -> bool:
        """
        백엔드에 모델 버전 성능 정보 업데이트
        
        Args:
            version_id (int): 모델 버전 ID
            metrics (Dict): 성능 메트릭
            
        Returns:
            bool: 성공 여부
        """
        try:
            # 성능 데이터 준비
            performance_data = {
                'validationAccuracy': metrics['accuracy'],
                'f1Score': metrics['f1_score_weighted'],
                'performanceMetrics': json.dumps(metrics)
            }
            
            url = f"{self.backend_url}/api/emotion/model-version/{version_id}"
            response = requests.patch(url, json=performance_data, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            if result.get('success', False):
                logger.info(f"모델 버전 {version_id} 성능 정보 업데이트 완료")
                return True
            else:
                logger.warning(f"성능 정보 업데이트 실패: {result.get('message')}")
                return False
                
        except Exception as e:
            logger.error(f"성능 정보 업데이트 중 오류: {e}")
            return False
    
    def compare_model_versions(self, version_ids: List[int]) -> Optional[Dict]:
        """
        여러 모델 버전 성능 비교
        
        Args:
            version_ids (List[int]): 비교할 모델 버전 ID 목록
            
        Returns:
            Dict: 비교 결과 또는 None
        """
        try:
            comparison_data = []
            
            for version_id in version_ids:
                version_info = self._get_version_performance(version_id)
                if version_info:
                    comparison_data.append(version_info)
            
            if not comparison_data:
                return None
            
            # 성능 비교 분석
            analysis = self._analyze_performance_comparison(comparison_data)
            
            return {
                'versions': comparison_data,
                'analysis': analysis,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"모델 버전 비교 중 오류: {e}")
            return None
    
    def _get_version_performance(self, version_id: int) -> Optional[Dict]:
        """특정 버전의 성능 정보 조회"""
        try:
            url = f"{self.backend_url}/api/emotion/model-version/{version_id}"
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            if result.get('success', False):
                return result.get('data')
            else:
                logger.warning(f"버전 {version_id} 성능 정보 조회 실패")
                return None
                
        except Exception as e:
            logger.error(f"버전 성능 정보 조회 중 오류: {e}")
            return None
    
    def _analyze_performance_comparison(self, versions: List[Dict]) -> Dict:
        """성능 비교 분석"""
        if not versions:
            return {}
        
        # 정확도 기준 분석
        accuracies = [v.get('validationAccuracy', 0) for v in versions]
        f1_scores = [v.get('f1Score', 0) for v in versions]
        
        best_accuracy_idx = np.argmax(accuracies)
        best_f1_idx = np.argmax(f1_scores)
        
        return {
            'best_accuracy_version': versions[best_accuracy_idx]['version'],
            'best_accuracy_value': accuracies[best_accuracy_idx],
            'best_f1_version': versions[best_f1_idx]['version'],
            'best_f1_value': f1_scores[best_f1_idx],
            'mean_accuracy': np.mean(accuracies),
            'std_accuracy': np.std(accuracies),
            'mean_f1': np.mean(f1_scores),
            'std_f1': np.std(f1_scores),
            'version_count': len(versions)
        }
    
    def generate_performance_report(self, version_id: int = None) -> Optional[str]:
        """
        성능 리포트 생성
        
        Args:
            version_id (int): 특정 버전 ID (None이면 현재 모델)
            
        Returns:
            str: 리포트 문자열 또는 None
        """
        try:
            if version_id:
                # 특정 버전 성능 정보 조회
                version_info = self._get_version_performance(version_id)
                if not version_info:
                    return None
                
                metrics = json.loads(version_info.get('performanceMetrics', '{}'))
                version_name = version_info.get('version', 'Unknown')
            else:
                # 현재 모델 평가
                metrics = self.evaluate_current_model()
                if not metrics:
                    return None
                version_name = "Current Model"
            
            # 리포트 생성
            report = self._format_performance_report(version_name, metrics)
            
            logger.info(f"성능 리포트 생성 완료: {version_name}")
            return report
            
        except Exception as e:
            logger.error(f"성능 리포트 생성 중 오류: {e}")
            return None
    
    def _format_performance_report(self, version_name: str, metrics: Dict) -> str:
        """성능 리포트 포맷팅"""
        report = f"""
=== 모델 성능 리포트: {version_name} ===
생성 시간: {metrics.get('timestamp', 'Unknown')}
데이터셋 크기: {metrics.get('total_samples', 'N/A')}개

== 전체 성능 ==
정확도: {metrics.get('accuracy', 0):.4f}
F1 스코어 (가중평균): {metrics.get('f1_score_weighted', 0):.4f}
정밀도: {metrics.get('precision', 0):.4f}
재현율: {metrics.get('recall', 0):.4f}

== 클래스별 성능 =="""
        
        per_class = metrics.get('per_class_metrics', {})
        for class_name, class_metrics in per_class.items():
            korean_name = EMOTION_KOREAN.get(class_name, class_name)
            report += f"""
{korean_name} ({class_name}):
  정밀도: {class_metrics.get('precision', 0):.4f}
  재현율: {class_metrics.get('recall', 0):.4f}
  F1 스코어: {class_metrics.get('f1_score', 0):.4f}
  샘플 수: {class_metrics.get('support', 0)}"""
        
        confidence_stats = metrics.get('confidence_stats', {})
        if confidence_stats:
            report += f"""

== 신뢰도 통계 ==
평균 신뢰도: {confidence_stats.get('mean_confidence', 0):.4f}
높은 신뢰도 비율 (>80%): {confidence_stats.get('high_confidence_ratio', 0):.2%}
낮은 신뢰도 비율 (<50%): {confidence_stats.get('low_confidence_ratio', 0):.2%}"""
        
        return report


# 전역 성능 추적 서비스 인스턴스
_performance_tracker = None

def get_performance_tracker(backend_url: str = None) -> ModelPerformanceTracker:
    """성능 추적 서비스 싱글톤 인스턴스 반환"""
    global _performance_tracker
    if _performance_tracker is None:
        _performance_tracker = ModelPerformanceTracker(backend_url)
    return _performance_tracker


if __name__ == "__main__":
    # 테스트 실행
    tracker = get_performance_tracker()
    
    # 현재 모델 성능 평가
    print("현재 모델 성능 평가 중...")
    metrics = tracker.evaluate_current_model()
    
    if metrics:
        print(f"평가 완료!")
        print(f"정확도: {metrics['accuracy']:.4f}")
        print(f"F1 스코어: {metrics['f1_score_weighted']:.4f}")
        
        # 성능 리포트 생성
        report = tracker.generate_performance_report()
        if report:
            print("\n" + "="*50)
            print(report)
    else:
        print("성능 평가 실패 - 검증 데이터셋이 필요합니다")
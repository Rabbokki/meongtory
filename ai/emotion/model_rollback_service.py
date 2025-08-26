"""
모델 롤백 및 버전 관리 서비스 모듈
실제 모델 파일 교체 및 복원 기능 제공
"""

import torch
import requests
import logging
import json
import os
import shutil
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Tuple, Optional

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ModelRollbackService:
    """모델 롤백 및 버전 관리 서비스"""
    
    def __init__(self, backend_url: str = None):
        """
        롤백 서비스 초기화
        
        Args:
            backend_url (str): 백엔드 서버 URL (None이면 환경변수에서 자동 설정)
        """
        if backend_url is None:
            # 환경변수에서 백엔드 URL 설정
            frontend_url = os.getenv("NEXT_PUBLIC_BACKEND_URL")
            if frontend_url and frontend_url.startswith("https://"):
                self.backend_url = frontend_url  # ALB를 통한 라우팅
            else:
                self.backend_url = frontend_url or "http://localhost:8080"  # 로컬 개발환경
        else:
            self.backend_url = backend_url
            
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # 모델 경로 설정
        self.emotion_model_dir = Path(__file__).parent
        self.current_model_dir = self.emotion_model_dir / "checkpoints_finetune"
        self.current_model_path = self.current_model_dir / "best_model.pth"
        self.backup_dir = self.emotion_model_dir / "model_backups"
        self.versions_dir = self.emotion_model_dir / "model_versions"
        
        # 디렉토리 생성
        self.backup_dir.mkdir(exist_ok=True)
        self.versions_dir.mkdir(exist_ok=True)
        
        logger.info(f"모델 롤백 서비스 초기화 완료 - 백엔드: {self.backend_url}")
    
    def get_available_versions(self) -> Optional[List[Dict]]:
        """
        롤백 가능한 모델 버전 목록 조회
        
        Returns:
            List[Dict]: 버전 목록 또는 None
        """
        try:
            url = f"{self.backend_url}/api/emotion/model-version/rollback-candidates"
            logger.info(f"롤백 후보 조회 요청: {url}")
            
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            if result.get('success', False):
                versions = result.get('data', [])
                logger.info(f"롤백 가능한 버전 {len(versions)}개 조회")
                return versions
            else:
                logger.warning(f"롤백 후보 조회 실패: {result.get('message', 'Unknown error')}")
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"롤백 후보 조회 중 네트워크 오류: {e}")
            return None
        except Exception as e:
            logger.error(f"롤백 후보 조회 중 예외 발생: {e}")
            return None
    
    def backup_current_model(self) -> Optional[str]:
        """
        현재 모델을 백업
        
        Returns:
            str: 백업 파일 경로 또는 None
        """
        try:
            if not self.current_model_path.exists():
                logger.warning("백업할 현재 모델이 존재하지 않습니다")
                return None
                
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_filename = f"rollback_backup_{timestamp}.pth"
            backup_path = self.backup_dir / backup_filename
            
            shutil.copy2(self.current_model_path, backup_path)
            logger.info(f"현재 모델 백업 완료: {backup_path}")
            
            return str(backup_path)
            
        except Exception as e:
            logger.error(f"모델 백업 중 오류 발생: {e}")
            return None
    
    def rollback_to_version(self, version_id: int, reason: str = None) -> Dict[str, any]:
        """
        특정 버전으로 모델 롤백
        
        Args:
            version_id (int): 롤백할 버전 ID
            reason (str): 롤백 이유
            
        Returns:
            Dict: 롤백 결과
        """
        result = {
            'success': False,
            'message': '',
            'version_id': version_id,
            'backup_path': None,
            'timestamp': datetime.now().isoformat()
        }
        
        try:
            logger.info(f"모델 롤백 시작 - 버전 ID: {version_id}, 이유: {reason}")
            
            # 1. 롤백 대상 버전 정보 조회
            version_info = self._get_version_info(version_id)
            if not version_info:
                result['message'] = f'롤백 대상 버전을 찾을 수 없습니다: {version_id}'
                return result
            
            # 2. 현재 모델 백업
            backup_path = self.backup_current_model()
            if backup_path:
                result['backup_path'] = backup_path
            
            # 3. 롤백 대상 모델 파일 확인 및 복사
            target_model_path = self._get_version_model_path(version_info)
            if not target_model_path or not Path(target_model_path).exists():
                # 백업에서 복원 시도
                if not self._restore_from_backup(version_info):
                    result['message'] = f'롤백 대상 모델 파일을 찾을 수 없습니다: {version_info.get("version")}'
                    return result
                target_model_path = self._get_version_model_path(version_info)
            
            # 4. 모델 파일 교체
            if self._replace_current_model(target_model_path):
                # 5. 백엔드에서 활성 버전 변경
                if self._activate_version_in_backend(version_id, reason):
                    result['success'] = True
                    result['message'] = f'모델이 성공적으로 롤백되었습니다: {version_info.get("version")}'
                    logger.info(f"모델 롤백 성공: {version_info.get('version')}")
                else:
                    result['message'] = '모델 파일은 교체되었지만 백엔드 활성화에 실패했습니다'
            else:
                result['message'] = '모델 파일 교체에 실패했습니다'
                
        except Exception as e:
            logger.error(f"모델 롤백 중 오류 발생: {e}")
            result['message'] = f'롤백 중 오류 발생: {str(e)}'
            
            # 오류 발생 시 백업에서 복원 시도
            if result.get('backup_path') and Path(result['backup_path']).exists():
                try:
                    shutil.copy2(result['backup_path'], self.current_model_path)
                    logger.info("백업에서 모델 복원 완료")
                except Exception as restore_error:
                    logger.error(f"백업 복원 실패: {restore_error}")
        
        return result
    
    def _get_version_info(self, version_id: int) -> Optional[Dict]:
        """특정 버전 정보 조회"""
        try:
            url = f"{self.backend_url}/api/emotion/model-version/{version_id}"
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            if result.get('success', False):
                return result.get('data')
            else:
                logger.warning(f"버전 정보 조회 실패: {result.get('message')}")
                return None
                
        except Exception as e:
            logger.error(f"버전 정보 조회 중 오류: {e}")
            return None
    
    def _get_version_model_path(self, version_info: Dict) -> Optional[str]:
        """버전 정보에서 모델 파일 경로 추출"""
        model_path = version_info.get('modelPath')
        if not model_path:
            return None
            
        # 상대 경로를 절대 경로로 변환
        if not os.path.isabs(model_path):
            model_path = self.emotion_model_dir / model_path
        
        return str(model_path)
    
    def _restore_from_backup(self, version_info: Dict) -> bool:
        """백업 디렉토리에서 해당 버전 모델 파일 찾기"""
        try:
            version = version_info.get('version', '')
            # 백업 디렉토리에서 해당 버전과 관련된 파일 찾기
            backup_files = list(self.backup_dir.glob(f"*{version}*"))
            if not backup_files:
                backup_files = list(self.backup_dir.glob("*.pth"))
            
            if backup_files:
                # 가장 최근 백업 파일 사용
                latest_backup = max(backup_files, key=os.path.getctime)
                target_path = self._get_version_model_path(version_info)
                if target_path:
                    shutil.copy2(latest_backup, target_path)
                    logger.info(f"백업에서 모델 복원: {latest_backup} -> {target_path}")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"백업 복원 중 오류: {e}")
            return False
    
    def _replace_current_model(self, source_path: str) -> bool:
        """현재 모델 파일을 새로운 파일로 교체"""
        try:
            if not Path(source_path).exists():
                logger.error(f"소스 모델 파일이 존재하지 않습니다: {source_path}")
                return False
            
            # 모델 파일 유효성 검사
            if self._validate_model_file(source_path):
                shutil.copy2(source_path, self.current_model_path)
                logger.info(f"모델 파일 교체 완료: {source_path} -> {self.current_model_path}")
                return True
            else:
                logger.error("모델 파일 유효성 검사 실패")
                return False
                
        except Exception as e:
            logger.error(f"모델 파일 교체 중 오류: {e}")
            return False
    
    def _validate_model_file(self, model_path: str) -> bool:
        """모델 파일 유효성 검사"""
        try:
            # PyTorch 모델 파일 로드 시도
            checkpoint = torch.load(model_path, map_location=self.device)
            
            # 기본적인 구조 검사
            if isinstance(checkpoint, dict):
                if 'model_state_dict' in checkpoint:
                    # state_dict 키 존재 확인
                    state_dict = checkpoint['model_state_dict']
                elif 'state_dict' in checkpoint:
                    state_dict = checkpoint['state_dict']
                else:
                    state_dict = checkpoint
            else:
                state_dict = checkpoint
            
            # 모델 가중치가 있는지 확인
            if not isinstance(state_dict, dict) or len(state_dict) == 0:
                logger.warning("모델 파일에 가중치가 없습니다")
                return False
            
            logger.info("모델 파일 유효성 검사 통과")
            return True
            
        except Exception as e:
            logger.error(f"모델 파일 유효성 검사 실패: {e}")
            return False
    
    def _activate_version_in_backend(self, version_id: int, reason: str = None) -> bool:
        """백엔드에서 해당 버전을 활성화"""
        try:
            request_data = {
                'versionId': version_id,
                'reason': reason or '모델 롤백'
            }
            
            url = f"{self.backend_url}/api/emotion/model-version/rollback"
            response = requests.post(url, json=request_data, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            if result.get('success', False):
                logger.info(f"백엔드에서 버전 활성화 성공: {version_id}")
                return True
            else:
                logger.warning(f"백엔드 버전 활성화 실패: {result.get('message')}")
                return False
                
        except Exception as e:
            logger.error(f"백엔드 버전 활성화 중 오류: {e}")
            return False
    
    def get_version_comparison(self) -> Optional[Dict]:
        """모델 버전 성능 비교 정보 조회"""
        try:
            url = f"{self.backend_url}/api/emotion/model-version/comparison"
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            if result.get('success', False):
                return result.get('data')
            else:
                logger.warning(f"버전 비교 조회 실패: {result.get('message')}")
                return None
                
        except Exception as e:
            logger.error(f"버전 비교 조회 중 오류: {e}")
            return None
    
    def cleanup_old_backups(self, keep_count: int = 10) -> int:
        """오래된 백업 파일 정리"""
        try:
            backup_files = list(self.backup_dir.glob("*.pth"))
            if len(backup_files) <= keep_count:
                return 0
            
            # 생성 시간 기준으로 정렬 (최신순)
            backup_files.sort(key=os.path.getctime, reverse=True)
            
            # 유지할 개수를 초과하는 파일들 삭제
            deleted_count = 0
            for backup_file in backup_files[keep_count:]:
                try:
                    backup_file.unlink()
                    deleted_count += 1
                    logger.info(f"오래된 백업 파일 삭제: {backup_file}")
                except Exception as e:
                    logger.warning(f"백업 파일 삭제 실패 {backup_file}: {e}")
            
            logger.info(f"백업 파일 정리 완료: {deleted_count}개 삭제")
            return deleted_count
            
        except Exception as e:
            logger.error(f"백업 파일 정리 중 오류: {e}")
            return 0


# 전역 롤백 서비스 인스턴스
_rollback_service = None

def get_rollback_service(backend_url: str = None) -> ModelRollbackService:
    """롤백 서비스 싱글톤 인스턴스 반환"""
    global _rollback_service
    if _rollback_service is None:
        _rollback_service = ModelRollbackService(backend_url)
    return _rollback_service


if __name__ == "__main__":
    # 테스트 실행
    service = get_rollback_service()
    
    # 사용 가능한 버전 조회
    versions = service.get_available_versions()
    if versions:
        print(f"롤백 가능한 버전: {len(versions)}개")
        for version in versions[:3]:  # 최근 3개만 출력
            print(f"- {version.get('version')}: {version.get('description')}")
    
    # 성능 비교 정보 조회
    comparison = service.get_version_comparison()
    if comparison:
        current = comparison.get('currentModel', {})
        performance = comparison.get('performanceComparison', {})
        print(f"\n현재 모델: {current.get('version', 'N/A')}")
        print(f"현재 성능: {performance.get('currentValidationAccuracy', 0)*100:.2f}%")
        print(f"최고 성능: {performance.get('bestValidationAccuracy', 0)*100:.2f}%")
        print(f"추천: {performance.get('recommendation', 'N/A')}")
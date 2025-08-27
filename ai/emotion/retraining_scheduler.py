"""
감정 분석 모델 재학습 스케줄러
피드백 데이터 누적량에 따라 자동으로 재학습을 트리거하는 시스템
"""

import asyncio
import schedule
import time
import threading
import logging
import json
import os
from datetime import datetime, timedelta
from typing import Dict, Optional, Callable
from pathlib import Path

from .retrain_service import get_retrain_service
from .performance_tracker import get_performance_tracker

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RetrainingScheduler:
    """자동 재학습 스케줄러"""
    
    def __init__(self, backend_url: str = None, config: Dict = None):
        """
        스케줄러 초기화
        
        Args:
            backend_url (str): 백엔드 서버 URL
            config (Dict): 스케줄러 설정
        """
        self.backend_url = backend_url
        self.retrain_service = get_retrain_service(backend_url)
        self.performance_tracker = get_performance_tracker(backend_url)
        
        # 기본 설정
        default_config = {
            'min_feedback_count': 20,           # 최소 피드백 개수
            'check_interval_minutes': 60,       # 체크 간격 (분)
            'auto_activation_threshold': 0.85,  # 자동 활성화 정확도 임계값
            'max_daily_retrains': 3,           # 하루 최대 재학습 횟수
            'enable_auto_activation': True,     # 자동 모델 활성화 여부
            'enable_performance_monitoring': True  # 성능 모니터링 여부
        }
        
        self.config = {**default_config, **(config or {})}
        
        # 실행 상태
        self.is_running = False
        self.scheduler_thread = None
        self.last_retrain_time = None
        self.daily_retrain_count = 0
        self.current_date = datetime.now().date()
        
        # 상태 저장 파일
        self.state_file = Path(__file__).parent / "scheduler_state.json"
        self.load_state()
        
        # 콜백 함수들
        self.on_retrain_start: Optional[Callable] = None
        self.on_retrain_complete: Optional[Callable] = None
        self.on_retrain_failed: Optional[Callable] = None
        
        logger.info("재학습 스케줄러 초기화 완료")
    
    def load_state(self):
        """스케줄러 상태 로드"""
        try:
            if self.state_file.exists():
                with open(self.state_file, 'r', encoding='utf-8') as f:
                    state = json.load(f)
                
                self.last_retrain_time = datetime.fromisoformat(state.get('last_retrain_time', '2000-01-01T00:00:00'))
                self.daily_retrain_count = state.get('daily_retrain_count', 0)
                
                # 날짜가 바뀌었으면 카운트 리셋
                saved_date = datetime.fromisoformat(state.get('current_date', '2000-01-01T00:00:00')).date()
                if saved_date != self.current_date:
                    self.daily_retrain_count = 0
                
                logger.info(f"스케줄러 상태 로드: 마지막 재학습 {self.last_retrain_time}, 오늘 재학습 {self.daily_retrain_count}회")
        except Exception as e:
            logger.warning(f"스케줄러 상태 로드 실패: {e}")
    
    def save_state(self):
        """스케줄러 상태 저장"""
        try:
            state = {
                'last_retrain_time': self.last_retrain_time.isoformat() if self.last_retrain_time else None,
                'daily_retrain_count': self.daily_retrain_count,
                'current_date': datetime.now().isoformat()
            }
            
            with open(self.state_file, 'w', encoding='utf-8') as f:
                json.dump(state, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"스케줄러 상태 저장 실패: {e}")
    
    def check_and_trigger_retrain(self):
        """피드백 상태를 확인하고 필요시 재학습 트리거"""
        try:
            logger.info("재학습 필요성 체크 시작")
            
            # 날짜 체크 및 카운트 리셋
            today = datetime.now().date()
            if today != self.current_date:
                self.current_date = today
                self.daily_retrain_count = 0
                logger.info("새로운 날짜 - 일일 재학습 카운트 리셋")
            
            # 일일 한도 체크
            if self.daily_retrain_count >= self.config['max_daily_retrains']:
                logger.info(f"일일 재학습 한도 달성 ({self.daily_retrain_count}/{self.config['max_daily_retrains']})")
                return False
            
            # 피드백 데이터 조회
            feedback_data = self.retrain_service.fetch_feedback_data()
            if not feedback_data:
                logger.info("피드백 데이터가 없습니다")
                return False
            
            total_feedback = feedback_data.get('totalCount', 0)
            min_required = self.config['min_feedback_count']
            
            logger.info(f"피드백 현황: {total_feedback}개 (최소 필요: {min_required}개)")
            
            if total_feedback < min_required:
                logger.info(f"피드백 부족 - 재학습 대기 중")
                return False
            
            # 재학습 실행
            logger.info("재학습 조건 충족 - 재학습 시작")
            return self.execute_retrain()
            
        except Exception as e:
            logger.error(f"재학습 체크 중 오류: {e}")
            return False
    
    def execute_retrain(self) -> bool:
        """재학습 실행"""
        try:
            logger.info("🚀 자동 재학습 실행 시작")
            
            # 콜백: 재학습 시작
            if self.on_retrain_start:
                self.on_retrain_start()
            
            # 재학습 실행
            result = self.retrain_service.run_retrain_cycle(
                min_feedback_count=self.config['min_feedback_count']
            )
            
            if result['success']:
                logger.info("✅ 재학습 성공")
                
                # 상태 업데이트
                self.last_retrain_time = datetime.now()
                self.daily_retrain_count += 1
                self.save_state()
                
                # 성능 평가 및 자동 활성화 체크
                if self.config['enable_auto_activation']:
                    self.check_auto_activation()
                
                # 성능 모니터링
                if self.config['enable_performance_monitoring']:
                    self.monitor_performance()
                
                # 콜백: 재학습 완료
                if self.on_retrain_complete:
                    self.on_retrain_complete(result)
                
                return True
            else:
                logger.error(f"❌ 재학습 실패: {result['message']}")
                
                # 콜백: 재학습 실패
                if self.on_retrain_failed:
                    self.on_retrain_failed(result)
                
                return False
                
        except Exception as e:
            logger.error(f"재학습 실행 중 오류: {e}")
            if self.on_retrain_failed:
                self.on_retrain_failed({'message': str(e)})
            return False
    
    def check_auto_activation(self):
        """새로운 모델의 성능을 평가하고 자동 활성화 여부 결정"""
        try:
            logger.info("새 모델 성능 평가 및 자동 활성화 체크")
            
            # 현재 모델 성능 평가
            current_metrics = self.performance_tracker.evaluate_current_model()
            if not current_metrics:
                logger.warning("현재 모델 성능 평가 실패")
                return
            
            current_accuracy = current_metrics.get('accuracy', 0)
            threshold = self.config['auto_activation_threshold']
            
            logger.info(f"새 모델 정확도: {current_accuracy:.4f}, 자동 활성화 임계값: {threshold}")
            
            if current_accuracy >= threshold:
                # 모델 버전 비교를 통해 활성화할지 결정
                comparison = self.retrain_service.get_model_version_comparison()
                if comparison:
                    logger.info("새 모델이 임계값을 넘어 자동 활성화 고려 중...")
                    # 실제 자동 활성화는 신중하게 결정 (여기서는 로그만)
                    logger.info("⚠️ 새 모델 성능이 우수하나, 수동 검토 후 활성화를 권장합니다")
                else:
                    logger.info("✅ 새 모델 성능이 우수합니다")
            else:
                logger.info("새 모델 성능이 자동 활성화 기준에 미달")
                
        except Exception as e:
            logger.error(f"자동 활성화 체크 중 오류: {e}")
    
    def monitor_performance(self):
        """성능 모니터링 및 리포트 생성"""
        try:
            logger.info("성능 모니터링 실행")
            
            # 성능 리포트 생성
            report = self.performance_tracker.generate_performance_report()
            if report:
                logger.info("📊 성능 리포트:")
                for line in report.split('\n')[:10]:  # 처음 10줄만 로그에 출력
                    logger.info(line)
            
            # 모델 버전 비교
            comparison = self.retrain_service.get_model_version_comparison()
            if comparison:
                logger.info("📈 모델 버전 비교 완료")
            
        except Exception as e:
            logger.error(f"성능 모니터링 중 오류: {e}")
    
    def start_scheduler(self):
        """스케줄러 시작"""
        if self.is_running:
            logger.warning("스케줄러가 이미 실행 중입니다")
            return
        
        logger.info(f"재학습 스케줄러 시작 - {self.config['check_interval_minutes']}분 간격으로 체크")
        
        # 스케줄 설정
        schedule.clear()  # 기존 스케줄 클리어
        schedule.every(self.config['check_interval_minutes']).minutes.do(self.check_and_trigger_retrain)
        
        self.is_running = True
        
        # 별도 스레드에서 스케줄러 실행
        self.scheduler_thread = threading.Thread(target=self._run_scheduler, daemon=True)
        self.scheduler_thread.start()
        
        logger.info("✅ 재학습 스케줄러가 시작되었습니다")
    
    def _run_scheduler(self):
        """스케줄러 실행 루프"""
        while self.is_running:
            try:
                schedule.run_pending()
                time.sleep(1)
            except Exception as e:
                logger.error(f"스케줄러 실행 중 오류: {e}")
                time.sleep(10)  # 오류 발생 시 10초 대기
    
    def stop_scheduler(self):
        """스케줄러 중지"""
        if not self.is_running:
            logger.warning("스케줄러가 실행 중이 아닙니다")
            return
        
        logger.info("재학습 스케줄러 중지 중...")
        self.is_running = False
        
        if self.scheduler_thread and self.scheduler_thread.is_alive():
            self.scheduler_thread.join(timeout=5)
        
        schedule.clear()
        self.save_state()
        
        logger.info("✅ 재학습 스케줄러가 중지되었습니다")
    
    def manual_trigger(self) -> bool:
        """수동 재학습 트리거"""
        logger.info("🔧 수동 재학습 트리거")
        return self.execute_retrain()
    
    def get_status(self) -> Dict:
        """스케줄러 상태 조회"""
        return {
            'is_running': self.is_running,
            'config': self.config,
            'last_retrain_time': self.last_retrain_time.isoformat() if self.last_retrain_time else None,
            'daily_retrain_count': self.daily_retrain_count,
            'current_date': self.current_date.isoformat(),
            'next_check_time': self._get_next_check_time()
        }
    
    def _get_next_check_time(self) -> Optional[str]:
        """다음 체크 시간 계산"""
        if not self.is_running:
            return None
        
        jobs = schedule.get_jobs()
        if jobs:
            next_run = jobs[0].next_run
            return next_run.isoformat() if next_run else None
        return None
    
    def update_config(self, new_config: Dict):
        """설정 업데이트"""
        old_interval = self.config['check_interval_minutes']
        self.config.update(new_config)
        
        logger.info(f"스케줄러 설정 업데이트: {new_config}")
        
        # 체크 간격이 변경되었으면 스케줄 재설정
        if self.is_running and old_interval != self.config['check_interval_minutes']:
            logger.info("체크 간격 변경으로 스케줄 재설정")
            schedule.clear()
            schedule.every(self.config['check_interval_minutes']).minutes.do(self.check_and_trigger_retrain)


# 전역 스케줄러 인스턴스
_scheduler = None

def get_scheduler(backend_url: str = None, config: Dict = None) -> RetrainingScheduler:
    """재학습 스케줄러 싱글톤 인스턴스 반환"""
    global _scheduler
    if _scheduler is None:
        _scheduler = RetrainingScheduler(backend_url, config)
    return _scheduler


if __name__ == "__main__":
    # 테스트 실행
    def on_retrain_start():
        print("🚀 재학습 시작!")
    
    def on_retrain_complete(result):
        print(f"✅ 재학습 완료: {result['message']}")
    
    def on_retrain_failed(result):
        print(f"❌ 재학습 실패: {result['message']}")
    
    # 스케줄러 설정
    config = {
        'min_feedback_count': 1,  # 테스트용 낮은 값
        'check_interval_minutes': 1,  # 테스트용 1분 간격
        'max_daily_retrains': 5
    }
    
    scheduler = get_scheduler(config=config)
    
    # 콜백 설정
    scheduler.on_retrain_start = on_retrain_start
    scheduler.on_retrain_complete = on_retrain_complete
    scheduler.on_retrain_failed = on_retrain_failed
    
    # 스케줄러 시작
    scheduler.start_scheduler()
    
    try:
        print("재학습 스케줄러 테스트 시작 - Ctrl+C로 종료")
        print(f"현재 상태: {json.dumps(scheduler.get_status(), indent=2, ensure_ascii=False)}")
        
        # 메인 스레드에서 대기
        while True:
            time.sleep(10)
            status = scheduler.get_status()
            print(f"[{datetime.now().strftime('%H:%M:%S')}] 일일 재학습: {status['daily_retrain_count']}회")
    except KeyboardInterrupt:
        print("\n스케줄러 종료 중...")
        scheduler.stop_scheduler()
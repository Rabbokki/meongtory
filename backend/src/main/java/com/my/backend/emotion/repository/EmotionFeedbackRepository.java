package com.my.backend.emotion.repository;

import com.my.backend.emotion.entity.EmotionFeedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmotionFeedbackRepository extends JpaRepository<EmotionFeedback, Long> {
    
    // 아직 학습에 사용되지 않은 피드백들 조회
    List<EmotionFeedback> findByIsUsedForTrainingFalse();
    
    // 정확한 예측/부정확한 예측별 조회
    List<EmotionFeedback> findByIsCorrectPrediction(Boolean isCorrect);
    
    // 아직 학습에 사용되지 않은 부정 피드백 개수 (잘못 예측한 경우)
    @Query("SELECT COUNT(ef) FROM EmotionFeedback ef WHERE ef.isUsedForTraining = false AND ef.isCorrectPrediction = false")
    Long countUnusedNegativeFeedback();
    
    // 아직 학습에 사용되지 않은 긍정 피드백 개수 (올바르게 예측한 경우)
    @Query("SELECT COUNT(ef) FROM EmotionFeedback ef WHERE ef.isUsedForTraining = false AND ef.isCorrectPrediction = true")
    Long countUnusedPositiveFeedback();
    
    // 특정 기간 동안의 피드백 조회
    List<EmotionFeedback> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // 예측된 감정별 피드백 조회
    List<EmotionFeedback> findByPredictedEmotion(String predictedEmotion);
    
    // === 대시보드용 통계 쿼리 (주석처리) ===
    // 전체 정확도 계산을 위한 쿼리
    // @Query("SELECT COUNT(ef) FROM EmotionFeedback ef WHERE ef.isCorrectPrediction = true")
    // Long countCorrectPredictions();
    // 
    // @Query("SELECT COUNT(ef) FROM EmotionFeedback ef")
    // Long countTotalFeedback();
}
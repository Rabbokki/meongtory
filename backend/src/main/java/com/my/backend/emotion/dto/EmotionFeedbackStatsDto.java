package com.my.backend.emotion.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmotionFeedbackStatsDto {
    
    // === 재학습에 필요한 핵심 정보 ===
    private Long unusedPositiveFeedback; // 미사용 긍정 피드백 수
    
    private Long unusedNegativeFeedback; // 미사용 부정 피드백 수
    
    private Boolean shouldRetrain; // 재학습이 필요한지 여부
    
    // === 대시보드용 통계 ===
    private Long totalFeedback; // 전체 피드백 수
    private Long correctPredictions; // 정확한 예측 수
    private Long incorrectPredictions; // 부정확한 예측 수
    private Double overallAccuracy; // 전체 정확도 (%)
}
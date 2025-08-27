package com.my.backend.emotion.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmotionFeedbackRequestDto {
    
    private String imageUrl;
    
    private String predictedEmotion;
    
    private String correctEmotion; // 부정 피드백 시에만 필요 (사용자가 선택한 올바른 감정)
    
    private Boolean isCorrectPrediction; // true: 예, false: 아니오
    
    private Float predictionConfidence; // 모델의 원래 신뢰도 (0.0~1.0)
}
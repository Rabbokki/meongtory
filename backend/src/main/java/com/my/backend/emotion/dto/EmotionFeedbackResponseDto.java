package com.my.backend.emotion.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmotionFeedbackResponseDto {
    
    private Long id;
    
    private String imageUrl;
    
    private String predictedEmotion;
    
    private String correctEmotion;
    
    private Boolean isCorrectPrediction;
    
    private Float predictionConfidence;
    
    private Boolean isUsedForTraining;
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;
}
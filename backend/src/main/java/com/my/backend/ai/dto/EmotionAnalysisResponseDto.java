package com.my.backend.ai.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EmotionAnalysisResponseDto {
    private String emotion;
    private String emotionKorean;
    private Double confidence;
}
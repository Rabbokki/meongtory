package com.my.backend.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmotionAnalysisResponseDto {
    private String emotion;
    private String emotionKorean;
    private Double confidence;
}
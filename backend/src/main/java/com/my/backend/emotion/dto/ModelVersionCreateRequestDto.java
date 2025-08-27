package com.my.backend.emotion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModelVersionCreateRequestDto {
    
    @NotBlank(message = "모델 버전은 필수입니다")
    private String version;
    
    @NotBlank(message = "모델 파일 경로는 필수입니다")
    private String modelPath;
    
    private String description;
    
    @NotNull(message = "피드백 샘플 수는 필수입니다")
    @Positive(message = "피드백 샘플 수는 양수여야 합니다")
    private Integer feedbackSampleCount;
    
    @DecimalMin(value = "0.0", message = "학습률은 0 이상이어야 합니다")
    @DecimalMax(value = "1.0", message = "학습률은 1 이하여야 합니다")
    private Double learningRate;
    
    @Positive(message = "에포크 수는 양수여야 합니다")
    private Integer numEpochs;
    
    @DecimalMin(value = "0.0", message = "정확도는 0 이상이어야 합니다")
    @DecimalMax(value = "1.0", message = "정확도는 1 이하여야 합니다")
    private Double finalAccuracy;
    
    @DecimalMin(value = "0.0", message = "손실값은 0 이상이어야 합니다")
    private Double finalLoss;
    
    @DecimalMin(value = "0.0", message = "검증 정확도는 0 이상이어야 합니다")
    @DecimalMax(value = "1.0", message = "검증 정확도는 1 이하여야 합니다")
    private Double validationAccuracy;
    
    @DecimalMin(value = "0.0", message = "F1 스코어는 0 이상이어야 합니다")
    @DecimalMax(value = "1.0", message = "F1 스코어는 1 이하여야 합니다")
    private Double f1Score;
    
    private String performanceMetrics;
    
    private String trainingHistory;
}
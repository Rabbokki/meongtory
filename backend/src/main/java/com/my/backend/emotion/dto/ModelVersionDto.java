package com.my.backend.emotion.dto;

import com.my.backend.emotion.entity.EmotionModelVersion;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelVersionDto {
    private Long id;
    private String version;
    private String description;
    private Integer feedbackSampleCount;
    private Double learningRate;
    private Integer numEpochs;
    private Double finalAccuracy;
    private Double finalLoss;
    private Double validationAccuracy;
    private Double f1Score;
    private Boolean isActive;
    private String status;
    private String statusKorean;
    private LocalDateTime trainedAt;
    private LocalDateTime createdAt;
    private String errorMessage;

    public static ModelVersionDto fromEntity(EmotionModelVersion entity) {
        return ModelVersionDto.builder()
                .id(entity.getId())
                .version(entity.getVersion())
                .description(entity.getDescription())
                .feedbackSampleCount(entity.getFeedbackSampleCount())
                .learningRate(entity.getLearningRate())
                .numEpochs(entity.getNumEpochs())
                .finalAccuracy(entity.getFinalAccuracy())
                .finalLoss(entity.getFinalLoss())
                .validationAccuracy(entity.getValidationAccuracy())
                .f1Score(entity.getF1Score())
                .isActive(entity.getIsActive())
                .status(entity.getStatus().name())
                .statusKorean(entity.getStatus().getKorean())
                .trainedAt(entity.getTrainedAt())
                .createdAt(entity.getCreatedAt())
                .errorMessage(entity.getErrorMessage())
                .build();
    }
}
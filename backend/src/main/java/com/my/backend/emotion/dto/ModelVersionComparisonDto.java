package com.my.backend.emotion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

// 모델 비교 dto
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModelVersionComparisonDto {
    
    private ModelVersionDto currentModel;
    private List<ModelVersionDto> availableVersions;
    private PerformanceComparisonDto performanceComparison;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerformanceComparisonDto {
        private Double bestValidationAccuracy;
        private Double currentValidationAccuracy;
        private Double averageValidationAccuracy;
        private Integer totalVersions;
        private Integer betterPerformingVersions;
        private String recommendation;
    }
}
package com.my.backend.emotion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModelRollbackRequestDto {
    
    @NotNull(message = "롤백할 모델 버전 ID는 필수입니다")
    private Long versionId;
    
    private String reason;
}
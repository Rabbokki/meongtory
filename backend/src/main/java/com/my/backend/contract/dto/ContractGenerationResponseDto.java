package com.my.backend.contract.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractGenerationResponseDto {
    
    private Long id;
    private String contractName; 
    private String content;
    private String petInfo;
    private String userInfo;
    private String pdfUrl;
    private String wordUrl;
    private LocalDateTime generatedAt;
} 
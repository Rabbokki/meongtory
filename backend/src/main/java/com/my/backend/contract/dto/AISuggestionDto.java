package com.my.backend.contract.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AISuggestionDto {
    
    private Long id;
    private String suggestion;
    private String type;
    private Double confidence;
} 
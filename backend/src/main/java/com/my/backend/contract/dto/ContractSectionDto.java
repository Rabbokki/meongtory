package com.my.backend.contract.dto;

import com.my.backend.contract.entity.ContractSection;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractSectionDto {
    
    private Long id;
    private String title;
    private String content;
    private Boolean isRequired;
    private Integer order;
    private List<String> options;
    
    public static ContractSectionDto fromEntity(ContractSection section) {
        return ContractSectionDto.builder()
                .id(section.getId())
                .title(section.getTitle())
                .content(section.getContent())
                .isRequired(section.getIsRequired())
                .order(section.getOrderNum())
                .options(section.getOptions() != null ? List.of(section.getOptions().split(",")) : null)
                .build();
    }
} 
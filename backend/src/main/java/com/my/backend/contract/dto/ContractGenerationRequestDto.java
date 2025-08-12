package com.my.backend.contract.dto;

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
public class ContractGenerationRequestDto {
    
    private Long templateId;
    private List<ContractSectionDto> customSections;
    private List<Long> removedSections;
    private PetInfoDto petInfo;
    private UserInfoDto userInfo;
    private String additionalInfo;
    private String content; // AI가 생성한 계약서 내용
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PetInfoDto {
        private String name;
        private String breed;
        private String age;
        private String healthStatus;
    }
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserInfoDto {
        private String name;
        private String phone;
        private String email;
    }
} 
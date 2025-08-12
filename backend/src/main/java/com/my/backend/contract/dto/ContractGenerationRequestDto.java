package com.my.backend.contract.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractGenerationRequestDto {
    
    private Long templateId;
    private List<Map<String, Object>> customSections; // 프론트엔드에서 보내는 형식에 맞춤
    private List<Long> removedSections;
    private PetInfoDto petInfo;
    private UserInfoDto userInfo;
    private String additionalInfo;
    private String content; // AI가 생성한 계약서 내용
    private ShelterInfoDto shelterInfo; // 추가된 필드
    
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
    
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShelterInfoDto {
        private String name;
        private String representative;
        private String address;
        private String phone;
    }
} 
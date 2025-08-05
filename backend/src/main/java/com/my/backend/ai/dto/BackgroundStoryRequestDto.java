package com.my.backend.ai.dto;

import lombok.Data;

@Data
public class BackgroundStoryRequestDto {
    private String petName;
    private String breed;
    private String age;
    private String gender;
    private String personality;
    private String userPrompt; // 사용자가 추가로 입력한 프롬프트
} 
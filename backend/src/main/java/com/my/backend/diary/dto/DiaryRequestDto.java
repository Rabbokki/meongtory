package com.my.backend.diary.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DiaryRequestDto {
    private Long userId;
    private Long petId; // MyPet의 ID 추가
    private String title;
    private String text;
    private String audioUrl;
    private String imageUrl;
    private Long petId;
}

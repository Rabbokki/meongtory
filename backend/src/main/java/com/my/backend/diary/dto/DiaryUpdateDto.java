package com.my.backend.diary.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DiaryUpdateDto {
    private String text;
    private String audioUrl;
    private String imageUrl;
}

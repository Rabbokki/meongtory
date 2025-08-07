package com.my.backend.diary.dto;

import com.my.backend.diary.entity.Diary;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Getter
@Setter
@Builder
public class DiaryResponseDto {
    private Long diaryId;
    private Long userId;
    private String title;
    private String text;
    private String audioUrl;
    private String imageUrl;
    private String createdAt;
    private String updatedAt;

    public static DiaryResponseDto from(Diary diary) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        
        return DiaryResponseDto.builder()
                .diaryId(diary.getDiaryId())
                .userId(diary.getUserId())
                .title(diary.getTitle())
                .text(diary.getText())
                .audioUrl(diary.getAudioUrl())
                .imageUrl(diary.getImageUrl())
                .createdAt(diary.getCreatedAt().format(formatter))
                .updatedAt(diary.getUpdatedAt().format(formatter))
                .build();
    }
}

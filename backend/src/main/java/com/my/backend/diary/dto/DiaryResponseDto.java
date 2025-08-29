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
    private String[] categories;
    private Long petId;
    private String createdAt;
    private String updatedAt;

    public static DiaryResponseDto from(Diary diary) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        
        // getUser()가 null일 수 있는 경우 처리
        Long userId = null;
        if (diary.getUser() != null) {
            userId = diary.getUser().getId();
        }
        
        return DiaryResponseDto.builder()
                .diaryId(diary.getDiaryId())
                .userId(userId)
                .title(diary.getTitle())
                .text(diary.getText())
                .audioUrl(diary.getAudioUrl())
                .imageUrl(diary.getImageUrl())
                .categories(diary.getCategories())
                .petId(diary.getPetId())
                .createdAt(diary.getCreatedAt() != null ? diary.getCreatedAt().format(formatter) : null)
                .updatedAt(diary.getUpdatedAt() != null ? diary.getUpdatedAt().format(formatter) : null)
                .build();
    }
}

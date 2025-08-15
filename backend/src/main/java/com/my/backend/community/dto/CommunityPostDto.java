package com.my.backend.community.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityPostDto {
    private Long id;
    private String title;
    private String content;
    private String author;
    private String category;
    private String boardType;
    private int views;
    private int likes;
    private int comments;
    private List<String> tags;
    private List<String> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

package com.my.backend.store.dto;

import lombok.Data;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@Builder
public class SearchResponseDto {
    private Long id;
    private String productId;
    private String title;
    private String description;
    private Long price;
    private String imageUrl;
    private String mallName;
    private String productUrl;
    private String brand;
    private String maker;
    private String category1;
    private String category2;
    private String category3;
    private String category4;
    private Integer reviewCount;
    private Double rating;
    private Integer searchCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long relatedProductId;
    private Double similarity; // 유사도 점수
}

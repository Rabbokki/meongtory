package com.my.backend.store.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NaverShoppingItemDto {
    private String title;
    private String link;
    private String image;
    private String lprice;
    private String hprice;
    private String mallName;
    private String productId;
    private String productType;
    private String brand;
    private String maker;
    private String category1;
    private String category2;
    private String category3;
    private String category4;
    private String reviewCount;
    private String rating;
    private String searchCount;
}

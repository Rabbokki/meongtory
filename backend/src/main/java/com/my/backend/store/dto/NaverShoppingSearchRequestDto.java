package com.my.backend.store.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NaverShoppingSearchRequestDto {
    private String query;
    @Builder.Default
    private Integer display = 20;
    @Builder.Default
    private Integer start = 1;
    @Builder.Default
    private String sort = "sim"; // sim: 정확도순, date: 날짜순, asc: 가격오름차순, dsc: 가격내림차순
    private String filter; // 사용하지 않음
}

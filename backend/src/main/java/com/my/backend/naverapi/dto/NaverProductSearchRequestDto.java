package com.my.backend.naverapi.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NaverProductSearchRequestDto {
    private String query;
    private int display = 10;
    private int start = 1;
    private String sort = "sim"; // sim: 정확도순, date: 날짜순, asc: 가격오름차순, dsc: 가격내림차순
}




package com.my.backend.naverapi.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class NaverProductSearchResponseDto {
    private List<NaverProductDto> items;
    private int total;
    private int start;
    private int display;
    private String lastBuildDate;
}




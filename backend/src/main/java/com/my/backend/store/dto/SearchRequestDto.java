package com.my.backend.store.dto;

import lombok.Data;

@Data
public class SearchRequestDto {
    private String query;
    private Integer limit = 10; // 기본값 10개
}

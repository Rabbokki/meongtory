package com.my.backend.naverapi.dto;



import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NaverProductDto {
    private String title;
    private String link;
    private String image;
    private int lprice;
    private int hprice;
    private String mallName;
}

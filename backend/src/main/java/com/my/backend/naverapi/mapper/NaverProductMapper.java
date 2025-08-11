package com.my.backend.naverapi.mapper;


import com.my.backend.naverapi.dto.NaverProductDto;
import com.my.backend.naverapi.entity.NaverProduct;

public class NaverProductMapper {

    public static NaverProduct toEntity(NaverProductDto dto) {
        return NaverProduct.builder()
                .title(dto.getTitle())
                .link(dto.getLink())
                .image(dto.getImage())
                .lprice(dto.getLprice())
                .hprice(dto.getHprice())
                .mallName(dto.getMallName())
                .build();
    }
}

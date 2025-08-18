package com.my.backend.store.dto;

import com.my.backend.store.dto.ProductDto;
import com.my.backend.store.entity.Cart;
import com.my.backend.store.dto.NaverProductDto;
import lombok.*;

/**
 * 장바구니 응답용 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartDto {
    private Long id;         // 장바구니 항목 ID
    private Long accountId;            // 사용자 ID
    private ProductDto product;     // 상품 정보 (기존 상품)
    private NaverProductDto naverProduct; // 네이버 상품 정보
    private int quantity;       // 담긴 수량

    public CartDto(Cart cart) {

    }
}
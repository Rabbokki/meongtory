package com.my.backend.store.dto;

import com.my.backend.store.dto.ProductDto;
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
    private Integer cartId;         // 장바구니 항목 ID
    private Integer userId;         // 사용자 ID
    private ProductDto product;     // 상품 정보
    private Integer quantity;       // 담긴 수량
}

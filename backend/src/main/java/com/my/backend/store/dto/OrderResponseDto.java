package com.my.backend.store.dto;

import com.my.backend.store.entity.OrderStatus;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponseDto {

    private Long id;
    private String merchantOrderId;
    private Long amount;
    private OrderStatus status;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime paidAt;

    // 추가 필드
    private Long accountId; // 주문자 ID
    private Long productId; // 상품 ID
    private String productName; // 상품명
    private String imageUrl; // 상품 이미지 URL
    private int quantity;
    private boolean isNaverProduct; // 네이버 상품 여부
}

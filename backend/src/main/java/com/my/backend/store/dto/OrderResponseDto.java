package com.my.backend.store.dto;

import com.my.backend.store.entity.OrderStatus;
import lombok.*;

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
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;

    // 추가 필드
    private Long accountId; // 주문자 ID
    private Long productId; // 상품 ID
    private String productName; // 상품명
    private int quantity;
}

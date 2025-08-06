package com.my.backend.store.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDto {
    private Long userId;
    private Integer totalPrice;
    private LocalDateTime orderedAt;  // 주문 날짜 추가
    private List<OrderItemDto> orderItems;
}
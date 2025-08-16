package com.my.backend.store.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequestDto {

    @NotNull(message = "accountId는 필수입니다.")
    private Long accountId; // 주문자 계정 ID

    @NotNull(message = "productId는 필수입니다.")
    private Long productId; // 주문할 상품 ID

    @Min(value = 1, message = "수량은 최소 1개 이상이어야 합니다.")
    private int quantity; // 주문 수량
}

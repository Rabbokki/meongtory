package com.my.backend.store.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartOrderRequestDto {
    @NotNull(message = "accountId는 필수입니다.")
    private Long accountId; // 주문할 사용자 ID
}

package com.my.backend.store.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NaverProductOrderRequest {
    private Long accountId;
    private Long naverProductId;
    private int quantity;
}

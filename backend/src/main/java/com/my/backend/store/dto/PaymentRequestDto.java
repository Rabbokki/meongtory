package com.my.backend.store.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentRequestDto {
    private String impUid;       // 포트원 결제 고유 ID
    private String merchantUid;  // 주문 번호
}

package com.my.backend.store.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class PaymentResponseDto {
    private String impUid;
    private String merchantUid;
    private int amount;
    private String status;
    private String payMethod;
    private LocalDateTime paidAt;
}

package com.my.backend.store.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortonePaymentRequestDto {
    private Integer orderId;
    private Integer amount;
    private String paymentMethod;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String merchantUid;
    private String pgProvider;
    private String itemName;
    private String buyerName;
    private String buyerEmail;
    private String buyerTel;
    private String buyerAddr;
    private String buyerPostcode;
} 
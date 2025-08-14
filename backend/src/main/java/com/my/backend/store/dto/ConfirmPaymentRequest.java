package com.my.backend.store.dto;

import lombok.Builder;

@Builder
public record ConfirmPaymentRequest(
        String orderId,
        String amount,
        String paymentKey
) {}
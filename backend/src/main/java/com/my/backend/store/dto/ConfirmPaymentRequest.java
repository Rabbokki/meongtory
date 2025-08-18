package com.my.backend.store.dto;

public record ConfirmPaymentRequest(
    String paymentKey,
    String orderId,
    Long amount
) {}
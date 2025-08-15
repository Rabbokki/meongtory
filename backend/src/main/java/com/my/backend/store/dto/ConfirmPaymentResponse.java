// ConfirmPaymentResponse.java
package com.my.backend.store.dto;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record ConfirmPaymentResponse(
    String paymentKey,
    String orderId,
    String status,
    String method,
    LocalDateTime requestedAt,
    LocalDateTime approvedAt,
    Long totalAmount,
    String receiptUrl,
    String checkoutUrl
) {}

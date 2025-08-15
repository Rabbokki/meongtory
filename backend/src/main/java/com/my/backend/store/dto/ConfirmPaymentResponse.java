// ConfirmPaymentResponse.java
package com.my.backend.store.dto;

import lombok.Builder;

@Builder
public record ConfirmPaymentResponse(
        String paymentKey,
        String orderId,
        String status,
        String method,
        String requestedAt,
        String approvedAt,
        Long totalAmount
) {}

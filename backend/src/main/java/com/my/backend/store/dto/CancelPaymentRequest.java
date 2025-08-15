// CancelPaymentRequest.java
package com.my.backend.store.dto;

public record CancelPaymentRequest(
    String paymentKey,
    String cancelReason,
    Long cancelAmount
) {}

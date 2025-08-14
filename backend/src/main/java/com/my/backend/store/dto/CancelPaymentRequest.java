// CancelPaymentRequest.java
package com.my.backend.store.dto;

import lombok.Builder;

@Builder
public record CancelPaymentRequest(
        String paymentKey,
        String cancelReason
) {}

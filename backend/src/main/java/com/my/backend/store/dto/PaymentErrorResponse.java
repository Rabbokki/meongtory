// PaymentErrorResponse.java
package com.my.backend.store.dto;

import lombok.Builder;

@Builder
public record PaymentErrorResponse(
        int code,
        String message
) {}

// PaymentErrorResponse.java
package com.my.backend.store.dto;

import lombok.Builder;

@Builder
public record PaymentErrorResponse(
    Integer code,
    String message,
    String errorCode
) {}

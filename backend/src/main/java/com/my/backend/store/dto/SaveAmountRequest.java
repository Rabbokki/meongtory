// SaveAmountRequest.java
package com.my.backend.store.dto;

public record SaveAmountRequest(
        String orderId,
        String amount
) {}

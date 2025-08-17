package com.my.backend.store.dto;

import lombok.Data;

import java.util.List;

@Data
public class PaymentOrderRequest {
    private String merchantOrderId;
    private Long amount;
    private Integer quantity;
    private List<PaymentOrderItem> items;
    
    @Data
    public static class PaymentOrderItem {
        private Long productId;
        private String name;
        private Long price;
        private Integer quantity;
        private String imageUrl;
    }
}

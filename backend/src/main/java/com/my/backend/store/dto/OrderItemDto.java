package com.my.backend.store.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDto {

    private Integer id;
    private Integer productId;
    private String productName;
    private String imageUrl;
    private Integer quantity;
    private Integer price;
}

package com.my.backend.store.dto;

import com.my.backend.store.entity.Category;
import com.my.backend.store.entity.TargetAnimal;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDto {
    private Integer productId;
    private String name;
    private String description;
    private Integer price;
    private Integer stock;
    private String imageUrl;
    private Category category;
    private TargetAnimal targetAnimal;
    private LocalDate registrationDate;
    private String registeredBy;
}
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
    private Long id;
    private String name;
    private String description;
    private Long price;
    private Long stock;
    private String imageUrl;
    private Category category;
    private TargetAnimal targetAnimal;
    private LocalDate registrationDate;
    private String registeredBy;
}
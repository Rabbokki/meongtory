package com.my.backend.store.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "product")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer productId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer price;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(nullable = true)
    private String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TargetAnimal targetAnimal;

    private LocalDate registrationDate;

    private String registeredBy;

    // 문자열을 Category enum으로 변환하는 setter
    public void setCategory(String categoryStr) {
        if (categoryStr != null) {
            try {
                this.category = Category.valueOf(categoryStr);
            } catch (IllegalArgumentException e) {
                // 기본값 설정
                this.category = Category.용품;
            }
        }
    }

    // 문자열을 TargetAnimal enum으로 변환하는 setter
    public void setTargetAnimal(String targetAnimalStr) {
        if (targetAnimalStr != null) {
            try {
                switch (targetAnimalStr.toLowerCase()) {
                    case "dog":
                        this.targetAnimal = TargetAnimal.DOG;
                        break;
                    case "cat":
                        this.targetAnimal = TargetAnimal.CAT;
                        break;
                    case "all":
                        this.targetAnimal = TargetAnimal.ALL;
                        break;
                    default:
                        this.targetAnimal = TargetAnimal.ALL;
                        break;
                }
            } catch (Exception e) {
                this.targetAnimal = TargetAnimal.ALL;
            }
        }
    }
}
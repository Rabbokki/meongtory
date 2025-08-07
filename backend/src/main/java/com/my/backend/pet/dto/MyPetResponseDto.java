package com.my.backend.pet.dto;

import com.my.backend.pet.entity.MyPet;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyPetResponseDto {

    private Long myPetId;
    private String name;
    private String breed;
    private Integer age;
    private MyPet.Gender gender;
    private String type;
    private Double weight;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
} 
package com.my.backend.pet.dto;

import com.my.backend.pet.entity.MyPet;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyPetRequestDto {

    private String name;
    private String breed;
    private Integer age;
    private MyPet.Gender gender;
    private String type; // 강아지, 고양이 등
    private Double weight;
    private String imageUrl;
} 
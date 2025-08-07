package com.my.backend.pet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyPetListResponseDto {
    private List<MyPetResponseDto> myPets;
    private Long totalCount;
} 
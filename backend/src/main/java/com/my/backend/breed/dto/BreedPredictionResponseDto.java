package com.my.backend.breed.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BreedPredictionResponseDto {
    private String breed;
    private Double confidence;
}
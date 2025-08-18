
package com.my.backend.breeding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BreedingResultDto {
    private String resultBreed;
    private int probability;
    private String[] traits;
    private String description;
    private String image;
}

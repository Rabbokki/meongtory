package com.my.backend.breed.controller;

import lombok.RequiredArgsConstructor;

import com.my.backend.breed.dto.BreedPredictionResponseDto;
import com.my.backend.breed.service.BreedService;
import com.my.backend.global.dto.ResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/breed")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BreedController {
    
    private final BreedService breedService;
    
    @PostMapping("/predict")
    public ResponseEntity<ResponseDto<BreedPredictionResponseDto>> predictBreed(
            @RequestParam("image") MultipartFile image) {
        try {
            BreedPredictionResponseDto result = breedService.predictBreed(image);
            return ResponseEntity.ok(ResponseDto.success(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ResponseDto.fail("AI_ERROR", "품종 분석 실패: " + e.getMessage()));
        }
    }
}
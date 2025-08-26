package com.my.backend.breeding.controller;

import com.my.backend.breeding.dto.BreedingResultDto;
import com.my.backend.breeding.service.BreedingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = {"*"})
@RequiredArgsConstructor
@Slf4j
public class BreedingController {

    private final BreedingService breedingService;

    @PostMapping(value = "/predict-breeding", consumes = "multipart/form-data")
    public ResponseEntity<BreedingResultDto> predictBreeding(
            @RequestParam("parent1") MultipartFile parent1,
            @RequestParam("parent2") MultipartFile parent2) {
        try {
            BreedingResultDto result = breedingService.predictBreeding(parent1, parent2);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("교배 예측 API 오류: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(new BreedingResultDto(
                    "예측 실패", 0, new String[]{"오류"}, "서버 오류: " + e.getMessage(), ""
            ));
        }
    }
}
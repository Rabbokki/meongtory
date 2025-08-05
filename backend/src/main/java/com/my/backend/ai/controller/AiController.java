package com.my.backend.ai.controller;

import lombok.RequiredArgsConstructor;
import com.my.backend.ai.dto.BreedPredictionResponseDto;
import com.my.backend.ai.service.AiService;
import com.my.backend.global.dto.ResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiController {
    
    private final AiService aiService;
    
    @PostMapping("/predict-breed")
    public ResponseEntity<ResponseDto<BreedPredictionResponseDto>> predictBreed(
            @RequestParam("image") MultipartFile image) {
        try {
            BreedPredictionResponseDto result = aiService.predictBreed(image);
            return ResponseEntity.ok(ResponseDto.success(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ResponseDto.fail("AI_ERROR", "품종 분석 실패: " + e.getMessage()));
        }
    }
}
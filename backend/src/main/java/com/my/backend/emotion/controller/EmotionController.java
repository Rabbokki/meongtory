package com.my.backend.emotion.controller;

import lombok.RequiredArgsConstructor;
import com.my.backend.emotion.dto.EmotionAnalysisResponseDto;
import com.my.backend.emotion.dto.EmotionFeedbackRequestDto;
import com.my.backend.emotion.dto.FeedbackForTrainingDto;
import com.my.backend.emotion.service.EmotionService;
import com.my.backend.global.dto.ResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/emotion")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmotionController {
    
    private final EmotionService emotionService;
    
    // === 감정 분석 API ===
    @PostMapping("/analyze")
    public ResponseEntity<ResponseDto<EmotionAnalysisResponseDto>> analyzeEmotion(
            @RequestParam("image") MultipartFile image) {
        try {
            EmotionAnalysisResponseDto result = emotionService.analyzeEmotion(image);
            return ResponseEntity.ok(ResponseDto.success(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ResponseDto.fail("EMOTION_ERROR", "감정 분석 실패: " + e.getMessage()));
        }
    }
    
    // === 피드백 관련 API ===
    
    // 1. 피드백 제출 (사용자용)
    @PostMapping("/feedback")
    public ResponseEntity<ResponseDto<String>> submitFeedback(
            @RequestBody EmotionFeedbackRequestDto feedbackRequest) {
        try {
            emotionService.saveFeedback(feedbackRequest);
            return ResponseEntity.ok(ResponseDto.success("피드백이 저장되었습니다"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ResponseDto.fail("FEEDBACK_ERROR", "피드백 저장 실패: " + e.getMessage()));
        }
    }
    
    // 2. 재학습용 피드백 데이터 제공 (AI 서비스용)
    @GetMapping("/feedback/training-data")
    public ResponseEntity<ResponseDto<FeedbackForTrainingDto>> getFeedbackForTraining() {
        try {
            FeedbackForTrainingDto result = emotionService.getFeedbackForTraining();
            return ResponseEntity.ok(ResponseDto.success(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ResponseDto.fail("TRAINING_DATA_ERROR", "학습 데이터 조회 실패: " + e.getMessage()));
        }
    }
    
    // 3. 피드백을 학습에 사용됨으로 표시 (AI 서비스용)
    @PostMapping("/feedback/mark-as-used")
    public ResponseEntity<ResponseDto<String>> markFeedbackAsUsed() {
        try {
            emotionService.markUnusedFeedbackAsUsed();
            return ResponseEntity.ok(ResponseDto.success("피드백을 학습에 사용됨으로 표시했습니다"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ResponseDto.fail("MARK_USED_ERROR", "피드백 사용 표시 실패: " + e.getMessage()));
        }
    }
}

package com.my.backend.emotion.service;

import com.my.backend.emotion.dto.EmotionAnalysisResponseDto;
import com.my.backend.emotion.dto.EmotionFeedbackRequestDto;
import com.my.backend.emotion.dto.FeedbackForTrainingDto;
import com.my.backend.emotion.entity.EmotionFeedback;
import com.my.backend.emotion.repository.EmotionFeedbackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmotionService {
    
    private final RestTemplate restTemplate;
    private final EmotionFeedbackRepository feedbackRepository;
    
    @Value("${ai.service.url}")
    private String aiServiceUrl;
    
    // === 감정 분석 기능 ===
    public EmotionAnalysisResponseDto analyzeEmotion(MultipartFile image) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("image", new ByteArrayResource(image.getBytes()) {
            @Override
            public String getFilename() {
                return image.getOriginalFilename();
            }
        });
        
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        
        ResponseEntity<EmotionAnalysisResponseDto> response = restTemplate.postForEntity(
            aiServiceUrl + "/api/ai/analyze-emotion",
            requestEntity,
            EmotionAnalysisResponseDto.class
        );
        
        return response.getBody();
    }
    
    // === 피드백 저장 기능 ===
    @Transactional
    public void saveFeedback(EmotionFeedbackRequestDto request) {
        // EmotionFeedback 엔티티 생성
        EmotionFeedback feedback = new EmotionFeedback();
        feedback.setImageUrl(request.getImageUrl());
        feedback.setPredictedEmotion(request.getPredictedEmotion());
        feedback.setCorrectEmotion(request.getCorrectEmotion());
        feedback.setIsCorrectPrediction(request.getIsCorrectPrediction());
        feedback.setPredictionConfidence(request.getPredictionConfidence());
        feedback.setIsUsedForTraining(false);
        
        feedbackRepository.save(feedback);
    }
    
    // === AI 서비스용: 재학습 데이터 제공 ===
    @Transactional(readOnly = true)
    public FeedbackForTrainingDto getFeedbackForTraining() {
        // 아직 학습에 사용되지 않은 피드백들 조회
        List<EmotionFeedback> unusedFeedbacks = feedbackRepository.findByIsUsedForTrainingFalse();
        
        // 긍정 피드백 (올바른 예측들)
        List<FeedbackForTrainingDto.TrainingDataItem> positiveFeedback = unusedFeedbacks.stream()
            .filter(EmotionFeedback::getIsCorrectPrediction)
            .map(feedback -> new FeedbackForTrainingDto.TrainingDataItem(
                feedback.getImageUrl(),
                feedback.getPredictedEmotion(), // 예측이 맞았으므로 예측값 사용
                feedback.getPredictionConfidence()
            ))
            .collect(Collectors.toList());
        
        // 부정 피드백 (틀린 예측들)
        List<FeedbackForTrainingDto.TrainingDataItem> negativeFeedback = unusedFeedbacks.stream()
            .filter(feedback -> !feedback.getIsCorrectPrediction())
            .map(feedback -> new FeedbackForTrainingDto.TrainingDataItem(
                feedback.getImageUrl(),
                feedback.getCorrectEmotion(), // 사용자가 수정한 올바른 라벨 사용
                feedback.getPredictionConfidence()
            ))
            .collect(Collectors.toList());
        
        return new FeedbackForTrainingDto(
            positiveFeedback,
            negativeFeedback,
            unusedFeedbacks.size()
        );
    }
    
    // === 피드백 사용 완료 표시 기능 ===
    @Transactional
    public void markUnusedFeedbackAsUsed() {
        // 아직 학습에 사용되지 않은 피드백들을 모두 사용됨으로 표시
        List<EmotionFeedback> unusedFeedbacks = feedbackRepository.findByIsUsedForTrainingFalse();
        
        for (EmotionFeedback feedback : unusedFeedbacks) {
            feedback.setIsUsedForTraining(true);
        }
        
        feedbackRepository.saveAll(unusedFeedbacks);
        
        // 로그 출력
        System.out.println("✅ " + unusedFeedbacks.size() + "개 피드백을 학습 사용 완료로 표시했습니다.");
    }
}

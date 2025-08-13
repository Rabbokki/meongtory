package com.my.backend.story.service;

import com.my.backend.story.dto.BackgroundStoryRequestDto;
import com.my.backend.story.dto.BackgroundStoryResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StoryService {
    
    private final RestTemplate restTemplate;
    
    @Value("${ai.service.url:http://localhost:9000}")
    private String aiServiceUrl;
    
    public BackgroundStoryResponseDto generateBackgroundStory(BackgroundStoryRequestDto request) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        // AI 서비스에 요청
        HttpEntity<BackgroundStoryRequestDto> requestEntity = new HttpEntity<>(request, headers);
        
        ResponseEntity<BackgroundStoryResponseDto> response = restTemplate.postForEntity(
            aiServiceUrl + "/generate-story",
            requestEntity,
            BackgroundStoryResponseDto.class
        );
        
        return response.getBody();
    }
    
    public BackgroundStoryResponseDto generateBackgroundStoryWithFallback(BackgroundStoryRequestDto request) {
        try {
            return generateBackgroundStory(request);
        } catch (Exception e) {
            // AI 서비스 호출 실패 시 기본 응답 반환
            BackgroundStoryResponseDto fallbackResponse = new BackgroundStoryResponseDto();
            fallbackResponse.setStory(generateDefaultStory(request));
            fallbackResponse.setStatus("success");
            fallbackResponse.setMessage("기본 배경 스토리가 생성되었습니다.");
            return fallbackResponse;
        }
    }
    
    private String generateDefaultStory(BackgroundStoryRequestDto request) {
        StringBuilder story = new StringBuilder();
        story.append(request.getPetName()).append("는 ");
        story.append(request.getBreed()).append(" 품종의 ");
        story.append(request.getAge()).append(" ");
        story.append(request.getGender()).append("입니다. ");
        
        if (request.getPersonality() != null && !request.getPersonality().trim().isEmpty()) {
            story.append("성격은 ").append(request.getPersonality()).append("하며, ");
        }
        
        story.append("새로운 가족을 기다리고 있습니다. ");
        story.append("따뜻한 마음으로 ").append(request.getPetName()).append("를 입양해주시면 ");
        story.append("충성스럽고 사랑스러운 반려동물이 될 것입니다.");
        
        return story.toString();
    }
} 
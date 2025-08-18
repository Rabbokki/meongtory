package com.my.backend.story.controller;

import com.my.backend.story.dto.BackgroundStoryRequestDto;
import com.my.backend.story.dto.BackgroundStoryResponseDto;
import com.my.backend.story.service.StoryService;
import com.my.backend.global.dto.ResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/story")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StoryController {
    
    private final StoryService storyService;
    
    @PostMapping("/generate-background-story")
    public ResponseEntity<ResponseDto<BackgroundStoryResponseDto>> generateBackgroundStory(
            @RequestBody BackgroundStoryRequestDto request) {
        try {
            BackgroundStoryResponseDto result = storyService.generateBackgroundStoryWithFallback(request);
            return ResponseEntity.ok(ResponseDto.success(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ResponseDto.fail("STORY_ERROR", "배경 스토리 생성 실패: " + e.getMessage()));
        }
    }
} 
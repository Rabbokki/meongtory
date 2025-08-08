package com.my.backend.diary.controller;

import com.my.backend.diary.dto.DiaryRequestDto;
import com.my.backend.diary.dto.DiaryResponseDto;
import com.my.backend.diary.dto.DiaryUpdateDto;
import com.my.backend.diary.service.DiaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/diary")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService diaryService;

    @PostMapping
    public ResponseEntity<DiaryResponseDto> createDiary(@RequestBody DiaryRequestDto dto) {
        System.out.println("🔍 Received DiaryRequestDto: title = " + dto.getTitle());
        return ResponseEntity.ok(diaryService.createDiary(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiaryResponseDto> getDiary(@PathVariable Long id) {
        return ResponseEntity.ok(diaryService.getDiary(id));
    }

    @GetMapping
    public ResponseEntity<List<DiaryResponseDto>> getDiaries(@RequestParam(required = false) Long userId) {
        if (userId != null) {
            return ResponseEntity.ok(diaryService.getUserDiaries(userId));
        } else {
            return ResponseEntity.ok(diaryService.getAllDiaries());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DiaryResponseDto>> getUserDiaries(@PathVariable Long userId) {
        return ResponseEntity.ok(diaryService.getUserDiaries(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiaryResponseDto> updateDiary(@PathVariable Long id, @RequestBody DiaryUpdateDto dto) {
        System.out.println("🔍 === Backend PUT Request Debug ===");
        System.out.println("🔍 Updating diary with ID: " + id);
        System.out.println("🔍 Update data: title = " + dto.getTitle() + ", text = " + dto.getText() + ", imageUrl = " + dto.getImageUrl() + ", audioUrl = " + dto.getAudioUrl());
        System.out.println("🔍 Request body: " + dto);
        
        try {
            DiaryResponseDto result = diaryService.updateDiary(id, dto);
            System.out.println("🔍 Update successful: " + result);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.out.println("🔍 Update failed with error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiary(@PathVariable Long id) {
        diaryService.deleteDiary(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/voice")
    public ResponseEntity<String> transcribeVoice(@RequestParam("audio") MultipartFile audioFile) {
        try {
            String transcribedText = diaryService.transcribeAudio(audioFile);
            return ResponseEntity.ok(transcribedText);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("음성 변환에 실패했습니다: " + e.getMessage());
        }
    }
}

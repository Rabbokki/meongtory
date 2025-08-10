package com.my.backend.diary.controller;

import com.my.backend.diary.dto.DiaryRequestDto;
import com.my.backend.diary.dto.DiaryResponseDto;
import com.my.backend.diary.dto.DiaryUpdateDto;
import com.my.backend.diary.service.DiaryService;
import com.my.backend.global.security.user.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/api/diary")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService diaryService;

    @PostMapping
    public ResponseEntity<DiaryResponseDto> createDiary(@RequestBody DiaryRequestDto dto) {
        return ResponseEntity.ok(diaryService.createDiary(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiaryResponseDto> getDiary(@PathVariable Long id) {
        return ResponseEntity.ok(diaryService.getDiary(id));
    }

    @GetMapping
    public ResponseEntity<List<DiaryResponseDto>> getDiaries() {
        // 현재 로그인한 사용자 정보 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getAccount().getId();
        String userRole = userDetails.getAccount().getRole();
        
        // 관리자인 경우 모든 일기 반환, 일반 사용자는 자신의 일기만 반환
        if ("ADMIN".equals(userRole)) {
            return ResponseEntity.ok(diaryService.getAllDiaries());
        } else {
            return ResponseEntity.ok(diaryService.getUserDiaries(userId));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DiaryResponseDto>> getUserDiaries(@PathVariable Long userId) {
        return ResponseEntity.ok(diaryService.getUserDiaries(userId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DiaryResponseDto> updateDiary(@PathVariable Long id, @RequestBody DiaryUpdateDto dto) {
        // 현재 로그인한 사용자 정보 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long currentUserId = userDetails.getAccount().getId();
        String userRole = userDetails.getAccount().getRole();
        
        System.out.println("🔍 === Backend PUT Request Debug ===");
        System.out.println("🔍 Updating diary with ID: " + id);
        System.out.println("🔍 Current user ID: " + currentUserId);
        System.out.println("🔍 Current user role: " + userRole);
        System.out.println("🔍 Update data: title = " + dto.getTitle() + ", text = " + dto.getText() + ", imageUrl = " + dto.getImageUrl() + ", audioUrl = " + dto.getAudioUrl());
        System.out.println("🔍 Request body: " + dto);
        
        try {
            DiaryResponseDto result = diaryService.updateDiary(id, dto, currentUserId, userRole);
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
        // 현재 로그인한 사용자 정보 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long currentUserId = userDetails.getAccount().getId();
        String userRole = userDetails.getAccount().getRole();
        
        diaryService.deleteDiary(id, currentUserId, userRole);
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

    @PostMapping("/audio")
    public ResponseEntity<String> uploadAudio(@RequestParam("file") MultipartFile audioFile) {
        try {
            String audioUrl = diaryService.uploadAudio(audioFile);
            return ResponseEntity.ok(audioUrl);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("오디오 업로드에 실패했습니다: " + e.getMessage());
        }
    }
}

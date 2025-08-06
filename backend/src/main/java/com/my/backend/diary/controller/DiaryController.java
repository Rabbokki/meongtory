package com.my.backend.diary.controller;

import com.my.backend.diary.dto.DiaryRequestDto;
import com.my.backend.diary.dto.DiaryResponseDto;
import com.my.backend.diary.dto.DiaryUpdateDto;
import com.my.backend.diary.service.DiaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
        return ResponseEntity.ok(diaryService.updateDiary(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDiary(@PathVariable Long id) {
        diaryService.deleteDiary(id);
        return ResponseEntity.noContent().build();
    }
}

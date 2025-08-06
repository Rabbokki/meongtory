package com.my.backend.diary.service;

import com.my.backend.diary.dto.DiaryRequestDto;
import com.my.backend.diary.dto.DiaryResponseDto;
import com.my.backend.diary.dto.DiaryUpdateDto;
import com.my.backend.diary.entity.Diary;
import com.my.backend.diary.repository.DiaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiaryService {

    private final DiaryRepository diaryRepository;

    public DiaryResponseDto createDiary(DiaryRequestDto dto) {
        Diary diary = new Diary();
        diary.setUserId(dto.getUserId());
        diary.setTitle(dto.getTitle());
        diary.setText(dto.getText());
        diary.setAudioUrl(dto.getAudioUrl());
        diary.setImageUrl(dto.getImageUrl());

        System.out.println("📝 Saving Diary Entity: title = " + diary.getTitle());

        return DiaryResponseDto.from(diaryRepository.save(diary));
    }

    public DiaryResponseDto getDiary(Long id) {
        Diary diary = diaryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Diary not found"));
        
        if (diary.getIsDeleted()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Diary not found");
        }
        
        return DiaryResponseDto.from(diary);
    }

    public List<DiaryResponseDto> getUserDiaries(Long userId) {
        return diaryRepository.findByUserIdAndIsDeletedFalse(userId).stream()
                .map(DiaryResponseDto::from)
                .collect(Collectors.toList());
    }

    public List<DiaryResponseDto> getAllDiaries() {
        return diaryRepository.findByIsDeletedFalse().stream()
                .map(DiaryResponseDto::from)
                .collect(Collectors.toList());
    }

    public DiaryResponseDto updateDiary(Long id, DiaryUpdateDto dto) {
        Diary diary = diaryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Diary not found"));
        
        if (diary.getIsDeleted()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Diary not found");
        }

        diary.setTitle(dto.getTitle());
        diary.setText(dto.getText());
        diary.setAudioUrl(dto.getAudioUrl());
        diary.setImageUrl(dto.getImageUrl());
        return DiaryResponseDto.from(diaryRepository.save(diary));
    }

    public void deleteDiary(Long id) {
        Diary diary = diaryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Diary not found"));
        
        if (diary.getIsDeleted()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Diary not found");
        }

        // Soft Delete: isDeleted를 true로 설정
        diary.setIsDeleted(true);
        diaryRepository.save(diary);
    }
}

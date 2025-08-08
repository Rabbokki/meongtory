package com.my.backend.diary.service;

import com.my.backend.diary.dto.DiaryRequestDto;
import com.my.backend.diary.dto.DiaryResponseDto;
import com.my.backend.diary.dto.DiaryUpdateDto;
import com.my.backend.diary.entity.Diary;
import com.my.backend.diary.repository.DiaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiaryService {

    private final DiaryRepository diaryRepository;
    private final RestTemplate restTemplate;
    
    @Value("${ai.service.url}")
    private String aiServiceUrl;

    public DiaryResponseDto createDiary(DiaryRequestDto dto) {
        Diary diary = new Diary();
        diary.setUserId(dto.getUserId());
        diary.setTitle(dto.getTitle());
        diary.setText(dto.getText());
        diary.setAudioUrl(dto.getAudioUrl());
        diary.setImageUrl(dto.getImageUrl());

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
        return diaryRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId).stream()
                .map(DiaryResponseDto::from)
                .collect(Collectors.toList());
    }

    public List<DiaryResponseDto> getAllDiaries() {
        return diaryRepository.findByIsDeletedFalseOrderByCreatedAtDesc().stream()
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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "다이어리를 찾을 수 없습니다."));
        
        if (diary.getIsDeleted()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "다이어리를 찾을 수 없습니다.");
        }

        diaryRepository.delete(diary);
    }

    public String transcribeAudio(MultipartFile audioFile) {
        try {
            // AI 서비스 URL 구성
            String transcribeUrl = aiServiceUrl + "/transcribe";
            
            // 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            // 파일 데이터 설정
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new org.springframework.core.io.ByteArrayResource(audioFile.getBytes()) {
                @Override
                public String getFilename() {
                    return audioFile.getOriginalFilename();
                }
            });
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            
            // AI 서비스 호출
            ResponseEntity<TranscribeResponse> response = restTemplate.postForEntity(
                transcribeUrl,
                requestEntity,
                TranscribeResponse.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String transcribedText = response.getBody().getTranscript();
                return transcribedText;
            } else {
                throw new RuntimeException("AI 서비스에서 음성 변환 실패");
            }
            
        } catch (Exception e) {
            throw new RuntimeException("음성 변환 중 오류 발생: " + e.getMessage());
        }
    }
    
    // 음성 변환 응답 DTO
    public static class TranscribeResponse {
        private String transcript;
        
        public String getTranscript() {
            return transcript;
        }
        
        public void setTranscript(String transcript) {
            this.transcript = transcript;
        }
    }
}

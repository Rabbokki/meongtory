package com.my.backend.diary.service;

import com.my.backend.account.entity.Account;
import com.my.backend.account.repository.AccountRepository;
import com.my.backend.diary.dto.DiaryRequestDto;
import com.my.backend.diary.dto.DiaryResponseDto;
import com.my.backend.diary.dto.DiaryUpdateDto;
import com.my.backend.diary.entity.Diary;
import com.my.backend.diary.repository.DiaryRepository;
import com.my.backend.s3.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class DiaryService {

    private final DiaryRepository diaryRepository;
    private final AccountRepository accountRepository;
    private final RestTemplate restTemplate;
    private final S3Service s3Service;
    
    @Value("${ai.service.url}")
    private String aiServiceUrl;

    public DiaryResponseDto createDiary(DiaryRequestDto dto) {
        Account user = accountRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        Diary diary = new Diary();
        diary.setUser(user);
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
        Account user = accountRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        return diaryRepository.findByUserAndIsDeletedFalseOrderByCreatedAtDesc(user).stream()
                .map(DiaryResponseDto::from)
                .collect(Collectors.toList());
    }

    public List<DiaryResponseDto> getAllDiaries() {
        return diaryRepository.findByIsDeletedFalseOrderByCreatedAtDesc().stream()
                .map(DiaryResponseDto::from)
                .collect(Collectors.toList());
    }

    public DiaryResponseDto updateDiary(Long id, DiaryUpdateDto dto, Long currentUserId, String userRole) {
        Diary diary = diaryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Diary not found"));
        
        if (diary.getIsDeleted()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Diary not found");
        }

        // 관리자가 아니고 본인의 일기가 아닌 경우 수정 불가
        if (!"ADMIN".equals(userRole) && !diary.getUser().getId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only update your own diary");
        }

        diary.setTitle(dto.getTitle());
        diary.setText(dto.getText());
        diary.setAudioUrl(dto.getAudioUrl());
        diary.setImageUrl(dto.getImageUrl());
        
        return DiaryResponseDto.from(diaryRepository.save(diary));
    }

    public void deleteDiary(Long id, Long currentUserId, String userRole) {
        Diary diary = diaryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "다이어리를 찾을 수 없습니다."));
        
        if (diary.getIsDeleted()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "다이어리를 찾을 수 없습니다.");
        }

        // 관리자가 아니고 본인의 일기가 아닌 경우 삭제 불가
        if (!"ADMIN".equals(userRole) && !diary.getUser().getId().equals(currentUserId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own diary");
        }

        diaryRepository.delete(diary);
    }

    public String transcribeAudio(MultipartFile audioFile) {
        try {
            // AI 서비스 URL 구성
            String transcribeUrl = aiServiceUrl + "/transcribe";
            log.info("음성 변환 시작 - AI 서비스 URL: {}", transcribeUrl);
            log.info("음성 파일 정보 - 이름: {}, 크기: {} bytes", audioFile.getOriginalFilename(), audioFile.getSize());
            
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
            
            log.info("AI 서비스로 요청 전송 중...");
            
            // AI 서비스 호출
            ResponseEntity<TranscribeResponse> response = restTemplate.postForEntity(
                transcribeUrl,
                requestEntity,
                TranscribeResponse.class
            );
            
            log.info("AI 서비스 응답 - 상태 코드: {}, 응답 본문: {}", response.getStatusCode(), response.getBody());
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String transcribedText = response.getBody().getTranscript();
                log.info("음성 변환 성공 - 변환된 텍스트: {}", transcribedText);
                return transcribedText;
            } else {
                log.error("AI 서비스에서 음성 변환 실패 - 상태 코드: {}", response.getStatusCode());
                throw new RuntimeException("AI 서비스에서 음성 변환 실패");
            }
            
        } catch (Exception e) {
            log.error("음성 변환 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("음성 변환 중 오류 발생: " + e.getMessage());
        }
    }

    public String uploadAudio(MultipartFile audioFile) {
        try {
            // 오디오 파일을 S3에 업로드 (/diary/audio/ 폴더에 저장)
            String audioUrl = s3Service.uploadDiaryAudio(audioFile.getOriginalFilename(), audioFile.getBytes());
            return audioUrl;
        } catch (Exception e) {
            throw new RuntimeException("오디오 업로드 중 오류 발생: " + e.getMessage());
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

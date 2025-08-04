package com.my.backend.s3;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/s3")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class S3UploadController {

    private final S3Service s3Service;

    /**
     * 파일을 S3에 업로드합니다.
     */
    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // 파일 검증
            s3Service.validateFileType(file.getContentType());
            s3Service.validateFileSize(file.getBytes(), 10); // 최대 10MB

            // S3에 업로드
            String fileUrl = s3Service.uploadFile(file.getBytes(), file.getOriginalFilename(), file.getContentType());
            
            log.info("File uploaded successfully: {}", fileUrl);
            return ResponseEntity.ok(fileUrl);
            
        } catch (IllegalArgumentException e) {
            log.error("File validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body("File validation failed: " + e.getMessage());
        } catch (IOException e) {
            log.error("Error reading file", e);
            return ResponseEntity.internalServerError().body("Error reading file");
        } catch (Exception e) {
            log.error("Error uploading file to S3", e);
            return ResponseEntity.internalServerError().body("Error uploading file to S3");
        }
    }

    /**
     * 펫 이미지를 S3에 업로드하고 펫 정보를 업데이트합니다.
     */
    @PostMapping("/upload/pet/{petId}")
    public ResponseEntity<String> uploadPetImage(
            @PathVariable Long petId,
            @RequestParam("file") MultipartFile file) {
        try {
            // 파일 검증
            s3Service.validateFileType(file.getContentType());
            s3Service.validateFileSize(file.getBytes(), 10); // 최대 10MB

            // S3에 업로드
            String fileUrl = s3Service.uploadFile(file.getBytes(), file.getOriginalFilename(), file.getContentType());
            
            log.info("Pet image uploaded successfully for pet {}: {}", petId, fileUrl);
            return ResponseEntity.ok(fileUrl);
            
        } catch (IllegalArgumentException e) {
            log.error("File validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body("File validation failed: " + e.getMessage());
        } catch (IOException e) {
            log.error("Error reading file", e);
            return ResponseEntity.internalServerError().body("Error reading file");
        } catch (Exception e) {
            log.error("Error uploading pet image to S3", e);
            return ResponseEntity.internalServerError().body("Error uploading pet image to S3");
        }
    }
} 
package com.my.backend.s3;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/s3")
@RequiredArgsConstructor
public class S3UploadController {

    private final S3Service s3Service;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            String originalFileName = file.getOriginalFilename();
            byte[] fileData = file.getBytes();
            
            String fileUrl = s3Service.uploadFile(originalFileName, fileData);

            return ResponseEntity.ok(fileUrl);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("File upload failed: " + e.getMessage());
        }
    }

    @PostMapping("/upload/audio")
    public ResponseEntity<String> uploadAudioFile(@RequestParam("file") MultipartFile file) {
        try {
            String originalFileName = file.getOriginalFilename();
            byte[] fileData = file.getBytes();
            
            // 오디오 파일을 /diary 폴더에 저장
            String fileUrl = s3Service.uploadDiaryImage(originalFileName, fileData);

            return ResponseEntity.ok(fileUrl);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Audio file upload failed: " + e.getMessage());
        }
    }

    @PostMapping("/upload/adoption")
    public ResponseEntity<String> uploadAdoptionFile(@RequestParam("file") MultipartFile file) {
        try {
            String originalFileName = file.getOriginalFilename();
            byte[] fileData = file.getBytes();
            
            // 입양 펫 이미지를 /adoption 폴더에 저장
            String fileUrl = s3Service.uploadAdoptionPetImage(file);

            return ResponseEntity.ok(fileUrl);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Adoption file upload failed: " + e.getMessage());
        }
    }

    @PostMapping("/upload/diary")
    public ResponseEntity<String> uploadDiaryFile(@RequestParam("file") MultipartFile file) {
        try {
            String originalFileName = file.getOriginalFilename();
            byte[] fileData = file.getBytes();
            
            // 일기 이미지를 /diary 폴더에 저장
            String fileUrl = s3Service.uploadDiaryImage(originalFileName, fileData);

            return ResponseEntity.ok(fileUrl);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Diary file upload failed: " + e.getMessage());
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<String> deleteFile(@RequestParam("fileName") String fileName) {
        try {
            s3Service.deleteFile(fileName);
            return ResponseEntity.ok("File deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("File deletion failed: " + e.getMessage());
        }
    }
} 
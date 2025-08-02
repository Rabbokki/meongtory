package com.my.backend.store.service;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class S3Service {

    @Autowired
    private S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    public String uploadFile(MultipartFile file) throws IOException {
        String fileName = generateFileName(file.getOriginalFilename());

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        return "https://" + bucketName + ".s3.amazonaws.com/" + fileName;
    }

    public String uploadBase64Image(String base64Image) throws IOException {
        System.out.println("=== S3 업로드 시작 ===");
        System.out.println("Bucket: " + bucketName);
        
        // Base64 데이터에서 실제 이미지 데이터 추출
        String[] parts = base64Image.split(",");
        if (parts.length != 2) {
            System.out.println("Base64 형식 오류: " + base64Image.substring(0, Math.min(100, base64Image.length())));
            throw new IllegalArgumentException("Invalid Base64 image format");
        }
        
        String imageData = parts[1];
        byte[] imageBytes = java.util.Base64.getDecoder().decode(imageData);
        System.out.println("이미지 크기: " + imageBytes.length + " bytes");
        
        // 파일명 생성
        String fileName = generateFileName("image.jpg");
        System.out.println("생성된 파일명: " + fileName);
        
        try {
            // S3에 업로드
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType("image/jpeg")
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(imageBytes));
            
            String s3Url = "https://" + bucketName + ".s3.amazonaws.com/" + fileName;
            System.out.println("S3 업로드 성공: " + s3Url);
            return s3Url;
        } catch (Exception e) {
            System.out.println("S3 업로드 실패: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    private String generateFileName(String originalFileName) {
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        return "products/" + UUID.randomUUID().toString() + extension;
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl != null && fileUrl.contains(bucketName)) {
            String fileName = fileUrl.substring(fileUrl.indexOf(bucketName) + bucketName.length() + 1);
            s3Client.deleteObject(builder -> builder.bucket(bucketName).key(fileName));
        }
    }
} 
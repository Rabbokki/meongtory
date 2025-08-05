package com.my.backend.s3;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;

@Service
@Slf4j
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket.name:}")
    private String bucketName;

    @Value("${aws.s3.region:}")
    private String region;

    public S3Service(S3Client s3Client) {
        this.s3Client = s3Client;
        if (s3Client == null) {
            log.warn("S3Client is null - S3 functionality will be disabled");
            log.warn("AWS credentials not configured - using mock URLs");
        } else {
            log.info("S3Service initialized with bucket: {}", bucketName);
            log.info("AWS S3 client is available for file uploads");
        }
    }

    // S3 파일 업로드 메서드
    public String uploadFile(String fileName, byte[] fileData) {
        try {
            if (s3Client == null) {
                log.warn("S3Client is null - returning mock URL");
                return "https://mock-s3-bucket.s3.amazonaws.com/" + fileName;
            }
            
            // 실제 S3 업로드 로직 구현
            log.info("Uploading file: {} to S3 bucket: {}", fileName, bucketName);
            
            // 실제 S3 업로드 코드 (AWS SDK v2 사용)
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType("image/jpeg")
                .build();
            
            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(fileData));
            
            // 실제 S3 URL 반환
            return "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + fileName;
        } catch (Exception e) {
            log.error("Failed to upload file to S3: {}", e.getMessage());
            throw new RuntimeException("S3 upload failed", e);
        }
    }

    // S3 파일 삭제 메서드
    public void deleteFile(String fileName) {
        try {
            if (s3Client == null) {
                log.warn("S3Client is null - delete operation skipped");
                return;
            }
            
            log.info("Deleting file: {} from S3 bucket: {}", fileName, bucketName);
            
            // 실제 S3 삭제 로직 구현
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .build();
            
            s3Client.deleteObject(deleteObjectRequest);
            log.info("File deleted successfully: {}", fileName);
        } catch (Exception e) {
            log.error("Failed to delete file from S3: {}", e.getMessage());
            throw new RuntimeException("S3 delete failed", e);
        }
    }
} 
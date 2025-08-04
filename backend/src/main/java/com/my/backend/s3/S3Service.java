package com.my.backend.s3;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.UUID;

@Service
@Slf4j
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.region}")
    private String region;

    public S3Service(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    /**
     * 파일을 S3에 업로드하고 URL을 반환합니다.
     * 
     * @param fileBytes 파일 바이트 배열
     * @param originalFileName 원본 파일명
     * @param contentType 파일 타입
     * @return S3 URL
     */
    public String uploadFile(byte[] fileBytes, String originalFileName, String contentType) {
        try {
            // UUID로 고유한 파일명 생성
            String fileExtension = getFileExtension(originalFileName);
            String fileName = UUID.randomUUID().toString() + fileExtension;
            
            // S3에 파일 업로드
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType(contentType)
                    .build();

            PutObjectResponse response = s3Client.putObject(putObjectRequest, 
                    RequestBody.fromInputStream(new ByteArrayInputStream(fileBytes), fileBytes.length));

            if (response.sdkHttpResponse().isSuccessful()) {
                String fileUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, fileName);
                log.info("File uploaded successfully: {}", fileUrl);
                return fileUrl;
            } else {
                throw new RuntimeException("Failed to upload file to S3");
            }
        } catch (Exception e) {
            log.error("Error uploading file to S3", e);
            throw new RuntimeException("Failed to upload file to S3", e);
        }
    }

    /**
     * 파일 확장자를 추출합니다.
     */
    private String getFileExtension(String fileName) {
        if (fileName == null || fileName.lastIndexOf(".") == -1) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }

    /**
     * 파일 크기를 검증합니다.
     */
    public void validateFileSize(byte[] fileBytes, long maxSizeInMB) {
        if (fileBytes.length > maxSizeInMB * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds maximum allowed size of " + maxSizeInMB + "MB");
        }
    }

    /**
     * 파일 타입을 검증합니다.
     */
    public void validateFileType(String contentType) {
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed");
        }
    }
} 
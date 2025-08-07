package com.my.backend.s3;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import java.util.UUID;

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

    // S3 파일 업로드 메서드 (기존 호환성용)
    public String uploadFile(String originalFileName, byte[] fileData) {
        try {
            if (s3Client == null) {
                log.warn("S3Client is null - returning mock URL");
                String uuidFileName = generateFileName(originalFileName);
                return "https://mock-s3-bucket.s3.amazonaws.com/" + uuidFileName;
            }

            String uuidFileName = generateFileName(originalFileName);
            log.info("Uploading file: {} (UUID: {}) to S3 bucket: {}", originalFileName, uuidFileName, bucketName);

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(uuidFileName)
                    .contentType("image/jpeg")
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(fileData));

            String s3Url = "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + uuidFileName;
            log.info("S3 업로드 성공: {}", s3Url);
            return s3Url;
        } catch (Exception e) {
            log.error("Failed to upload file to S3: {}", e.getMessage());
            throw new RuntimeException("S3 upload failed", e);
        }
    }

    // MultipartFile 업로드 메서드
    public String uploadFile(MultipartFile file) {
        try {
            if (s3Client == null) {
                log.warn("S3Client is null - returning mock URL");
                String uuidFileName = generateFileName(file.getOriginalFilename());
                return "https://mock-s3-bucket.s3.amazonaws.com/" + uuidFileName;
            }

            String originalFileName = file.getOriginalFilename();
            byte[] fileData = file.getBytes();

            String uuidFileName = generateFileName(originalFileName);
            log.info("Uploading file: {} (UUID: {}) to S3 bucket: {}", originalFileName, uuidFileName, bucketName);

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(uuidFileName)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(fileData));

            String s3Url = "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + uuidFileName;
            log.info("S3 업로드 성공: {}", s3Url);
            return s3Url;
        } catch (Exception e) {
            log.error("Failed to upload file to S3: {}", e.getMessage());
            throw new RuntimeException("S3 upload failed", e);
        }
    }

    // S3 파일 업로드 메서드 (일기용)
    public String uploadDiaryImage(String originalFileName, byte[] fileData) {
        try {
            if (s3Client == null) {
                log.warn("S3Client is null - returning mock URL");
                String mockFileName = generateDiaryFileName(originalFileName);
                return "https://mock-s3-bucket.s3.amazonaws.com/" + mockFileName;
            }

            String fileName = generateDiaryFileName(originalFileName);
            log.info("Uploading diary image: {} to S3 bucket: {}", fileName, bucketName);

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType("image/jpeg")
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(fileData));

            String s3Url = "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + fileName;
            log.info("Diary image uploaded successfully: {}", s3Url);
            return s3Url;
        } catch (Exception e) {
            log.error("Failed to upload diary image to S3: {}", e.getMessage());
            throw new RuntimeException("S3 upload failed", e);
        }
    }

    // Base64 이미지 업로드 메서드 (일기용)
    public String uploadDiaryBase64Image(String base64Image, String originalFileName) {
        try {
            log.info("=== S3 Diary Base64 이미지 업로드 시작 ===");
            log.info("Bucket: {}", bucketName);

            if (s3Client == null) {
                log.warn("S3Client is null - returning mock URL");
                String mockFileName = generateDiaryFileName(originalFileName);
                return "https://mock-s3-bucket.s3.amazonaws.com/" + mockFileName;
            }

            String[] parts = base64Image.split(",");
            if (parts.length != 2) {
                log.error("Base64 형식 오류: {}", base64Image.substring(0, Math.min(100, base64Image.length())));
                throw new IllegalArgumentException("Invalid Base64 image format");
            }

            String imageData = parts[1];
            byte[] imageBytes = java.util.Base64.getDecoder().decode(imageData);
            log.info("이미지 크기: {} bytes", imageBytes.length);

            String fileName = generateDiaryFileName(originalFileName);
            log.info("생성된 일기 이미지 파일명: {}", fileName);

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(fileName)
                    .contentType("image/jpeg")
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(imageBytes));

            String s3Url = "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + fileName;
            log.info("일기 이미지 S3 업로드 성공: {}", s3Url);
            return s3Url;
        } catch (Exception e) {
            log.error("일기 이미지 S3 업로드 실패: {}", e.getMessage());
            throw new RuntimeException("S3 upload failed", e);
        }
    }

    // Base64 이미지 업로드 메서드 (입양 펫용)
    public String uploadBase64Image(String base64Image) {
        try {
            log.info("=== S3 Base64 이미지 업로드 시작 (입양 펫용) ===");
            log.info("Bucket: {}", bucketName);

            if (s3Client == null) {
                log.warn("S3Client is null - returning mock URL");
                return "https://mock-s3-bucket.s3.amazonaws.com/adoption/image.jpg";
            }

            String[] parts = base64Image.split(",");
            if (parts.length != 2) {
                log.error("Base64 형식 오류: {}", base64Image.substring(0, Math.min(100, base64Image.length())));
                throw new IllegalArgumentException("Invalid Base64 image format");
            }

            String imageData = parts[1];
            byte[] imageBytes = java.util.Base64.getDecoder().decode(imageData);
            log.info("이미지 크기: {} bytes", imageBytes.length);

            String fileName = generateFileName("image.jpg");
            String adoptionKey = "adoption/" + fileName;
            log.info("생성된 파일명: {}", adoptionKey);

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(adoptionKey)
                    .contentType("image/jpeg")
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(imageBytes));

            String s3Url = "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + adoptionKey;
            log.info("S3 Base64 업로드 성공 (입양 펫): {}", s3Url);
            return s3Url;
        } catch (Exception e) {
            log.error("S3 Base64 업로드 실패: {}", e.getMessage());
            throw new RuntimeException("S3 Base64 upload failed", e);
        }
    }

    // MyPet 전용 이미지 업로드 메서드 (/mypet 폴더에 저장)
    public String uploadMyPetImage(MultipartFile file) {
        try {
            if (s3Client == null) {
                log.warn("S3Client is null - returning mock URL");
                String uuidFileName = generateFileName(file.getOriginalFilename());
                return "https://mock-s3-bucket.s3.amazonaws.com/mypet/" + uuidFileName;
            }

            String originalFileName = file.getOriginalFilename();
            byte[] fileData = file.getBytes();

            String uuidFileName = generateFileName(originalFileName);
            String mypetKey = "mypet/" + uuidFileName;
            log.info("Uploading MyPet image: {} (UUID: {}) to S3 bucket: {} in mypet folder", originalFileName, uuidFileName, bucketName);

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(mypetKey)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(fileData));

            String s3Url = "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + mypetKey;
            log.info("MyPet S3 업로드 성공: {}", s3Url);
            return s3Url;
        } catch (Exception e) {
            log.error("Failed to upload MyPet image to S3: {}", e.getMessage());
            throw new RuntimeException("MyPet S3 upload failed", e);
        }
    }

    // 입양 펫 전용 이미지 업로드 메서드 (/adoption 폴더에 저장)
    public String uploadAdoptionPetImage(MultipartFile file) {
        try {
            if (s3Client == null) {
                log.warn("S3Client is null - returning mock URL");
                String uuidFileName = generateFileName(file.getOriginalFilename());
                return "https://mock-s3-bucket.s3.amazonaws.com/adoption/" + uuidFileName;
            }

            String originalFileName = file.getOriginalFilename();
            byte[] fileData = file.getBytes();

            String uuidFileName = generateFileName(originalFileName);
            String adoptionKey = "adoption/" + uuidFileName;
            log.info("Uploading Adoption Pet image: {} (UUID: {}) to S3 bucket: {} in adoption folder", originalFileName, uuidFileName, bucketName);

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(adoptionKey)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(fileData));

            String s3Url = "https://" + bucketName + ".s3." + region + ".amazonaws.com/" + adoptionKey;
            log.info("Adoption Pet S3 업로드 성공: {}", s3Url);
            return s3Url;
        } catch (Exception e) {
            log.error("Failed to upload Adoption Pet image to S3: {}", e.getMessage());
            throw new RuntimeException("Adoption Pet S3 upload failed", e);
        }
    }

    // 일기용 UUID 기반 파일명 생성 메서드
    private String generateDiaryFileName(String originalFileName) {
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        } else {
            extension = ".jpg";
        }
        return "diary/" + UUID.randomUUID().toString() + extension;
    }

    // 기존 파일명 생성 메서드 (호환성용)
    private String generateFileName(String originalFileName) {
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        return "products/" + UUID.randomUUID().toString() + extension;
    }

    // S3 파일 삭제 메서드
    public void deleteFile(String fileName) {
        try {
            if (s3Client == null) {
                log.warn("S3Client is null - delete operation skipped");
                return;
            }

            log.info("Deleting file: {} from S3 bucket: {}", fileName, bucketName);

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

    // 입양 펫 이미지 삭제 메서드 (/adoption 폴더에서 삭제)
    public void deleteAdoptionPetImage(String fileName) {
        try {
            if (s3Client == null) {
                log.warn("S3Client is null - cannot delete adoption pet image: {}", fileName);
                return;
            }

            String adoptionKey = "adoption/" + fileName;
            log.info("Deleting adoption pet image from S3: {}", adoptionKey);

            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(adoptionKey)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.info("Adoption pet image deleted successfully from S3: {}", adoptionKey);
        } catch (Exception e) {
            log.error("Failed to delete adoption pet image from S3: {}", e.getMessage());
            throw new RuntimeException("Adoption pet S3 delete failed", e);
        }
    }
}
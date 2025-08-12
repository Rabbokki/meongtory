package com.my.backend.config;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class S3Config {

    @Value("${aws.access.key.id}")
    private String accessKeyId;

    @Value("${aws.secret.access.key}")
    private String secretAccessKey;

    @Value("${aws.s3.region}")
    private String region;

    @Value("${aws.s3.bucket.name}")
    private String bucketName;

    @Bean
    public S3Client s3Client() {
        System.out.println("=== S3 클라이언트 생성 ===");
        System.out.println("Access Key ID: " + (accessKeyId != null && accessKeyId.length() > 10 ? accessKeyId.substring(0, 10) + "..." : accessKeyId));
        System.out.println("Secret Access Key: " + (secretAccessKey != null && secretAccessKey.length() > 10 ? secretAccessKey.substring(0, 10) + "..." : secretAccessKey));
        System.out.println("Region: " + region);
        System.out.println("Bucket: " + bucketName);

        // 환경 변수가 설정되지 않은 경우 null 반환
        if (accessKeyId == null || accessKeyId.isEmpty() || 
            secretAccessKey == null || secretAccessKey.isEmpty() ||
            bucketName == null || bucketName.isEmpty()) {
            System.out.println("AWS 환경 변수가 설정되지 않음 - S3 기능 비활성화");
            return null;
        }

        AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);
        S3Client s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                .build();

        System.out.println("S3 클라이언트 생성 완료");
        return s3Client;
    }
}
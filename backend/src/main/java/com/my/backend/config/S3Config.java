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

    @Bean
    public S3Client s3Client() {
        System.out.println("=== S3 클라이언트 생성 ===");
        System.out.println("Access Key ID: " + accessKeyId.substring(0, 10) + "...");
        System.out.println("Secret Access Key: " + secretAccessKey.substring(0, 10) + "...");
        System.out.println("Region: " + region);
        System.out.println("Bucket: meongtory");
        
        AwsBasicCredentials awsCredentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);
        S3Client s3Client = S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(awsCredentials))
                .build();
        
        System.out.println("S3 클라이언트 생성 완료");
        return s3Client;
    }
} 
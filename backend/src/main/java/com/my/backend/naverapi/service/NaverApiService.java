package com.my.backend.naverapi.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.my.backend.naverapi.dto.NaverProductDto;
import com.my.backend.naverapi.dto.NaverProductSearchRequestDto;
import com.my.backend.naverapi.dto.NaverProductSearchResponseDto;
import com.my.backend.naverapi.entity.NaverProduct;
import com.my.backend.naverapi.mapper.NaverProductMapper;
import com.my.backend.naverapi.repository.NaverProductRepository;
import com.my.backend.s3.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NaverApiService {

    private final NaverProductRepository repository;
    private final RestTemplate restTemplate;
    private final S3Service s3Service;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${naver.api.client-id}")
    private String clientId;

    @Value("${naver.api.client-secret}")
    private String clientSecret;

    @Value("${naver.api.base-url}")
    private String baseUrl;

    public NaverProductSearchResponseDto searchProducts(NaverProductSearchRequestDto requestDto) {
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .queryParam("query", requestDto.getQuery())
                .queryParam("display", requestDto.getDisplay())
                .queryParam("start", requestDto.getStart())
                .queryParam("sort", requestDto.getSort())
                .toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Naver-Client-Id", clientId);
        headers.set("X-Naver-Client-Secret", clientSecret);

        ResponseEntity<String> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                String.class
        );

        List<NaverProductDto> productList = new ArrayList<>();
        int total = 0;
        String lastBuildDate = "";

        try {
            JsonNode root = objectMapper.readTree(response.getBody());
            total = root.path("total").asInt();
            lastBuildDate = root.path("lastBuildDate").asText();
            
            for (JsonNode item : root.path("items")) {
                String originalImageUrl = item.path("image").asText();
                String s3ImageUrl = originalImageUrl;
                
                // 네이버 이미지를 S3에 업로드
                if (originalImageUrl != null && !originalImageUrl.isEmpty()) {
                    try {
                        s3ImageUrl = uploadNaverImageToS3(originalImageUrl);
                        log.info("네이버 이미지 S3 업로드 성공: {} -> {}", originalImageUrl, s3ImageUrl);
                    } catch (Exception e) {
                        log.warn("네이버 이미지 S3 업로드 실패, 원본 URL 사용: {}", originalImageUrl);
                        s3ImageUrl = originalImageUrl;
                    }
                }
                
                NaverProductDto dto = NaverProductDto.builder()
                        .title(item.path("title").asText())
                        .link(item.path("link").asText())
                        .image(s3ImageUrl)
                        .lprice(item.path("lprice").asInt())
                        .hprice(item.path("hprice").asInt())
                        .mallName(item.path("mallName").asText())
                        .build();

                // DB 저장
                repository.save(NaverProductMapper.toEntity(dto));
                productList.add(dto);
            }
        } catch (Exception e) {
            throw new RuntimeException("네이버 API 응답 파싱 실패", e);
        }

        return NaverProductSearchResponseDto.builder()
                .items(productList)
                .total(total)
                .start(requestDto.getStart())
                .display(requestDto.getDisplay())
                .lastBuildDate(lastBuildDate)
                .build();
    }

    /**
     * 네이버 이미지를 S3에 업로드하는 메서드
     */
    private String uploadNaverImageToS3(String imageUrl) throws IOException {
        try {
            log.info("네이버 이미지 S3 업로드 시작: {}", imageUrl);
            
            // 네이버 이미지 URL에서 이미지 다운로드
            URL url = new URL(imageUrl);
            byte[] imageBytes = restTemplate.getForObject(url.toURI(), byte[].class);
            
            if (imageBytes == null || imageBytes.length == 0) {
                throw new IOException("이미지 다운로드 실패: 빈 데이터");
            }
            
            // 파일명 생성 (네이버 URL에서 추출)
            String fileName = generateFileNameFromUrl(imageUrl);
            
            // S3에 업로드
            String s3Url = s3Service.uploadFile(fileName, imageBytes);
            
            log.info("네이버 이미지 S3 업로드 완료: {}", s3Url);
            return s3Url;
            
        } catch (Exception e) {
            log.error("네이버 이미지 S3 업로드 중 오류 발생: {}", e.getMessage());
            throw new IOException("네이버 이미지 S3 업로드 실패", e);
        }
    }

    /**
     * 네이버 URL에서 파일명을 생성하는 메서드
     */
    private String generateFileNameFromUrl(String imageUrl) {
        try {
            // URL에서 파일명 추출
            String fileName = imageUrl.substring(imageUrl.lastIndexOf("/") + 1);
            
            // 쿼리 파라미터 제거
            if (fileName.contains("?")) {
                fileName = fileName.substring(0, fileName.indexOf("?"));
            }
            
            // 파일 확장자가 없으면 .jpg 추가
            if (!fileName.contains(".")) {
                fileName += ".jpg";
            }
            
            // 네이버 상품 이미지임을 표시하는 접두사 추가
            return "naver-products/" + fileName;
            
        } catch (Exception e) {
            // 파일명 생성 실패시 UUID 사용
            return "naver-products/" + java.util.UUID.randomUUID().toString() + ".jpg";
        }
    }
}

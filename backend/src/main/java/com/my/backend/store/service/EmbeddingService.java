package com.my.backend.store.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class EmbeddingService {

    @Autowired
    private RestTemplate restTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${openai.api.url:https://api.openai.com/v1/embeddings}")
    private String openaiApiUrl;

    /**
     * 텍스트를 OpenAI 임베딩으로 변환
     * @param text 변환할 텍스트
     * @return 임베딩 벡터 (1536차원)
     */
    public List<Double> generateEmbedding(String text) {
        try {
            log.info("=== EmbeddingService.generateEmbedding 시작 ===");
            log.info("텍스트: '{}'", text);
            log.info("OpenAI API Key 존재: {}", openaiApiKey != null && !openaiApiKey.isEmpty());
            
            if (openaiApiKey == null || openaiApiKey.isEmpty()) {
                log.error("OpenAI API Key가 설정되지 않았습니다.");
                throw new RuntimeException("OpenAI API Key가 설정되지 않았습니다.");
            }
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("input", text);
            requestBody.put("model", "text-embedding-ada-002");

            log.info("OpenAI API 요청 시작...");
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            String response = restTemplate.postForObject(openaiApiUrl, request, String.class);
            log.info("OpenAI API 응답 받음: {}자", response != null ? response.length() : 0);
            
            JsonNode jsonResponse = objectMapper.readTree(response);

            if (jsonResponse.has("data") && jsonResponse.get("data").isArray() && jsonResponse.get("data").size() > 0) {
                JsonNode embeddingNode = jsonResponse.get("data").get(0).get("embedding");
                List<Double> embedding = objectMapper.convertValue(embeddingNode, List.class);
                log.info("임베딩 생성 완료: {}차원", embedding.size());
                log.info("=== EmbeddingService.generateEmbedding 완료 ===");
                return embedding;
            } else {
                log.error("OpenAI API 응답에서 임베딩을 찾을 수 없습니다: {}", response);
                throw new RuntimeException("OpenAI API 응답에서 임베딩을 찾을 수 없습니다: " + response);
            }

        } catch (Exception e) {
            log.error("임베딩 생성 실패: {}", e.getMessage(), e);
            throw new RuntimeException("임베딩 생성 중 오류가 발생했습니다", e);
        }
    }

    /**
     * 임베딩 벡터를 PostgreSQL vector 형식의 문자열로 변환
     * @param embedding 임베딩 벡터
     * @return PostgreSQL vector 형식 문자열
     */
    public String embeddingToVectorString(List<Double> embedding) {
        if (embedding == null || embedding.isEmpty()) {
            return null;
        }
        
        StringBuilder vectorString = new StringBuilder("[");
        for (int i = 0; i < embedding.size(); i++) {
            if (i > 0) {
                vectorString.append(",");
            }
            vectorString.append(embedding.get(i));
        }
        vectorString.append("]");
        
        return vectorString.toString();
    }
}

package com.my.backend.community.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
@RequiredArgsConstructor
@Slf4j
public class OpenAiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${openai.api.key:}")
    private String openaiApiKey;

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String openaiApiUrl;

    @Value("${openai.model:gpt-4o-mini}")
    private String openaiModel;

    /**
     * 게시글 내용을 기반으로 AI 댓글 생성
     * @param postContent 게시글 내용
     * @param category 게시판 카테고리
     * @return 생성된 댓글 내용
     */
    public String generateComment(String postContent, String category) {
        try {
            log.info("=== AI 댓글 생성 시작 ===");
            log.info("게시글 내용: {}", postContent);
            log.info("카테고리: {}", category);
            
            if (openaiApiKey == null || openaiApiKey.isEmpty()) {
                log.error("OpenAI API Key가 설정되지 않았습니다.");
                return getFallbackComment(category);
            }

            // 카테고리별 프롬프트 구성
            String prompt = buildPrompt(postContent, category);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openaiApiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", openaiModel);
            requestBody.put("messages", List.of(
                Map.of("role", "system", "content", "당신은 반려견 커뮤니티에서 따뜻하고 공감하는 댓글을 작성하는 AI입니다. 자연스럽고 친근한 톤으로 1-2문장의 짧은 댓글을 작성해주세요."),
                Map.of("role", "user", "content", prompt)
            ));
            requestBody.put("max_tokens", 100);
            requestBody.put("temperature", 0.7);

            log.info("OpenAI API 요청 시작...");
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

            String response = restTemplate.postForObject(openaiApiUrl, request, String.class);
            log.info("OpenAI API 응답 받음: {}자", response != null ? response.length() : 0);
            
            if (response == null) {
                log.error("OpenAI API 응답이 null입니다.");
                return getFallbackComment(category);
            }

            JsonNode jsonResponse = objectMapper.readTree(response);
            
            if (jsonResponse.has("error")) {
                log.error("OpenAI API 오류: {}", jsonResponse.get("error"));
                return getFallbackComment(category);
            }

            String generatedComment = jsonResponse
                    .path("choices")
                    .path(0)
                    .path("message")
                    .path("content")
                    .asText()
                    .trim();

            if (generatedComment.isEmpty()) {
                log.warn("생성된 댓글이 비어있습니다. 기본 댓글 사용");
                return getFallbackComment(category);
            }

            log.info("생성된 AI 댓글: {}", generatedComment);
            return generatedComment;

        } catch (Exception e) {
            log.error("AI 댓글 생성 중 오류 발생: {}", e.getMessage(), e);
            return getFallbackComment(category);
        }
    }

    /**
     * 카테고리별 프롬프트 구성
     */
    private String buildPrompt(String postContent, String category) {
        String categoryContext = switch (category != null ? category.toLowerCase() : "") {
            case "자유게시판", "멍스타그램" -> "공감하고 축하하는 친근한 멘트";
            case "꿀팁게시판" -> "감사하고 추가 아이디어를 제안하는 멘트";
            case "q&a" -> "간단한 조언이나 해결책을 제안하는 멘트";
            default -> "따뜻하고 긍정적인 반응";
        };

        return String.format("""
            게시글 내용: %s
            
            위 게시글에 어울리는 댓글을 작성해주세요.
            조건:
            - 자연스러운 한국어
            - 1~2문장
            - %s
            - 따뜻하고 긍정적인 톤
            - 이모지 사용 가능
            """, postContent, categoryContext);
    }

    /**
     * AI 서비스 실패 시 사용할 기본 댓글
     */
    private String getFallbackComment(String category) {
        return switch (category != null ? category.toLowerCase() : "") {
            case "자유게시판", "멍스타그램" -> "좋은 글 감사합니다! 🐾";
            case "꿀팁게시판" -> "유익한 정보네요! 👍";
            case "q&a" -> "도움이 되는 답변이었어요! 💡";
            default -> "좋은 글 감사합니다 🙌";
        };
    }
}

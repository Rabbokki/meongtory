package com.my.backend.community.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OpenAiServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private OpenAiService openAiService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(openAiService, "openaiApiKey", "test-api-key");
        ReflectionTestUtils.setField(openAiService, "openaiApiUrl", "https://api.openai.com/v1/chat/completions");
        ReflectionTestUtils.setField(openAiService, "openaiModel", "gpt-4o-mini");
    }

    @Test
    void generateComment_성공적으로_AI_댓글_생성() throws Exception {
        // Given
        String postContent = "오늘 강아지와 산책을 했어요. 정말 즐거웠습니다!";
        String category = "자유게시판";
        String expectedResponse = """
            {
                "choices": [
                    {
                        "message": {
                            "content": "좋은 산책이었네요! 🐾"
                        }
                    }
                ]
            }
            """;

        when(restTemplate.postForObject(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(expectedResponse);

        JsonNode mockJsonNode = mock(JsonNode.class);
        JsonNode choicesNode = mock(JsonNode.class);
        JsonNode firstChoiceNode = mock(JsonNode.class);
        JsonNode messageNode = mock(JsonNode.class);

        when(objectMapper.readTree(expectedResponse)).thenReturn(mockJsonNode);
        when(mockJsonNode.path("choices")).thenReturn(choicesNode);
        when(choicesNode.path(0)).thenReturn(firstChoiceNode);
        when(firstChoiceNode.path("message")).thenReturn(messageNode);
        when(messageNode.path("content")).thenReturn(messageNode);
        when(messageNode.asText()).thenReturn("좋은 산책이었네요! 🐾");

        // When
        String result = openAiService.generateComment(postContent, category);

        // Then
        assertNotNull(result);
        assertEquals("좋은 산책이었네요! 🐾", result);
        verify(restTemplate).postForObject(anyString(), any(HttpEntity.class), eq(String.class));
    }

    @Test
    void generateComment_API_키_없음_시_폴백_댓글_반환() {
        // Given
        ReflectionTestUtils.setField(openAiService, "openaiApiKey", "");
        String postContent = "테스트 게시글";
        String category = "자유게시판";

        // When
        String result = openAiService.generateComment(postContent, category);

        // Then
        assertNotNull(result);
        assertEquals("좋은 글 감사합니다! 🐾", result);
        verify(restTemplate, never()).postForObject(anyString(), any(HttpEntity.class), eq(String.class));
    }

    @Test
    void generateComment_API_응답_null_시_폴백_댓글_반환() {
        // Given
        String postContent = "테스트 게시글";
        String category = "꿀팁게시판";

        when(restTemplate.postForObject(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(null);

        // When
        String result = openAiService.generateComment(postContent, category);

        // Then
        assertNotNull(result);
        assertEquals("유익한 정보네요! 👍", result);
    }

    @Test
    void generateComment_API_오류_시_폴백_댓글_반환() throws Exception {
        // Given
        String postContent = "테스트 게시글";
        String category = "Q&A";
        String errorResponse = """
            {
                "error": {
                    "message": "API 오류"
                }
            }
            """;

        when(restTemplate.postForObject(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenReturn(errorResponse);

        JsonNode mockJsonNode = mock(JsonNode.class);
        when(objectMapper.readTree(errorResponse)).thenReturn(mockJsonNode);
        when(mockJsonNode.has("error")).thenReturn(true);

        // When
        String result = openAiService.generateComment(postContent, category);

        // Then
        assertNotNull(result);
        assertEquals("도움이 되는 답변이었어요! 💡", result);
    }

    @Test
    void generateComment_예외_발생_시_폴백_댓글_반환() {
        // Given
        String postContent = "테스트 게시글";
        String category = "자유게시판";

        when(restTemplate.postForObject(anyString(), any(HttpEntity.class), eq(String.class)))
                .thenThrow(new RuntimeException("네트워크 오류"));

        // When
        String result = openAiService.generateComment(postContent, category);

        // Then
        assertNotNull(result);
        assertEquals("좋은 글 감사합니다! 🐾", result);
    }

    @Test
    void generateComment_카테고리별_폴백_댓글_확인() {
        // Given
        ReflectionTestUtils.setField(openAiService, "openaiApiKey", "");

        // When & Then
        assertEquals("좋은 글 감사합니다! 🐾", openAiService.generateComment("", "자유게시판"));
        assertEquals("유익한 정보네요! 👍", openAiService.generateComment("", "꿀팁게시판"));
        assertEquals("도움이 되는 답변이었어요! 💡", openAiService.generateComment("", "Q&A"));
        assertEquals("좋은 글 감사합니다 🙌", openAiService.generateComment("", "기타카테고리"));
    }
}

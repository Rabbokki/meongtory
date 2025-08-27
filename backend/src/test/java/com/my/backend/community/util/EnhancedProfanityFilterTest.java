package com.my.backend.community.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.*;

@TestPropertySource(properties = {
    "openai.api.key=test-key"
})
class EnhancedProfanityFilterTest {

    private EnhancedProfanityFilter filter;

    @BeforeEach
    void setUp() {
        filter = new EnhancedProfanityFilter();
    }

    @Test
    void testContainsProfanity_WithBadWords_ShouldReturnTrue() {
        // 정규식 필터 테스트 (보조 필터) - 한국 욕 + 변형
        assertTrue(filter.containsProfanity("개새끼"));
        assertTrue(filter.containsProfanity("개같다"));
        assertTrue(filter.containsProfanity("개같은"));
        assertTrue(filter.containsProfanity("씨발"));
        assertTrue(filter.containsProfanity("병신"));
        assertTrue(filter.containsProfanity("미친"));
        assertTrue(filter.containsProfanity("fuck"));
        assertTrue(filter.containsProfanity("shit"));
        assertTrue(filter.containsProfanity("좆"));
    }

    @Test
    void testContainsProfanity_WithVariations_ShouldReturnTrue() {
        // 변형된 비속어 테스트
        assertTrue(filter.containsProfanity("개@새#끼"));
        assertTrue(filter.containsProfanity("개123새끼"));
        assertTrue(filter.containsProfanity("ㅅㅂ"));
        assertTrue(filter.containsProfanity("씨@발"));
    }

    @Test
    void testContainsProfanity_WithNormalText_ShouldReturnFalse() {
        // 정상적인 텍스트 테스트
        assertFalse(filter.containsProfanity("안녕하세요"));
        assertFalse(filter.containsProfanity("반갑습니다"));
        assertFalse(filter.containsProfanity("좋은 하루 되세요"));
        assertFalse(filter.containsProfanity(""));
        assertFalse(filter.containsProfanity(null));
    }

    @Test
    void testContainsProfanity_WithMixedText_ShouldReturnTrue() {
        // 혼합된 텍스트에서 비속어 감지 테스트
        assertTrue(filter.containsProfanity("안녕하세요 개새끼 반갑습니다"));
        assertTrue(filter.containsProfanity("좋은 하루 되세요 씨발"));
        assertTrue(filter.containsProfanity("fuck you"));
    }
}

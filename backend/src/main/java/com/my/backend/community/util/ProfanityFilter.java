package com.my.backend.community.util;

import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class ProfanityFilter {
    
    // 비속어 리스트 (실제 운영 시에는 더 포괄적인 리스트로 확장 필요)
    private static final List<String> PROFANITY_LIST = Arrays.asList(
        "ㅅㅂ", "시발", "fuck", "개새끼", "병신", "좆", "sex",
        "씨발", "미친", "바보", "멍청이", "등신", "돌았나", "미쳤나",
        "shit", "bitch", "asshole", "damn", "hell", "pussy", "cock", "dick",
        "개새끼", "개자식", "개같은", "개새기", "개새끼", "개자식", "개같은", "개새기",
        "병신", "병신아", "병신새끼", "병신같은", "병신새기",
        "좆", "좆같은", "좆새끼", "좆같은", "좆새기",
        "씨발", "씨발새끼", "씨발같은", "씨발새기", "씨발아",
        "미친", "미친새끼", "미친같은", "미친새기", "미친아",
        "바보", "바보새끼", "바보같은", "바보새기", "바보아",
        "멍청이", "멍청이새끼", "멍청이같은", "멍청이새기", "멍청이아",
        "등신", "등신새끼", "등신같은", "등신새기", "등신아"
    );
    
    /**
     * 텍스트에 비속어가 포함되어 있는지 확인
     * @param text 검사할 텍스트
     * @return 비속어 포함 여부
     */
    public boolean containsProfanity(String text) {
        if (text == null || text.trim().isEmpty()) {
            return false;
        }
        
        // 공백 제거 및 소문자 변환
        String normalizedText = text.replaceAll("\\s+", "").toLowerCase();
        
        for (String profanity : PROFANITY_LIST) {
            // 비속어도 공백 제거 및 소문자 변환
            String normalizedProfanity = profanity.replaceAll("\\s+", "").toLowerCase();
            
            // 정확한 단어 매칭과 부분 문자열 매칭 모두 검사
            if (normalizedText.contains(normalizedProfanity) || 
                normalizedText.matches(".*" + normalizedProfanity + ".*")) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 비속어를 마스킹 처리
     * @param text 원본 텍스트
     * @return 마스킹된 텍스트
     */
    public String maskProfanity(String text) {
        if (text == null || text.trim().isEmpty()) {
            return text;
        }
        
        String result = text;
        
        for (String profanity : PROFANITY_LIST) {
            // 대소문자 구분 없이 마스킹 처리
            String mask = "*".repeat(profanity.length());
            result = result.replaceAll("(?i)" + profanity, mask);
        }
        
        return result;
    }
}

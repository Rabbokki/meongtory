package com.my.backend.contract.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.my.backend.contract.dto.AISuggestionDto;
import com.my.backend.contract.dto.ContractGenerationRequestDto;
import com.my.backend.contract.entity.AISuggestion;
import com.my.backend.contract.entity.ContractTemplate;
import com.my.backend.contract.repository.AISuggestionRepository;
import com.my.backend.contract.repository.ContractTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class AISuggestionService {
    
    private final AISuggestionRepository aiSuggestionRepository;
    private final ContractTemplateRepository contractTemplateRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${ai.service.url:http://ai:9000}")
    private String aiServiceUrl;
    
    public List<AISuggestionDto> getClauseSuggestions(Long templateId, List<String> currentClauses,
                                                     ContractGenerationRequestDto.PetInfoDto petInfo,
                                                     ContractGenerationRequestDto.UserInfoDto userInfo,
                                                     String requestedBy) {
        
        // AI 조항 추천 생성
        List<AISuggestionDto> suggestions = generateClauseSuggestions(templateId, currentClauses, petInfo, userInfo);
        
        // 추천 내용 저장
        for (AISuggestionDto suggestion : suggestions) {
            AISuggestion aiSuggestion = AISuggestion.builder()
                    .suggestion(suggestion.getSuggestion())
                    .type(AISuggestion.SuggestionType.valueOf(suggestion.getType()))
                    .confidence(suggestion.getConfidence())
                    .template(templateId != null ? contractTemplateRepository.findById(templateId).orElse(null) : null)
                    .requestedBy(requestedBy)
                    .build();
            
            aiSuggestionRepository.save(aiSuggestion);
        }
        
        return suggestions;
    }
    
    private List<AISuggestionDto> generateClauseSuggestions(Long templateId, List<String> currentClauses,
                                                           ContractGenerationRequestDto.PetInfoDto petInfo,
                                                           ContractGenerationRequestDto.UserInfoDto userInfo) {
        try {
            // AI 서비스에 요청
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("templateId", templateId);
            requestBody.put("currentClauses", currentClauses);
            requestBody.put("petInfo", petInfo != null ? Map.of(
                "name", petInfo.getName(),
                "breed", petInfo.getBreed(),
                "age", petInfo.getAge(),
                "healthStatus", petInfo.getHealthStatus()
            ) : new HashMap<>());
            requestBody.put("userInfo", userInfo != null ? Map.of(
                "name", userInfo.getName(),
                "phone", userInfo.getPhone(),
                "email", userInfo.getEmail()
            ) : new HashMap<>());
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                aiServiceUrl + "/clause-suggestions", 
                request, 
                Map.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                List<Map<String, Object>> suggestions = (List<Map<String, Object>>) response.getBody().get("suggestions");
                return convertToAISuggestionDtos(suggestions);
            } else {
                return getDefaultClauseSuggestions();
            }
            
        } catch (Exception e) {
            // 에러 발생 시 기본 추천 반환
            return getDefaultClauseSuggestions();
        }
    }
    
    private List<AISuggestionDto> convertToAISuggestionDtos(List<Map<String, Object>> suggestions) {
        List<AISuggestionDto> result = new ArrayList<>();
        
        for (Map<String, Object> suggestion : suggestions) {
            AISuggestionDto dto = AISuggestionDto.builder()
                    .suggestion((String) suggestion.get("suggestion"))
                    .type((String) suggestion.get("type"))
                    .confidence((Double) suggestion.get("confidence"))
                    .build();
            result.add(dto);
        }
        
        return result;
    }
    
    private List<AISuggestionDto> getDefaultClauseSuggestions() {
        List<AISuggestionDto> suggestions = new ArrayList<>();
        
        suggestions.add(AISuggestionDto.builder()
                .suggestion("제4조 (건강관리)")
                .type("CLAUSE")
                .confidence(0.9)
                .build());
        
        suggestions.add(AISuggestionDto.builder()
                .suggestion("제5조 (의료비용)")
                .type("CLAUSE")
                .confidence(0.8)
                .build());
        
        suggestions.add(AISuggestionDto.builder()
                .suggestion("제6조 (반려동물 행동)")
                .type("CLAUSE")
                .confidence(0.7)
                .build());
        
        suggestions.add(AISuggestionDto.builder()
                .suggestion("제7조 (식사 및 영양)")
                .type("CLAUSE")
                .confidence(0.6)
                .build());
        
        suggestions.add(AISuggestionDto.builder()
                .suggestion("제8조 (임시보호)")
                .type("CLAUSE")
                .confidence(0.5)
                .build());
        
        return suggestions;
    }
    
    public List<AISuggestionDto> getSuggestionsByUser(String requestedBy) {
        return aiSuggestionRepository.findByRequestedBy(requestedBy).stream()
                .map(this::convertToDto)
                .toList();
    }
    
    private AISuggestionDto convertToDto(AISuggestion suggestion) {
        return AISuggestionDto.builder()
                .id(suggestion.getId())
                .suggestion(suggestion.getSuggestion())
                .type(suggestion.getType().name())
                .confidence(suggestion.getConfidence())
                .build();
    }
} 
package com.my.backend.contract.controller;

import com.my.backend.contract.dto.AISuggestionDto;
import com.my.backend.contract.dto.ContractGenerationRequestDto;
import com.my.backend.contract.service.AISuggestionService;
import com.my.backend.global.dto.ResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contract-templates/ai-suggestions")
@RequiredArgsConstructor
public class AISuggestionController {
    
    private final AISuggestionService aiSuggestionService;
    
    @PostMapping("/clauses")
    public ResponseEntity<ResponseDto<List<AISuggestionDto>>> getClauseSuggestions(
            @RequestBody ClauseSuggestionRequestDto requestDto, Authentication authentication) {
        System.out.println("=== AISuggestionController.getClauseSuggestions 호출됨 ===");
        System.out.println("Request DTO: " + requestDto);
        System.out.println("Current Clauses: " + requestDto.getCurrentClauses());
        System.out.println("Pet Info: " + requestDto.getPetInfo());
        System.out.println("User Info: " + requestDto.getUserInfo());
        
        String userEmail = authentication.getName();
        System.out.println("User Email: " + userEmail);
        
        System.out.println("=== aiSuggestionService.getClauseSuggestions 호출 시작 ===");
        List<AISuggestionDto> suggestions = aiSuggestionService.getClauseSuggestions(
                requestDto.getTemplateId(),
                requestDto.getCurrentClauses(),
                requestDto.getPetInfo(),
                requestDto.getUserInfo(),
                userEmail
        );
        System.out.println("=== aiSuggestionService.getClauseSuggestions 호출 완료 ===");
        
        System.out.println("=== 조항 추천 결과 ===");
        System.out.println("Suggestions: " + suggestions);
        
        return ResponseEntity.ok(ResponseDto.success(suggestions));
    }
    
    @PostMapping("/generate-contract")
    public ResponseEntity<ResponseDto<Map<String, Object>>> generateContract(
            @RequestBody ContractGenerationRequestDto requestDto, Authentication authentication) {
        System.out.println("=== AISuggestionController.generateContract 호출됨 ===");
        try {
            System.out.println("=== 계약서 생성 요청 받음 ===");
            System.out.println("Request DTO: " + requestDto);
            
            String userEmail = authentication.getName();
            System.out.println("User Email: " + userEmail);
            
            Map<String, Object> result = aiSuggestionService.generateContract(requestDto, userEmail);
            System.out.println("AI 서비스 결과: " + result);
            
            return ResponseEntity.ok(ResponseDto.success(result));
        } catch (Exception e) {
            System.out.println("계약서 생성 오류: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                .body(ResponseDto.fail("AI_ERROR", "계약서 생성 실패: " + e.getMessage()));
        }
    }
    
    @PostMapping("/contract-suggestions")
    public ResponseEntity<ResponseDto<Map<String, Object>>> getContractSuggestions(
            @RequestBody AISuggestionService.ContractSuggestionRequestDto requestDto, Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            Map<String, Object> result = aiSuggestionService.getContractSuggestions(requestDto, userEmail);
            return ResponseEntity.ok(ResponseDto.success(result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ResponseDto.fail("AI_ERROR", "계약서 조항 추천 실패: " + e.getMessage()));
        }
    }
    
    @GetMapping("/user")
    public ResponseEntity<ResponseDto<List<AISuggestionDto>>> getSuggestionsByUser(Authentication authentication) {
        String userEmail = authentication.getName();
        List<AISuggestionDto> suggestions = aiSuggestionService.getSuggestionsByUser(userEmail);
        return ResponseEntity.ok(ResponseDto.success(suggestions));
    }
    
    // 조항 추천 요청을 위한 DTO
    public static class ClauseSuggestionRequestDto {
        private Long templateId;
        private List<String> currentClauses;
        private ContractGenerationRequestDto.PetInfoDto petInfo;
        private ContractGenerationRequestDto.UserInfoDto userInfo;
        
        // Getters and Setters
        public Long getTemplateId() { return templateId; }
        public void setTemplateId(Long templateId) { this.templateId = templateId; }
        
        public List<String> getCurrentClauses() { return currentClauses; }
        public void setCurrentClauses(List<String> currentClauses) { this.currentClauses = currentClauses; }
        
        public ContractGenerationRequestDto.PetInfoDto getPetInfo() { return petInfo; }
        public void setPetInfo(ContractGenerationRequestDto.PetInfoDto petInfo) { this.petInfo = petInfo; }
        
        public ContractGenerationRequestDto.UserInfoDto getUserInfo() { return userInfo; }
        public void setUserInfo(ContractGenerationRequestDto.UserInfoDto userInfo) { this.userInfo = userInfo; }
    }
} 
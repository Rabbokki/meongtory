package com.my.backend.contract.controller;

import com.my.backend.contract.dto.ContractTemplateDto;
import com.my.backend.contract.service.ContractTemplateService;
import com.my.backend.global.dto.ResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contract-templates")
@RequiredArgsConstructor
public class ContractTemplateController {
    
    private final ContractTemplateService contractTemplateService;
    
    @GetMapping
    public ResponseEntity<ResponseDto<List<ContractTemplateDto>>> getAllTemplates() {
        List<ContractTemplateDto> templates = contractTemplateService.getAllTemplates();
        return ResponseEntity.ok(ResponseDto.success(templates));
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<ResponseDto<List<ContractTemplateDto>>> getTemplatesByCategory(@PathVariable String category) {
        List<ContractTemplateDto> templates = contractTemplateService.getTemplatesByCategory(category);
        return ResponseEntity.ok(ResponseDto.success(templates));
    }
    
    @GetMapping("/default")
    public ResponseEntity<ResponseDto<List<ContractTemplateDto>>> getDefaultTemplates() {
        List<ContractTemplateDto> templates = contractTemplateService.getDefaultTemplates();
        return ResponseEntity.ok(ResponseDto.success(templates));
    }
    

    
    @GetMapping("/search")
    public ResponseEntity<ResponseDto<List<ContractTemplateDto>>> searchTemplates(@RequestParam String keyword) {
        List<ContractTemplateDto> templates = contractTemplateService.searchTemplates(keyword);
        return ResponseEntity.ok(ResponseDto.success(templates));
    }
    
    @GetMapping("/search/category")
    public ResponseEntity<ResponseDto<List<ContractTemplateDto>>> searchTemplatesByCategory(
            @RequestParam String category, @RequestParam String keyword) {
        List<ContractTemplateDto> templates = contractTemplateService.searchTemplatesByCategory(category, keyword);
        return ResponseEntity.ok(ResponseDto.success(templates));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ResponseDto<ContractTemplateDto>> getTemplateById(@PathVariable Long id) {
        ContractTemplateDto template = contractTemplateService.getTemplateById(id);
        return ResponseEntity.ok(ResponseDto.success(template));
    }
    
    @PostMapping
    public ResponseEntity<ResponseDto<ContractTemplateDto>> createTemplate(
            @RequestBody ContractTemplateDto templateDto, Authentication authentication) {
        ContractTemplateDto createdTemplate = contractTemplateService.createTemplate(templateDto, null);
        return ResponseEntity.ok(ResponseDto.success(createdTemplate));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto<ContractTemplateDto>> updateTemplate(
            @PathVariable Long id, @RequestBody ContractTemplateDto templateDto, Authentication authentication) {
        ContractTemplateDto updatedTemplate = contractTemplateService.updateTemplate(id, templateDto, null);
        return ResponseEntity.ok(ResponseDto.success(updatedTemplate));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto<Void>> deleteTemplate(@PathVariable Long id) {
        contractTemplateService.deleteTemplate(id);
        return ResponseEntity.ok(ResponseDto.success(null));
    }
} 
package com.my.backend.contract.service;

import com.my.backend.contract.dto.ContractTemplateDto;
import com.my.backend.contract.dto.ContractSectionDto;
import com.my.backend.contract.entity.ContractTemplate;
import com.my.backend.contract.entity.ContractSection;
import com.my.backend.contract.entity.GeneratedContract;
import com.my.backend.contract.repository.ContractTemplateRepository;
import com.my.backend.contract.repository.GeneratedContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ContractTemplateService {
    
    private final ContractTemplateRepository contractTemplateRepository;
    private final GeneratedContractRepository generatedContractRepository;
    
    public List<ContractTemplateDto> getAllTemplates() {
        return contractTemplateRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<ContractTemplateDto> getTemplatesByCategory(String category) {
        return contractTemplateRepository.findByCategory(category).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<ContractTemplateDto> getDefaultTemplates() {
        return contractTemplateRepository.findByIsDefault(true).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    

    
    public List<ContractTemplateDto> searchTemplates(String keyword) {
        return contractTemplateRepository.findByKeyword(keyword).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public List<ContractTemplateDto> searchTemplatesByCategory(String category, String keyword) {
        return contractTemplateRepository.findByCategoryAndKeyword(category, keyword).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public ContractTemplateDto getTemplateById(Long id) {
        ContractTemplate template = contractTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("템플릿을 찾을 수 없습니다."));
        return convertToDto(template);
    }
    
    public ContractTemplateDto createTemplate(ContractTemplateDto templateDto, String createdBy) {
        ContractTemplate template = ContractTemplate.builder()
                .name(templateDto.getName())
                .description(templateDto.getDescription())
                .category(templateDto.getCategory())
                .isDefault(templateDto.getIsDefault() != null ? templateDto.getIsDefault() : false)
                .build();
        
        ContractTemplate savedTemplate = contractTemplateRepository.save(template);
        
        // sections 처리
        if (templateDto.getSections() != null && !templateDto.getSections().isEmpty()) {
            final ContractTemplate finalTemplate = savedTemplate;
            List<ContractSection> sections = templateDto.getSections().stream()
                .map(sectionDto -> {
                    return ContractSection.builder()
                        .title(sectionDto.getTitle())
                        .content(sectionDto.getContent())
                        .isRequired(sectionDto.getIsRequired() != null ? sectionDto.getIsRequired() : false)
                        .orderNum(sectionDto.getOrder() != null ? sectionDto.getOrder() : 1)
                        .template(finalTemplate)
                        .build();
                })
                .collect(Collectors.toList());
            
            savedTemplate.setSections(sections);
            savedTemplate = contractTemplateRepository.save(savedTemplate);
        }
        
        return convertToDto(savedTemplate);
    }
    
    public ContractTemplateDto updateTemplate(Long id, ContractTemplateDto templateDto, String updatedBy) {
        ContractTemplate template = contractTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("템플릿을 찾을 수 없습니다."));
        
        template.setName(templateDto.getName());
        template.setDescription(templateDto.getDescription());
        template.setCategory(templateDto.getCategory());
        template.setIsDefault(templateDto.getIsDefault() != null ? templateDto.getIsDefault() : template.getIsDefault());
        
        // sections 업데이트
        if (templateDto.getSections() != null) {
            List<ContractSection> updatedSections = templateDto.getSections().stream()
                .map(sectionDto -> {
                    // 기존 section이 있으면 업데이트, 없으면 새로 생성
                    ContractSection existingSection = template.getSections() != null ?
                        template.getSections().stream()
                            .filter(section -> section.getTitle().equals(sectionDto.getTitle()))
                            .findFirst()
                            .orElse(null) : null;
                    
                    if (existingSection != null) {
                        // 기존 section 업데이트
                        existingSection.setTitle(sectionDto.getTitle());
                        existingSection.setContent(sectionDto.getContent());
                        existingSection.setIsRequired(sectionDto.getIsRequired() != null ? sectionDto.getIsRequired() : false);
                        if (sectionDto.getOrder() != null) {
                            existingSection.setOrderNum(sectionDto.getOrder());
                        }
                        return existingSection;
                    } else {
                        // 새로운 section 생성
                        return ContractSection.builder()
                            .title(sectionDto.getTitle())
                            .content(sectionDto.getContent())
                            .isRequired(sectionDto.getIsRequired() != null ? sectionDto.getIsRequired() : false)
                            .orderNum(sectionDto.getOrder() != null ? sectionDto.getOrder() : 1)
                            .template(template)
                            .build();
                    }
                })
                .collect(Collectors.toList());
            
            template.setSections(updatedSections);
        }
        
        ContractTemplate savedTemplate = contractTemplateRepository.save(template);
        return convertToDto(savedTemplate);
    }
    
    public void deleteTemplate(Long id) {
        ContractTemplate template = contractTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("템플릿을 찾을 수 없습니다."));
        
        // 이 템플릿으로 생성된 계약서들의 template 참조를 null로 설정
        List<GeneratedContract> generatedContracts = generatedContractRepository.findByTemplate(template);
        for (GeneratedContract contract : generatedContracts) {
            contract.setTemplate(null);
            generatedContractRepository.save(contract);
        }
        
        // 템플릿 삭제 (CASCADE 설정으로 sections도 함께 삭제됨)
        contractTemplateRepository.delete(template);
    }
    
    private ContractTemplateDto convertToDto(ContractTemplate template) {
        List<ContractSectionDto> sections = template.getSections() != null ?
            template.getSections().stream()
                .sorted(Comparator.comparing(ContractSection::getOrderNum))
                .map(ContractSectionDto::fromEntity)
                .collect(Collectors.toList()) :
            List.of();
            
        return ContractTemplateDto.builder()
                .id(template.getId())
                .name(template.getName())
                .description(template.getDescription())
                .category(template.getCategory())
                .sections(sections)
                .isDefault(template.getIsDefault())
                .createdAt(template.getCreatedAt())
                .updatedAt(template.getUpdatedAt())
                .build();
    }
} 
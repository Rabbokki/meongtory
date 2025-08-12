package com.my.backend.contract.repository;

import com.my.backend.contract.entity.ContractSection;
import com.my.backend.contract.entity.ContractTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractSectionRepository extends JpaRepository<ContractSection, Long> {
    
    List<ContractSection> findByTemplateIdOrderByOrderNum(Long templateId);
    
    List<ContractSection> findByTemplateIdAndIsRequired(Long templateId, Boolean isRequired);
    
    List<ContractSection> findByTemplateOrderByOrderNum(ContractTemplate template);
} 
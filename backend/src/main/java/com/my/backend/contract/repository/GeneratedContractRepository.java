package com.my.backend.contract.repository;

import com.my.backend.contract.entity.GeneratedContract;
import com.my.backend.contract.entity.ContractTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GeneratedContractRepository extends JpaRepository<GeneratedContract, Long> {
    
    List<GeneratedContract> findByGeneratedBy(String generatedBy);
    
    List<GeneratedContract> findByTemplate(ContractTemplate template);
} 
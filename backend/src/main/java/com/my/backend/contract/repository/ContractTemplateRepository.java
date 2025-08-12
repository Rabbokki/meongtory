package com.my.backend.contract.repository;

import com.my.backend.contract.entity.ContractTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractTemplateRepository extends JpaRepository<ContractTemplate, Long> {
    
    List<ContractTemplate> findByCategory(String category);
    
    List<ContractTemplate> findByIsDefault(Boolean isDefault);
    
    @Query("SELECT ct FROM ContractTemplate ct WHERE ct.name LIKE %:keyword% OR ct.description LIKE %:keyword%")
    List<ContractTemplate> findByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT ct FROM ContractTemplate ct WHERE ct.category = :category AND (ct.name LIKE %:keyword% OR ct.description LIKE %:keyword%)")
    List<ContractTemplate> findByCategoryAndKeyword(@Param("category") String category, @Param("keyword") String keyword);
} 
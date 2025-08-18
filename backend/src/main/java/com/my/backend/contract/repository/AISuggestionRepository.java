package com.my.backend.contract.repository;

import com.my.backend.contract.entity.AISuggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AISuggestionRepository extends JpaRepository<AISuggestion, Long> {
    
    List<AISuggestion> findByTemplateId(Long templateId);
    
    List<AISuggestion> findByRequestedBy(String requestedBy);
    
    List<AISuggestion> findByType(AISuggestion.SuggestionType type);
} 
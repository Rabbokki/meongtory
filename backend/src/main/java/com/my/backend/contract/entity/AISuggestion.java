package com.my.backend.contract.entity;

import com.my.backend.account.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "ai_suggestions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AISuggestion extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String suggestion;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SuggestionType type;
    
    @Column(nullable = false)
    private Double confidence;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private ContractTemplate template;
    
    @Column(nullable = false)
    private String requestedBy;
    
    public enum SuggestionType {
        SECTION, CLAUSE, TEMPLATE
    }
} 
package com.my.backend.contract.entity;

import com.my.backend.account.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "generated_contracts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeneratedContract extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String contractName; 
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
    
    @Column
    private String pdfUrl;
    
    @Column
    private String wordUrl;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = true)
    private ContractTemplate template;
    
    @Column(nullable = false)
    private String generatedBy;
    
    @Column(columnDefinition = "TEXT")
    private String customSections; // JSON 형태로 저장
    
    @Column(columnDefinition = "TEXT")
    private String removedSections; // JSON 형태로 저장
    
    @Column(columnDefinition = "TEXT")
    private String petInfo; // JSON 형태로 저장
    
    @Column(columnDefinition = "TEXT")
    private String userInfo; // JSON 형태로 저장
    
    @Column(columnDefinition = "TEXT")
    private String additionalInfo;
} 
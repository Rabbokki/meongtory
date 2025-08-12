package com.my.backend.contract.entity;

import com.my.backend.account.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "contract_sections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractSection extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title; // 조항 제목만 저장 (예: "제1조 (목적)")
    
    @Column(columnDefinition = "TEXT")
    private String content; // 조항 내용
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isRequired = false;
    
    @Column(nullable = false)
    private Integer orderNum;
    
    @Column(columnDefinition = "TEXT")
    private String options; // JSON 형태로 저장
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private ContractTemplate template;
} 
package com.my.backend.contract.entity;

import com.my.backend.account.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Entity
@Table(name = "contract_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContractTemplate extends BaseEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name; // 템플릿 이름 (예: "기본 입양 계약서")
    
    @Column(columnDefinition = "TEXT")
    private String description; // 템플릿 설명
    
    @Column(nullable = false)
    private String category; // 카테고리 (예: "입양", "임시보호", "후원")
    
    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ContractSection> sections; // 조항들
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isDefault = false;
} 
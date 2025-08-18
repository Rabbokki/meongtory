package com.my.backend.store.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "naver_product")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NaverProduct {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "naver_product_id")
    private Long id;

    // 네이버 쇼핑 API에서 제공하는 고유 ID
    @Column(unique = true, nullable = false)
    private String productId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Long price;

    @Column(nullable = false)
    private String imageUrl;

    @Column(nullable = false)
    private String mallName;

    @Column(nullable = false)
    private String productUrl;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String maker;

    @Column(nullable = false)
    private String category1;

    @Column(nullable = false)
    private String category2;

    @Column(nullable = false)
    private String category3;

    @Column(nullable = false)
    private String category4;

    @Column(nullable = false)
    private Integer reviewCount;

    @Column(nullable = false)
    private Double rating;

    @Column(nullable = false)
    private Integer searchCount;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // 기존 Product와의 연관관계 (선택적)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "related_product_id")
    @JsonIgnore
    private Product relatedProduct;

    // 네이버 상품을 카트에 담은 사용자들
    @OneToMany(mappedBy = "naverProduct", cascade = CascadeType.ALL)
    @JsonIgnore
    @Builder.Default
    private List<Cart> cartItems = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (searchCount == null) {
            searchCount = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

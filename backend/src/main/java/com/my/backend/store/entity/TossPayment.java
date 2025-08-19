package com.my.backend.store.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "toss_payments")
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
public class TossPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 토스에서 발급하는 결제 키
    @Column(nullable = false, unique = true, length = 200)
    private String paymentKey;

    // 토스 내부의 주문 ID
    @Column(nullable = false, length = 64)
    private String tossOrderId;

    // Order와 1:1 관계
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    // 결제 금액
    @Column(nullable = false)
    private Long totalAmount;

    // 결제 수단 (카드, 가상계좌 등)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TossPaymentMethod paymentMethod;

    // 결제 상태
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TossPaymentStatus status;

    // 요청 시각
    @Column(nullable = false)
    private LocalDateTime requestedAt;

    // 승인 시각
    private LocalDateTime approvedAt;

    // 결제 실패 시각
    private LocalDateTime failedAt;

    // 실패 사유
    @Column(length = 500)
    private String failureReason;

    // 영수증 URL
    @Column(length = 500)
    private String receiptUrl;

    // 체크아웃 URL
    @Column(length = 500)
    private String checkoutUrl;

    // 카드 정보 (JSON 형태로 저장)
    @Column(columnDefinition = "TEXT")
    private String cardInfo;

    // 가상계좌 정보 (JSON 형태로 저장)
    @Column(columnDefinition = "TEXT")
    private String virtualAccountInfo;

    // 계좌이체 정보 (JSON 형태로 저장)
    @Column(columnDefinition = "TEXT")
    private String transferInfo;

    // 메타데이터 (JSON 형태로 저장)
    @Column(columnDefinition = "TEXT")
    private String metadata;

    // 생성 시각
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // 수정 시각
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}



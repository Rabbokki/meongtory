package com.my.backend.store.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
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
    @Column(nullable = false, unique = true)
    private String paymentKey;

    // 토스 내부의 주문 ID
    @Column(nullable = false)
    private String tossOrderId;

    // Order와 1:1 관계
    @OneToOne
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    // 결제 금액
    @Column(nullable = false)
    private Long totalAmount;

    // 결제 수단 (카드, 가상계좌 등)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TossPaymentMethod tossPaymentMethod;

    // 결제 상태
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TossPaymentStatus tossPaymentStatus;

    // 요청 시각
    @Column(nullable = false)
    private LocalDateTime requestedAt;

    // 승인 시각
    private LocalDateTime approvedAt;
}

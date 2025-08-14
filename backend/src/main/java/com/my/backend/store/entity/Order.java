package com.my.backend.store.entity;

import com.my.backend.account.entity.Account;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 가맹점 측에서 생성한 주문 ID
    @Column(nullable = false, unique = true)
    private String merchantOrderId;

    // 주문 금액
    @Column(nullable = false)
    private Long amount;

    // 주문 상태 (예: CREATED, PAID, CANCELED 등)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    // 주문 생성 시각
    @Column(nullable = false)
    private LocalDateTime createdAt;

    // 결제 완료 시각
    private LocalDateTime paidAt;

    // 주문자 정보 (Account)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private TossPayment tossPayment;

    // 주문 수량
    @Column(nullable = false)
    private int quantity;

    @Column(nullable = true)
    private String imageUrl;
}

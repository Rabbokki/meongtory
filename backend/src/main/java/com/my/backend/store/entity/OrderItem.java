package com.my.backend.store.entity;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "order_items")
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 주문과 다대일 관계 (Order 1개에 여러 OrderItem 가능)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    // 상품과 다대일 관계 (Product 1개에 여러 OrderItem 가능)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    // 주문한 상품 수량
    @Column(nullable = false)
    private int quantity;

    // 가격 (주문 시점 가격 보존용)
    @Column(nullable = false)
    private Long price;
}

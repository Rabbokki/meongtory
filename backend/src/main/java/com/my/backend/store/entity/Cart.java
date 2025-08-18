package com.my.backend.store.entity;

import com.my.backend.account.entity.Account;
import com.my.backend.store.dto.CartDto;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cart")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cart {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id")
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "naver_product_id")
    private NaverProduct naverProduct;

    @Column(nullable = false)
    @Builder.Default
    private int quantity = 1;

    @Column(nullable = true)
    private String imageUrl;

    public Cart(CartDto dto, Account account) {
        this.quantity = dto.getQuantity();
        if (this.product != null) {
            this.product.setPrice(dto.getProduct().getPrice());
        }
        this.account = account;
    }

    public Cart(Product product, Account account, int count, Long price) {
        this.product = product;
        this.account = account;
        if (this.product != null) {
            this.product.setPrice(price);
        }
        this.quantity = count;
    }

    public Cart(NaverProduct naverProduct, Account account, int count) {
        this.naverProduct = naverProduct;
        this.account = account;
        this.quantity = count;
    }


}
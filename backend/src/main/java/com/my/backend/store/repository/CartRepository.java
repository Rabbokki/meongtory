package com.my.backend.store.repository;

import com.my.backend.store.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * 장바구니 관련 JPA Repository
 */
public interface CartRepository extends JpaRepository<Cart, Integer> {

    // 사용자 ID로 장바구니 전체 조회
    List<Cart> findByUserId(Integer userId);

    // 사용자 ID + 상품 ID로 장바구니 항목 조회 (중복 방지용)
    Optional<Cart> findByUserIdAndProduct_ProductId(Integer userId, Integer productId);

    // 상품 ID로 장바구니 항목들 삭제
    int deleteByProduct_ProductId(Integer productId);
}
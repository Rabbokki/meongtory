package com.my.backend.store.repository;

import com.my.backend.account.entity.Account;
import com.my.backend.store.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * 장바구니 관련 JPA Repository
 */
public interface CartRepository extends JpaRepository<Cart, Integer> {

    // 사용자 ID로 장바구니 전체 조회
    List<Cart> findByUser_Id(Long userId);

    // 사용자 ID로 장바구니 전체 조회 (Product 정보 포함)
    @Query("SELECT c FROM Cart c JOIN FETCH c.product WHERE c.user.id = :userId")
    List<Cart> findByUser_IdWithProduct(@Param("userId") Long userId);

    // 사용자 ID + 상품 ID로 장바구니 항목 조회 (중복 방지용)
    Optional<Cart> findByUser_IdAndProduct_ProductId(Long userId, Integer productId);

    // 상품 ID로 장바구니 항목들 삭제
    int deleteByProduct_ProductId(Integer productId);
}
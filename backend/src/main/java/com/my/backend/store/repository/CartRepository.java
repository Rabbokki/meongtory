package com.my.backend.store.repository;

import com.my.backend.account.entity.Account;
import com.my.backend.store.entity.Cart;
import com.my.backend.store.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * 장바구니 관련 JPA Repository
 */
public interface CartRepository extends JpaRepository<Cart, Long> {

    // 사용자 ID로 장바구니 전체 조회
    List<Cart> findByAccount_Id(Long accountId);

    // 사용자 ID로 장바구니 전체 조회 (Product 정보 포함)
    @Query("SELECT c FROM Cart c JOIN FETCH c.product WHERE c.account.id = :accountId")
    List<Cart> findByAccount_IdWithProduct(@Param("accountId") Long accountId);

    // 사용자 ID + 상품 ID로 장바구니 항목 조회 (중복 방지용)
    Optional<Cart> findByAccount_IdAndProduct_Id(Long accountId, Long productId);

    // 상품 ID로 장바구니 항목들 삭제
    @Transactional
    int deleteByProduct_Id(Long productId);

    // 사용자 ID로 장바구니 전체 삭제 (전체 주문 후 장바구니 비우기용)
    @Transactional
    @Query("DELETE FROM Cart c WHERE c.account.id = :accountId")
    void deleteByAccount_Id(@Param("accountId") Long accountId);

    Cart findByProductAndAccount(Product product, Account account);
}
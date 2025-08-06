package com.my.backend.store.repository;

import com.my.backend.store.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    List<OrderItem> findByOrderOrderId(Integer orderId);
    
    // 상품 ID로 주문 항목들 삭제
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM OrderItem oi WHERE oi.product.productId = :productId")
    int deleteByProductProductId(@Param("productId") Integer productId);
}
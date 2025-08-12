package com.my.backend.store.repository;

import com.my.backend.store.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

// 주문 데이터베이스와 연동하는 인터페이스
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUser_IdOrderByOrderedAtDesc(Long userId);
    List<Order> findAllByOrderByOrderedAtDesc();
    
    // N+1 문제 해결을 위한 JOIN FETCH 쿼리
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.product p WHERE o.user.id = :userId ORDER BY o.orderedAt DESC")
    List<Order> findByUser_IdWithOrderItemsAndProductOrderByOrderedAtDesc(@Param("userId") Long userId);
    
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.product p ORDER BY o.orderedAt DESC")
    List<Order> findAllWithOrderItemsAndProductOrderByOrderedAtDesc();
}
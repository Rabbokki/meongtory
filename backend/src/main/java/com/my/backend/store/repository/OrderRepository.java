package com.my.backend.store.repository;

import com.my.backend.store.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

// 주문 데이터베이스와 연동하는 인터페이스
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUserId(Integer userId);
}

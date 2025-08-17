package com.my.backend.store.repository;

import com.my.backend.store.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Transactional
    int deleteByProduct_Id(Long productId);
}
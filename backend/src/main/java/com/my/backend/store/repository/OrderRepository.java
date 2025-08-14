package com.my.backend.store.repository;

import com.my.backend.store.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    boolean existsByMerchantOrderId(String merchantOrderId);

    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    List<Order> findByAccountId(Long accountId);
}

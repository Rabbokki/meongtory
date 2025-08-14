package com.my.backend.store.repository;

import com.my.backend.store.entity.TossPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TossPaymentRepository extends JpaRepository<TossPayment, Long> {
    Optional<TossPayment> findByOrder_Id(Long orderId);
    Optional<TossPayment> findByPaymentKey(String paymentKey); // tossPaymentKey -> paymentKey
}
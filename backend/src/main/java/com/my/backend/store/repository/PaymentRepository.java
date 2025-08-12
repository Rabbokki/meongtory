package com.my.backend.store.repository;

import com.my.backend.store.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    // 결제 키로 결제 정보 조회
    Optional<Payment> findByPaymentKey(String paymentKey);
    
    // 주문 ID로 결제 정보 조회
    Optional<Payment> findByOrderId(String orderId);
    
    // 결제 상태로 결제 정보 조회
    Optional<Payment> findByOrderIdAndStatus(String orderId, Payment.PaymentStatus status);
} 
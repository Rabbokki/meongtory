package com.my.backend.store.repository;

import com.my.backend.store.entity.TossPayment;
import com.my.backend.store.entity.TossPaymentStatus;
import com.my.backend.store.entity.TossPaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TossPaymentRepository extends JpaRepository<TossPayment, Long> {
    
    // 주문 ID로 결제 정보 조회
    Optional<TossPayment> findByOrder_Id(Long orderId);
    
    // 주문의 merchantOrderId로 결제 정보 조회
    Optional<TossPayment> findByOrder_MerchantOrderId(String merchantOrderId);
    
    // 결제 키로 결제 정보 조회
    Optional<TossPayment> findByPaymentKey(String paymentKey);
    
    // 토스 주문 ID로 결제 정보 조회
    Optional<TossPayment> findByTossOrderId(String tossOrderId);
    
    // 결제 상태로 결제 정보 목록 조회
    List<TossPayment> findByStatus(TossPaymentStatus status);
    
    // 주문 ID와 결제 상태로 결제 정보 조회
    Optional<TossPayment> findByOrder_IdAndStatus(Long orderId, TossPaymentStatus status);
    
    // 결제 키와 결제 상태로 결제 정보 조회
    Optional<TossPayment> findByPaymentKeyAndStatus(String paymentKey, TossPaymentStatus status);
    
    // 특정 기간 내 결제 정보 조회
    @Query("SELECT t FROM TossPayment t WHERE t.createdAt BETWEEN :startDate AND :endDate")
    List<TossPayment> findByCreatedAtBetween(@Param("startDate") java.time.LocalDateTime startDate, 
                                            @Param("endDate") java.time.LocalDateTime endDate);
    
    // 결제 수단별 결제 정보 조회
    List<TossPayment> findByPaymentMethod(TossPaymentMethod paymentMethod);
    
    // 결제 금액 범위로 결제 정보 조회
    @Query("SELECT t FROM TossPayment t WHERE t.totalAmount BETWEEN :minAmount AND :maxAmount")
    List<TossPayment> findByTotalAmountBetween(@Param("minAmount") Long minAmount, 
                                              @Param("maxAmount") Long maxAmount);
}

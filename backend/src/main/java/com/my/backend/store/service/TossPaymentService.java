package com.my.backend.store.service;

import com.my.backend.store.dto.ConfirmPaymentResponse;
import com.my.backend.store.entity.TossPayment;
import com.my.backend.store.entity.TossPaymentStatus;
import com.my.backend.store.repository.TossPaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TossPaymentService {

    private final TossPaymentRepository tossPaymentRepository;

    public ConfirmPaymentResponse getPayment(String backendOrderId) {
        TossPayment payment = tossPaymentRepository.findByOrder_Id(Long.valueOf(backendOrderId))
                .orElseThrow(() -> new IllegalArgumentException("결제 정보가 없습니다."));

        return ConfirmPaymentResponse.builder()
                .paymentKey(payment.getPaymentKey())
                .orderId(payment.getOrder().getId().toString())
                .status(payment.getTossPaymentStatus().name())
                .method(payment.getTossPaymentMethod().name())
                .requestedAt(payment.getRequestedAt().toString())
                .approvedAt(payment.getApprovedAt() != null ? payment.getApprovedAt().toString() : null)
                .totalAmount(payment.getTotalAmount())
                .build();
    }

    @Transactional
    public void changePaymentStatus(String paymentKey, TossPaymentStatus status) {
        TossPayment payment = tossPaymentRepository.findByPaymentKey(paymentKey)
                .orElseThrow(() -> new IllegalArgumentException("결제 정보를 찾을 수 없습니다."));
        payment.setTossPaymentStatus(status);
    }
}
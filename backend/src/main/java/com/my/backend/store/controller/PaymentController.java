package com.my.backend.store.controller;

import com.my.backend.store.entity.Payment;
import com.my.backend.store.service.TossPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final TossPaymentService tossPaymentService;

    /**
     * 결제 승인 요청
     */
    @PostMapping("/confirm")
    public ResponseEntity<Payment> confirmPayment(@RequestBody Map<String, Object> request) {
        String paymentKey = (String) request.get("paymentKey");
        String orderId = (String) request.get("orderId");
        Long amount = Long.valueOf(request.get("amount").toString());

        log.info("결제 승인 요청 - paymentKey: {}, orderId: {}, amount: {}", paymentKey, orderId, amount);
        
        Payment payment = tossPaymentService.approvePayment(paymentKey, orderId, amount);
        return ResponseEntity.ok(payment);
    }

    /**
     * 결제 정보 조회
     */
    @GetMapping("/{paymentKey}")
    public ResponseEntity<Payment> getPayment(@PathVariable String paymentKey) {
        Payment payment = tossPaymentService.getPayment(paymentKey);
        return ResponseEntity.ok(payment);
    }

    /**
     * 결제 취소
     */
    @PostMapping("/{paymentKey}/cancel")
    public ResponseEntity<Payment> cancelPayment(
            @PathVariable String paymentKey,
            @RequestBody Map<String, String> request) {
        String cancelReason = request.get("cancelReason");
        Payment payment = tossPaymentService.cancelPayment(paymentKey, cancelReason);
        return ResponseEntity.ok(payment);
    }

    /**
     * 웹훅 처리 (토스페이먼츠에서 결제 완료 알림)
     * 실제 운영에서는 웹훅 서명 검증이 필요합니다
     */
    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody Map<String, Object> webhookData) {
        log.info("웹훅 수신: {}", webhookData);
        
        try {
            // 웹훅 데이터 처리
            String paymentKey = (String) webhookData.get("paymentKey");
            String orderId = (String) webhookData.get("orderId");
            String status = (String) webhookData.get("status");
            
            log.info("웹훅 처리 - paymentKey: {}, orderId: {}, status: {}", paymentKey, orderId, status);
            
            // TODO: 웹훅 서명 검증 추가
            // TODO: 결제 상태에 따른 비즈니스 로직 처리
            
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            log.error("웹훅 처리 중 오류 발생", e);
            return ResponseEntity.badRequest().body("ERROR");
        }
    }
} 
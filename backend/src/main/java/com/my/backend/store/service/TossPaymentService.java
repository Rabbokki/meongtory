package com.my.backend.store.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.my.backend.store.entity.Payment;
import com.my.backend.store.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TossPaymentService {

    private final PaymentRepository paymentRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${toss.payments.secret-key}")
    private String secretKey;

    private static final String TOSS_PAYMENTS_URL = "https://api.tosspayments.com/v1";

    /**
     * 결제 승인 요청
     */
    public Payment approvePayment(String paymentKey, String orderId, Long amount) {
        try {
            // 1. 결제 승인 API 호출
            String url = TOSS_PAYMENTS_URL + "/payments/" + paymentKey;
            
            Map<String, Object> requestBody = Map.of(
                "orderId", orderId,
                "amount", amount
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Basic " + Base64.getEncoder().encodeToString((secretKey + ":").getBytes()));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                
                // 2. 결제 정보 저장
                Payment payment = Payment.builder()
                    .paymentKey(paymentKey)
                    .orderId(orderId)
                    .amount(amount)
                    .status(Payment.PaymentStatus.SUCCESS)
                    .method((String) responseBody.get("method"))
                    .cardCompany((String) responseBody.get("cardCompany"))
                    .cardNumber((String) responseBody.get("cardNumber"))
                    .approvedAt((String) responseBody.get("approvedAt"))
                    .receiptUrl((String) responseBody.get("receiptUrl"))
                    .build();
                
                return paymentRepository.save(payment);
            } else {
                throw new RuntimeException("결제 승인 실패");
            }
            
        } catch (Exception e) {
            log.error("결제 승인 중 오류 발생", e);
            
            // 3. 실패한 결제 정보 저장
            Payment failedPayment = Payment.builder()
                .paymentKey(paymentKey)
                .orderId(orderId)
                .amount(amount)
                .status(Payment.PaymentStatus.FAILED)
                .failureMessage(e.getMessage())
                .build();
            
            paymentRepository.save(failedPayment);
            throw new RuntimeException("결제 승인 실패: " + e.getMessage());
        }
    }

    /**
     * 결제 정보 조회
     */
    public Payment getPayment(String paymentKey) {
        return paymentRepository.findByPaymentKey(paymentKey)
            .orElseThrow(() -> new RuntimeException("결제 정보를 찾을 수 없습니다."));
    }

    /**
     * 결제 취소
     */
    public Payment cancelPayment(String paymentKey, String cancelReason) {
        try {
            String url = TOSS_PAYMENTS_URL + "/payments/" + paymentKey + "/cancel";
            
            Map<String, Object> requestBody = Map.of(
                "cancelReason", cancelReason
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Basic " + Base64.getEncoder().encodeToString((secretKey + ":").getBytes()));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Payment payment = getPayment(paymentKey);
                payment.cancelled();
                return paymentRepository.save(payment);
            } else {
                throw new RuntimeException("결제 취소 실패");
            }
            
        } catch (Exception e) {
            log.error("결제 취소 중 오류 발생", e);
            throw new RuntimeException("결제 취소 실패: " + e.getMessage());
        }
    }
} 
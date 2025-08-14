// PaymentService.java
package com.my.backend.store.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.my.backend.store.dto.ConfirmPaymentRequest;
import com.my.backend.store.entity.Order;
import com.my.backend.store.entity.TossPayment;
import com.my.backend.store.entity.TossPaymentMethod;
import com.my.backend.store.entity.TossPaymentStatus;
import com.my.backend.store.repository.OrderRepository;
import com.my.backend.store.repository.TossPaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final TossPaymentRepository tossPaymentRepository;
    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public TossPayment savePaymentInfo(ConfirmPaymentRequest request, String tossResponseBody) throws Exception {
        JsonNode jsonNode = objectMapper.readTree(tossResponseBody);

        Order order = orderRepository.findById(Long.valueOf(request.orderId()))
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        TossPayment payment = TossPayment.builder()
                .paymentKey(request.paymentKey())
                .tossOrderId(jsonNode.get("orderId").asText())
                .order(order)
                .totalAmount(jsonNode.get("totalAmount").asLong())
                .tossPaymentMethod(TossPaymentMethod.valueOf(jsonNode.get("method").asText().toUpperCase()))
                .tossPaymentStatus(TossPaymentStatus.DONE)
                .requestedAt(LocalDateTime.parse(jsonNode.get("requestedAt").asText().substring(0, 19)))
                .approvedAt(LocalDateTime.parse(jsonNode.get("approvedAt").asText().substring(0, 19)))
                .build();

        return tossPaymentRepository.save(payment);
    }
}

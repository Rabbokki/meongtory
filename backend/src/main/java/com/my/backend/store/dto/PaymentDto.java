package com.my.backend.store.dto;

import com.my.backend.store.entity.Payment;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDto {
    private Integer paymentId;
    private Integer orderId;
    private Integer amount;
    private String paymentMethod;
    private String transactionId;
    private LocalDateTime paymentDate;
    private Payment.Status status;
}
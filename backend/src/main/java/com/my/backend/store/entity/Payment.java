package com.my.backend.store.entity;

import com.my.backend.account.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String paymentKey; // 토스페이먼츠 결제 키

    @Column(nullable = false, unique = true)
    private String orderId; // 주문 ID

    @Column(nullable = false)
    private Long amount; // 결제 금액

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status; // 결제 상태

    @Column(nullable = false)
    private String method; // 결제 방법 (CARD, TRANSFER 등)

    @Column
    private String cardCompany; // 카드사 (카드 결제인 경우)

    @Column
    private String cardNumber; // 마스킹된 카드번호

    @Column
    private String approvedAt; // 승인 시간

    @Column
    private String failureCode; // 실패 코드

    @Column
    private String failureMessage; // 실패 메시지

    @Column
    private String receiptUrl; // 영수증 URL

    public enum PaymentStatus {
        PENDING,    // 결제 대기
        SUCCESS,    // 결제 성공
        FAILED,     // 결제 실패
        CANCELLED   // 결제 취소
    }

    // 결제 성공 처리
    public void success(String approvedAt, String receiptUrl) {
        this.status = PaymentStatus.SUCCESS;
        this.approvedAt = approvedAt;
        this.receiptUrl = receiptUrl;
    }

    // 결제 실패 처리
    public void failed(String failureCode, String failureMessage) {
        this.status = PaymentStatus.FAILED;
        this.failureCode = failureCode;
        this.failureMessage = failureMessage;
    }

    // 결제 취소 처리
    public void cancelled() {
        this.status = PaymentStatus.CANCELLED;
    }
} 
// TossPaymentStatus.java
package com.my.backend.store.entity;

public enum TossPaymentStatus {
    READY, // 결제 요청 완료
    IN_PROGRESS, // 결제 승인 진행 중
    DONE, // 결제 완료
    CANCELED // 결제 취소
}

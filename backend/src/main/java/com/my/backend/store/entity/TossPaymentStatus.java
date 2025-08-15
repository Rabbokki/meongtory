package com.my.backend.store.entity;

public enum TossPaymentStatus {
    READY("준비됨"),
    IN_PROGRESS("진행중"),
    DONE("완료"),
    CANCELED("취소됨"),
    PARTIAL_CANCELED("부분 취소됨"),
    ABORTED("중단됨"),
    FAILED("실패");

    private final String displayName;

    TossPaymentStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}


package com.my.backend.store.entity;

public enum TossPaymentMethod {
    CARD("카드"),
    EASY_PAY("간편결제"),
    VIRTUAL_ACCOUNT("가상계좌"),
    TRANSFER("계좌이체"),
    MOBILE("휴대폰"),
    GIFT_CERTIFICATE("상품권");

    private final String displayName;

    TossPaymentMethod(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}


package com.my.backend.store.entity;


public enum TargetAnimal {
    ALL("모두"),
    DOG("강아지"),
    CAT("고양이");

    private final String koreanName;

    TargetAnimal(String KoreanName) {
        this.koreanName = KoreanName;
    }
    public String getKoreanName() {
        return koreanName;
    }

}
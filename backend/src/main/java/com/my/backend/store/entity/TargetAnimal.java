package com.my.backend.store.entity;


public enum TargetAnimal {
    ALL("강아지/고양이 (모두)");

    private final String koreanName;

    TargetAnimal(String KoreanName) {
        this.koreanName = KoreanName;
    }
    public String getKoreanName() {
        return koreanName;
    }

}
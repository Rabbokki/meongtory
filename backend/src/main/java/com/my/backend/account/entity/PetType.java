package com.my.backend.account.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum PetType {
    @JsonProperty("강아지")
    DOG,
    @JsonProperty("고양이")
    CAT;

    public String getDisplayName() {
        switch (this) {
            case DOG:
                return "강아지";
            case CAT:
                return "고양이";
            default:
                return "기타";
        }
    }
}

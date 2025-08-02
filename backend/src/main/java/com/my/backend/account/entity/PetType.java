package com.my.backend.account.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

public enum PetType {
    @JsonProperty("강아지")
    DOG,
    @JsonProperty("고양이")
    CAT
}

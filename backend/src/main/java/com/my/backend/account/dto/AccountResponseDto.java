package com.my.backend.account.dto;

import lombok.Getter;

@Getter
public class AccountResponseDto {
    private final Long id;
    private final String email;
    private final String name;
    private final String role;

    public AccountResponseDto(Long id, String email, String name, String role) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
    }
}
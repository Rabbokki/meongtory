package com.my.backend.account.dto;

import com.my.backend.account.entity.PetType;
import lombok.Getter;

@Getter
public class AccountResponseDto {
    private final Long id;
    private final String email;
    private final String name;
    private final String role;
    private final PetType pet;
    private final String petAge;
    private final String petBreeds;

    public AccountResponseDto(Long id, String email, String name, String role, PetType pet, String petAge, String petBreeds) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
        this.pet = pet;
        this.petAge = petAge;
        this.petBreeds = petBreeds;
    }
}
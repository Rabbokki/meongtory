package com.my.backend.account.entity;

import com.my.backend.account.dto.AccountRegisterRequestDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "account")
@Getter
@Setter
@NoArgsConstructor
public class Account extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "account_id")
    private Long id;

    @Column(nullable = true)
    private String name;

    @Column(nullable = true)
    private String email;

    @Column(nullable = true)
    private String password;

    @Column(nullable = false)
    private String role;

    @Enumerated(EnumType.STRING)
    private PetType pet;

    @Column(nullable = true)
    private String petAge;

    @Column(nullable = true)
    private String petBreeds;

    @Column(nullable = true)
    private String provider;

    @Column(nullable = true)
    private String providerId;

    public Account(AccountRegisterRequestDto requestDto) {
        this.name = requestDto.getName();
        this.email = requestDto.getEmail();
        this.password = requestDto.getPassword();
        this.role = requestDto.getRole() != null ? requestDto.getRole() : "USER";
        this.pet = requestDto.getPet();
        this.petAge = requestDto.getPetAge();
        this.petBreeds = requestDto.getPetBreeds();
    }

    // Google 로그인
    public Account(String email, String name, String provider, String providerId) {
        this.email = email;
        this.name = name;
        this.provider = provider;
        this.providerId = providerId;
        this.role = "USER";
        this.password = "";
    }
}

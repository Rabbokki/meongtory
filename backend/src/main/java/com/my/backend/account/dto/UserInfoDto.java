package com.my.backend.account.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@AllArgsConstructor
@Data
@Builder
public class UserInfoDto {
    private Long id;
    private String email;
    private String name;
    private String role;
}

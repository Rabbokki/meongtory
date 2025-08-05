package com.my.backend.visitReservation.dto;

import com.my.backend.visitReservation.entity.AdoptionRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class AdoptionRequestDto {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        private Long petId;
        private String applicantName;
        private String contactNumber;
        private String email;
        private String message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateStatusRequest {
        private AdoptionRequest.AdoptionStatus status;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String applicantName;
        private String contactNumber;
        private String email;
        private String message;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {
        private Long id;
        private Long petId;
        private String petName;
        private String petBreed;
        private Long userId;
        private String userName;
        private String applicantName;
        private String contactNumber;
        private String email;
        private String message;
        private AdoptionRequest.AdoptionStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserResponse {
        private Long id;
        private Long petId;
        private String petName;
        private String petBreed;
        private String applicantName;
        private String contactNumber;
        private String email;
        private String message;
        private AdoptionRequest.AdoptionStatus status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
} 
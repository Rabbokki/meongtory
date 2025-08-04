package com.my.backend.pet.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "Pet")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pet {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pet_id")
    private Long petId;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "breed", nullable = false)
    private String breed;
    
    @Column(name = "age")
    private Integer age;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private Gender gender;
    
    @Column(name = "vaccinated")
    private Boolean vaccinated = false;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "image_url")
    private String imageUrl; // S3 URL 저장
    
    @Column(name = "adopted")
    private Boolean adopted = false;
    
    // 추가 필드들
    @Column(name = "weight")
    private Double weight;
    
    @Column(name = "location")
    private String location;
    
    @Column(name = "microchip_id")
    private String microchipId;
    
    @Column(name = "medical_history", columnDefinition = "TEXT")
    private String medicalHistory;
    
    @Column(name = "vaccinations", columnDefinition = "TEXT")
    private String vaccinations;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "personality", columnDefinition = "TEXT")
    private String personality; // JSON 형태로 저장
    
    @Column(name = "rescue_story", columnDefinition = "TEXT")
    private String rescueStory;
    
    @Column(name = "ai_background_story", columnDefinition = "TEXT")
    private String aiBackgroundStory;
    
    @Column(name = "status")
    private String status = "보호중"; // 보호중, 입양대기, 입양완료 등
    
    @Column(name = "type")
    private String type; // 강아지, 고양이 등
    
    @Column(name = "neutered")
    private Boolean neutered = false;
    
    public enum Gender {
        MALE, FEMALE, UNKNOWN
    }
} 
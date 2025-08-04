package com.my.backend.visitReservation.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "AdoptionRequest")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdoptionRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Key")
    private Long key;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "pet_id")
    private Long petId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status = Status.PENDING;
    
    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @OneToMany(mappedBy = "adoptionRequest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VisitReservation> visitReservations = new ArrayList<>();
    
    public enum Status {
        PENDING, APPROVED, REJECTED, COMPLETED
    }
} 
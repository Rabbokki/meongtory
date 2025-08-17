package com.my.backend.visitReservation.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "VisitReservation")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitReservation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_id")
    private Long reservationId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Key", nullable = false)
    private AdoptionRequest adoptionRequest;
    
    @Column(name = "scheduled_at", nullable = false)
    private LocalDateTime scheduledAt;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private Status status = Status.PENDING;
    
    public enum Status {
        PENDING, CONFIRMED, CANCELLED, COMPLETED
    }
} 
package com.my.backend.visitReservation.entity;

import com.my.backend.account.entity.Account;
import com.my.backend.pet.entity.Pet;
import com.my.backend.account.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "adoption_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdoptionRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Account user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AdoptionStatus status = AdoptionStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(nullable = false)
    private String applicantName;

    @Column(nullable = false)
    private String contactNumber;

    @Column
    private String email;

    public enum AdoptionStatus {
        PENDING("대기중"),
        CONTACTED("연락완료"),
        APPROVED("승인"),
        REJECTED("거절");

        private final String displayName;

        AdoptionStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
} 
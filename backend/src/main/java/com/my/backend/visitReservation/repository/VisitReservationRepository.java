package com.my.backend.visitReservation.repository;

import com.my.backend.visitReservation.entity.VisitReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VisitReservationRepository extends JpaRepository<VisitReservation, Long> {
    
    // 입양 요청별 방문 예약 조회
    List<VisitReservation> findByAdoptionRequestKeyOrderByScheduledAtAsc(Long adoptionRequestKey);
    
    // 상태별 방문 예약 조회
    List<VisitReservation> findByStatus(VisitReservation.Status status);
    
    // 특정 날짜의 방문 예약 조회
    List<VisitReservation> findByScheduledAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // 입양 요청과 상태로 방문 예약 조회
    List<VisitReservation> findByAdoptionRequestKeyAndStatus(Long adoptionRequestKey, VisitReservation.Status status);
    
    // 특정 날짜 범위의 특정 상태 방문 예약 조회
    List<VisitReservation> findByScheduledAtBetweenAndStatus(LocalDateTime startDate, LocalDateTime endDate, VisitReservation.Status status);
    
    // 필터링된 방문 예약 목록 조회 (무한 스크롤용)
    @Query("SELECT vr FROM VisitReservation vr WHERE " +
           "(:adoptionRequestKey IS NULL OR vr.adoptionRequest.key = :adoptionRequestKey) AND " +
           "(:status IS NULL OR vr.status = :status) AND " +
           "(:startDate IS NULL OR vr.scheduledAt >= :startDate) AND " +
           "(:endDate IS NULL OR vr.scheduledAt <= :endDate) " +
           "ORDER BY vr.scheduledAt DESC")
    List<VisitReservation> findVisitReservationsWithFilters(
        @Param("adoptionRequestKey") Long adoptionRequestKey,
        @Param("status") VisitReservation.Status status,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );
    
    // 입양 요청별 방문 예약 목록 (무한 스크롤용)
    @Query("SELECT vr FROM VisitReservation vr WHERE vr.adoptionRequest.key = :adoptionRequestKey " +
           "ORDER BY vr.scheduledAt DESC")
    List<VisitReservation> findVisitReservationsByAdoptionRequestKey(@Param("adoptionRequestKey") Long adoptionRequestKey);
} 
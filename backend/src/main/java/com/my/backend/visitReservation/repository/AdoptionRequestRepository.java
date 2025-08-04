package com.my.backend.visitReservation.repository;

import com.my.backend.visitReservation.entity.AdoptionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdoptionRequestRepository extends JpaRepository<AdoptionRequest, Long> {
    
    // 사용자별 입양 요청 조회
    List<AdoptionRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // 펫별 입양 요청 조회
    List<AdoptionRequest> findByPetIdOrderByCreatedAtDesc(Long petId);
    
    // 상태별 입양 요청 조회
    List<AdoptionRequest> findByStatus(AdoptionRequest.Status status);
    
    // 사용자와 펫으로 입양 요청 조회
    Optional<AdoptionRequest> findByUserIdAndPetId(Long userId, Long petId);
    
    // 사용자별 특정 상태의 입양 요청 조회
    List<AdoptionRequest> findByUserIdAndStatus(Long userId, AdoptionRequest.Status status);
    
    // 펫별 특정 상태의 입양 요청 조회
    List<AdoptionRequest> findByPetIdAndStatus(Long petId, AdoptionRequest.Status status);
    
    // 필터링된 입양 요청 목록 조회 (무한 스크롤용)
    @Query("SELECT ar FROM AdoptionRequest ar WHERE " +
           "(:userId IS NULL OR ar.userId = :userId) AND " +
           "(:petId IS NULL OR ar.petId = :petId) AND " +
           "(:status IS NULL OR ar.status = :status) " +
           "ORDER BY ar.createdAt DESC")
    List<AdoptionRequest> findAdoptionRequestsWithFilters(
        @Param("userId") Long userId,
        @Param("petId") Long petId,
        @Param("status") AdoptionRequest.Status status
    );
    
    // 사용자별 입양 요청 목록 (무한 스크롤용)
    @Query("SELECT ar FROM AdoptionRequest ar WHERE ar.userId = :userId " +
           "ORDER BY ar.createdAt DESC")
    List<AdoptionRequest> findAdoptionRequestsByUserId(@Param("userId") Long userId);
} 
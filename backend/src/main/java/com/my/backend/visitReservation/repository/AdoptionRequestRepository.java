package com.my.backend.visitReservation.repository;

import com.my.backend.visitReservation.entity.AdoptionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdoptionRequestRepository extends JpaRepository<AdoptionRequest, Long> {

    // 사용자별 입양신청 조회
    List<AdoptionRequest> findByUserIdOrderByCreatedAtDesc(Long userId);

    // 펫별 입양신청 조회
    @Query("SELECT ar FROM AdoptionRequest ar WHERE ar.pet.petId = :petId ORDER BY ar.createdAt DESC")
    List<AdoptionRequest> findByPetIdOrderByCreatedAtDesc(@Param("petId") Long petId);

    // 상태별 입양신청 조회
    List<AdoptionRequest> findByStatusOrderByCreatedAtDesc(AdoptionRequest.AdoptionStatus status);

    // 사용자와 펫으로 중복 신청 확인
    @Query("SELECT COUNT(ar) > 0 FROM AdoptionRequest ar WHERE ar.user.id = :userId AND ar.pet.petId = :petId")
    boolean existsByUserIdAndPetId(@Param("userId") Long userId, @Param("petId") Long petId);

    // 관리자용 전체 조회 (페이징 지원)
    @Query("SELECT ar FROM AdoptionRequest ar " +
           "JOIN FETCH ar.pet p " +
           "JOIN FETCH ar.user u " +
           "ORDER BY ar.createdAt DESC")
    List<AdoptionRequest> findAllWithPetAndUser();

    // 특정 사용자의 특정 상태 신청 조회
    List<AdoptionRequest> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, AdoptionRequest.AdoptionStatus status);

    // 특정 펫의 특정 상태 신청 조회
    @Query("SELECT ar FROM AdoptionRequest ar WHERE ar.pet.petId = :petId AND ar.status = :status ORDER BY ar.createdAt DESC")
    List<AdoptionRequest> findByPetIdAndStatusOrderByCreatedAtDesc(@Param("petId") Long petId, @Param("status") AdoptionRequest.AdoptionStatus status);

    // 특정 펫의 모든 입양신청 삭제
    @Modifying
    @Query("DELETE FROM AdoptionRequest ar WHERE ar.pet.petId = :petId")
    int deleteByPetId(@Param("petId") Long petId);
} 
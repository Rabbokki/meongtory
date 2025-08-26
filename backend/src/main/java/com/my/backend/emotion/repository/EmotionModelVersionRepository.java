package com.my.backend.emotion.repository;

import com.my.backend.emotion.entity.EmotionModelVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmotionModelVersionRepository extends JpaRepository<EmotionModelVersion, Long> {

    // 현재 활성 모델 조회
    Optional<EmotionModelVersion> findByIsActiveTrue();

    // 버전명으로 모델 조회
    Optional<EmotionModelVersion> findByVersion(String version);

    // 상태별 모델 목록 조회
    List<EmotionModelVersion> findByStatusOrderByCreatedAtDesc(EmotionModelVersion.ModelStatus status);

    // 최신 모델 목록 조회 (생성일 내림차순)
    List<EmotionModelVersion> findTop10ByOrderByCreatedAtDesc();

    // 준비완료 상태의 모델들 조회 (성능순 정렬)
    @Query("SELECT mv FROM EmotionModelVersion mv WHERE mv.status = 'READY' ORDER BY mv.validationAccuracy DESC NULLS LAST, mv.finalAccuracy DESC NULLS LAST, mv.createdAt DESC")
    List<EmotionModelVersion> findReadyModelsOrderByPerformance();

    // 특정 버전보다 높은 성능의 모델 개수
    @Query("SELECT COUNT(mv) FROM EmotionModelVersion mv WHERE mv.status = 'READY' AND (mv.validationAccuracy > :accuracy OR (mv.validationAccuracy IS NULL AND mv.finalAccuracy > :accuracy))")
    Long countBetterPerformingModels(@Param("accuracy") Double accuracy);

    // 최근 N개의 활성 모델 히스토리
    @Query("SELECT mv FROM EmotionModelVersion mv WHERE mv.isActive = true ORDER BY mv.trainedAt DESC")
    List<EmotionModelVersion> findActiveModelHistory();

    // 검증 정확도 기준 상위 모델들
    @Query("SELECT mv FROM EmotionModelVersion mv WHERE mv.status = 'READY' AND mv.validationAccuracy IS NOT NULL ORDER BY mv.validationAccuracy DESC")
    List<EmotionModelVersion> findTopModelsByValidationAccuracy();

    // 특정 기간 내 생성된 모델들
    @Query("SELECT mv FROM EmotionModelVersion mv WHERE mv.trainedAt BETWEEN :startDate AND :endDate ORDER BY mv.trainedAt DESC")
    List<EmotionModelVersion> findByTrainedAtBetween(@Param("startDate") java.time.LocalDateTime startDate, 
                                                     @Param("endDate") java.time.LocalDateTime endDate);

    // 사용 가능한 롤백 대상 모델들 (현재 활성 모델 제외)
    @Query("SELECT mv FROM EmotionModelVersion mv WHERE mv.status = 'READY' AND mv.isActive = false ORDER BY mv.validationAccuracy DESC NULLS LAST, mv.finalAccuracy DESC NULLS LAST")
    List<EmotionModelVersion> findRollbackCandidates();
}
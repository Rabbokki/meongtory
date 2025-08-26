package com.my.backend.emotion.service;

import com.my.backend.emotion.dto.*;
import com.my.backend.emotion.entity.EmotionModelVersion;
import com.my.backend.emotion.repository.EmotionModelVersionRepository;
import com.my.backend.global.dto.ResponseDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ModelVersionService {

    private final EmotionModelVersionRepository modelVersionRepository;

    // 모든 모델 버전 조회
    public ResponseDto<List<ModelVersionDto>> getAllVersions() {
        try {
            List<EmotionModelVersion> versions = modelVersionRepository.findTop10ByOrderByCreatedAtDesc();
            List<ModelVersionDto> versionDtos = versions.stream()
                    .map(ModelVersionDto::fromEntity)
                    .collect(Collectors.toList());
            
            return ResponseDto.success(versionDtos);
        } catch (Exception e) {
            log.error("모델 버전 목록 조회 실패", e);
            return ResponseDto.fail("MODEL_VERSION_ERROR", "모델 버전 목록 조회에 실패했습니다.");
        }
    }

    // 현재 활성 모델 조회
    public ResponseDto<ModelVersionDto> getActiveVersion() {
        try {
            Optional<EmotionModelVersion> activeVersion = modelVersionRepository.findByIsActiveTrue();
            
            if (activeVersion.isPresent()) {
                ModelVersionDto dto = ModelVersionDto.fromEntity(activeVersion.get());
                return ResponseDto.success(dto);
            } else {
                return ResponseDto.fail("NO_ACTIVE_MODEL", "현재 활성 모델이 없습니다.");
            }
        } catch (Exception e) {
            log.error("활성 모델 조회 실패", e);
            return ResponseDto.fail("ACTIVE_MODEL_ERROR", "활성 모델 조회에 실패했습니다.");
        }
    }

    // 특정 모델 버전 조회
    public ResponseDto<ModelVersionDto> getVersionById(Long versionId) {
        try {
            Optional<EmotionModelVersion> version = modelVersionRepository.findById(versionId);
            
            if (version.isPresent()) {
                ModelVersionDto dto = ModelVersionDto.fromEntity(version.get());
                return ResponseDto.success(dto);
            } else {
                return ResponseDto.fail("VERSION_NOT_FOUND", "해당 모델 버전을 찾을 수 없습니다.");
            }
        } catch (Exception e) {
            log.error("모델 버전 조회 실패: {}", versionId, e);
            return ResponseDto.fail("VERSION_QUERY_ERROR", "모델 버전 조회에 실패했습니다.");
        }
    }

    // 새 모델 버전 생성 및 등록
    @Transactional
    public ResponseDto<ModelVersionDto> createVersion(ModelVersionCreateRequestDto request) {
        try {
            // 버전 중복 체크
            Optional<EmotionModelVersion> existingVersion = modelVersionRepository.findByVersion(request.getVersion());
            if (existingVersion.isPresent()) {
                return ResponseDto.fail("VERSION_ALREADY_EXISTS", "이미 존재하는 모델 버전입니다: " + request.getVersion());
            }

            // 새 버전 생성
            EmotionModelVersion newVersion = EmotionModelVersion.builder()
                    .version(request.getVersion())
                    .modelPath(request.getModelPath())
                    .description(request.getDescription())
                    .feedbackSampleCount(request.getFeedbackSampleCount())
                    .learningRate(request.getLearningRate())
                    .numEpochs(request.getNumEpochs())
                    .finalAccuracy(request.getFinalAccuracy())
                    .finalLoss(request.getFinalLoss())
                    .validationAccuracy(request.getValidationAccuracy())
                    .f1Score(request.getF1Score())
                    .isActive(false)
                    .status(EmotionModelVersion.ModelStatus.READY)
                    .trainedAt(LocalDateTime.now())
                    .performanceMetrics(request.getPerformanceMetrics())
                    .trainingHistory(request.getTrainingHistory())
                    .build();

            EmotionModelVersion savedVersion = modelVersionRepository.save(newVersion);
            
            log.info("새 모델 버전 생성 완료: {}", savedVersion.getVersion());
            return ResponseDto.success(ModelVersionDto.fromEntity(savedVersion));
            
        } catch (Exception e) {
            log.error("모델 버전 생성 실패", e);
            return ResponseDto.fail("VERSION_CREATE_ERROR", "모델 버전 생성에 실패했습니다.");
        }
    }

    // 모델 버전 활성화 (다른 버전들은 자동으로 비활성화)
    @Transactional
    public ResponseDto<ModelVersionDto> activateVersion(Long versionId) {
        try {
            Optional<EmotionModelVersion> versionOpt = modelVersionRepository.findById(versionId);
            if (versionOpt.isEmpty()) {
                return ResponseDto.fail("VERSION_NOT_FOUND", "해당 모델 버전을 찾을 수 없습니다.");
            }

            EmotionModelVersion targetVersion = versionOpt.get();
            
            if (targetVersion.getStatus() != EmotionModelVersion.ModelStatus.READY) {
                return ResponseDto.fail("MODEL_NOT_READY", "준비 상태가 아닌 모델은 활성화할 수 없습니다.");
            }

            // 기존 활성 모델들 비활성화
            Optional<EmotionModelVersion> currentActive = modelVersionRepository.findByIsActiveTrue();
            if (currentActive.isPresent()) {
                currentActive.get().deactivate();
                modelVersionRepository.save(currentActive.get());
                log.info("기존 활성 모델 비활성화: {}", currentActive.get().getVersion());
            }

            // 새 모델 활성화
            targetVersion.activate();
            EmotionModelVersion savedVersion = modelVersionRepository.save(targetVersion);
            
            log.info("모델 버전 활성화 완료: {}", savedVersion.getVersion());
            return ResponseDto.success(ModelVersionDto.fromEntity(savedVersion));
            
        } catch (Exception e) {
            log.error("모델 버전 활성화 실패: {}", versionId, e);
            return ResponseDto.fail("ACTIVATION_ERROR", "모델 버전 활성화에 실패했습니다.");
        }
    }

    // 모델 롤백 (이전 버전으로 되돌리기)
    @Transactional
    public ResponseDto<ModelVersionDto> rollbackToVersion(ModelRollbackRequestDto request) {
        try {
            Optional<EmotionModelVersion> targetVersionOpt = modelVersionRepository.findById(request.getVersionId());
            if (targetVersionOpt.isEmpty()) {
                    return ResponseDto.fail("VERSION_NOT_FOUND", "롤백할 모델 버전을 찾을 수 없습니다.");
            }

            EmotionModelVersion targetVersion = targetVersionOpt.get();
            
            if (targetVersion.getStatus() != EmotionModelVersion.ModelStatus.READY) {
                return ResponseDto.fail("MODEL_NOT_READY", "롤백 대상 모델의 상태가 준비되지 않았습니다.");
            }

            if (targetVersion.getIsActive()) {
                return ResponseDto.fail("ALREADY_ACTIVE", "이미 활성화된 모델입니다.");
            }

            // 현재 활성 모델 비활성화
            Optional<EmotionModelVersion> currentActive = modelVersionRepository.findByIsActiveTrue();
            if (currentActive.isPresent()) {
                currentActive.get().deactivate();
                modelVersionRepository.save(currentActive.get());
            }

            // 롤백 대상 모델 활성화
            targetVersion.activate();
            if (request.getReason() != null) {
                targetVersion.setDescription(targetVersion.getDescription() + " [롤백: " + request.getReason() + "]");
            }
            
            EmotionModelVersion savedVersion = modelVersionRepository.save(targetVersion);
            
            log.info("모델 롤백 완료: {} -> {}", 
                    currentActive.map(EmotionModelVersion::getVersion).orElse("없음"), 
                    savedVersion.getVersion());
            
            return ResponseDto.success(ModelVersionDto.fromEntity(savedVersion));
            
        } catch (Exception e) {
            log.error("모델 롤백 실패: {}", request.getVersionId(), e);
            return ResponseDto.fail("ROLLBACK_ERROR", "모델 롤백에 실패했습니다.");
        }
    }

    // 모델 버전 성능 비교
    public ResponseDto<ModelVersionComparisonDto> compareVersions() {
        try {
            Optional<EmotionModelVersion> currentActive = modelVersionRepository.findByIsActiveTrue();
            List<EmotionModelVersion> readyVersions = modelVersionRepository.findReadyModelsOrderByPerformance();
            
            if (readyVersions.isEmpty()) {
                return ResponseDto.fail("NO_MODELS_TO_COMPARE", "비교할 모델 버전이 없습니다.");
            }

            // 성능 통계 계산
            Double bestValidationAccuracy = readyVersions.stream()
                    .filter(v -> v.getValidationAccuracy() != null)
                    .mapToDouble(EmotionModelVersion::getValidationAccuracy)
                    .max()
                    .orElse(0.0);

            Double averageValidationAccuracy = readyVersions.stream()
                    .filter(v -> v.getValidationAccuracy() != null)
                    .mapToDouble(EmotionModelVersion::getValidationAccuracy)
                    .average()
                    .orElse(0.0);

            Double currentValidationAccuracy = currentActive
                    .map(EmotionModelVersion::getValidationAccuracy)
                    .orElse(0.0);

            Long betterPerformingCount = modelVersionRepository.countBetterPerformingModels(currentValidationAccuracy);

            // 추천 메시지 생성
            String recommendation = generatePerformanceRecommendation(
                    currentValidationAccuracy, bestValidationAccuracy, betterPerformingCount);

            // 비교 결과 구성
            ModelVersionComparisonDto.PerformanceComparisonDto performanceComparison = 
                    ModelVersionComparisonDto.PerformanceComparisonDto.builder()
                            .bestValidationAccuracy(bestValidationAccuracy)
                            .currentValidationAccuracy(currentValidationAccuracy)
                            .averageValidationAccuracy(averageValidationAccuracy)
                            .totalVersions(readyVersions.size())
                            .betterPerformingVersions(betterPerformingCount.intValue())
                            .recommendation(recommendation)
                            .build();

            ModelVersionComparisonDto comparisonDto = ModelVersionComparisonDto.builder()
                    .currentModel(currentActive.map(ModelVersionDto::fromEntity).orElse(null))
                    .availableVersions(readyVersions.stream()
                            .map(ModelVersionDto::fromEntity)
                            .collect(Collectors.toList()))
                    .performanceComparison(performanceComparison)
                    .build();

            return ResponseDto.success(comparisonDto);
            
        } catch (Exception e) {
            log.error("모델 버전 비교 실패", e);
            return ResponseDto.fail("COMPARISON_ERROR", "모델 버전 비교에 실패했습니다.");
        }
    }

    // 롤백 가능한 모델 목록 조회
    public ResponseDto<List<ModelVersionDto>> getRollbackCandidates() {
        try {
            List<EmotionModelVersion> candidates = modelVersionRepository.findRollbackCandidates();
            List<ModelVersionDto> candidateDtos = candidates.stream()
                    .map(ModelVersionDto::fromEntity)
                    .collect(Collectors.toList());
            
            return ResponseDto.success(candidateDtos);
        } catch (Exception e) {
            log.error("롤백 후보 조회 실패", e);
            return ResponseDto.fail("ROLLBACK_CANDIDATES_ERROR", "롤백 후보 조회에 실패했습니다.");
        }
    }

    // 성능 기반 추천 메시지 생성
    private String generatePerformanceRecommendation(Double current, Double best, Long betterCount) {
        if (current == null || current == 0.0) {
            return "현재 활성 모델의 성능 정보가 없습니다. 성능 평가를 실시하세요.";
        }
        
        if (betterCount == 0) {
            return "현재 모델이 최고 성능을 보이고 있습니다.";
        }
        
        double performanceGap = (best - current) * 100;
        if (performanceGap > 5.0) {
            return String.format("더 좋은 성능의 모델이 %d개 있습니다. 최고 모델 대비 %.2f%%p 낮습니다. 롤백을 고려하세요.", 
                    betterCount, performanceGap);
        } else if (performanceGap > 2.0) {
            return String.format("현재 모델 성능이 양호합니다. 최고 모델 대비 %.2f%%p 차이입니다.", performanceGap);
        } else {
            return "현재 모델이 최적 성능에 근접합니다.";
        }
    }

    // 모델 상태를 에러로 변경
    @Transactional
    public ResponseDto<Void> markVersionAsError(Long versionId, String errorMessage) {
        try {
            Optional<EmotionModelVersion> versionOpt = modelVersionRepository.findById(versionId);
            if (versionOpt.isEmpty()) {
                return ResponseDto.fail("VERSION_NOT_FOUND", "해당 모델 버전을 찾을 수 없습니다.");
            }

            EmotionModelVersion version = versionOpt.get();
            version.markAsError(errorMessage);
            modelVersionRepository.save(version);
            
            log.warn("모델 버전 에러 상태로 변경: {} - {}", version.getVersion(), errorMessage);
            return ResponseDto.success(null);
            
        } catch (Exception e) {
            log.error("모델 에러 상태 변경 실패: {}", versionId, e);
            return ResponseDto.fail("STATE_CHANGE_ERROR", "모델 상태 변경에 실했습니다.");
        }
    }
}
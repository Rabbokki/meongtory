package com.my.backend.emotion.controller;

import com.my.backend.emotion.dto.*;
import com.my.backend.emotion.service.ModelVersionService;
import com.my.backend.global.dto.ResponseDto;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/emotion/model-version")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"*"})
public class ModelVersionController {

    private final ModelVersionService modelVersionService;

    // 모든 모델 버전 조회
    @GetMapping
    public ResponseEntity<ResponseDto<List<ModelVersionDto>>> getAllVersions() {
        log.info("모델 버전 목록 조회 요청");
        ResponseDto<List<ModelVersionDto>> response = modelVersionService.getAllVersions();
        return ResponseEntity.ok(response);
    }

    // 현재 활성 모델 조회
    @GetMapping("/active")
    public ResponseEntity<ResponseDto<ModelVersionDto>> getActiveVersion() {
        log.info("활성 모델 조회 요청");
        ResponseDto<ModelVersionDto> response = modelVersionService.getActiveVersion();
        return ResponseEntity.ok(response);
    }

    // 특정 모델 버전 조회
    @GetMapping("/{versionId}")
    public ResponseEntity<ResponseDto<ModelVersionDto>> getVersionById(@PathVariable Long versionId) {
        log.info("모델 버전 조회 요청: {}", versionId);
        ResponseDto<ModelVersionDto> response = modelVersionService.getVersionById(versionId);
        return ResponseEntity.ok(response);
    }

    // 새 모델 버전 생성
    @PostMapping
    public ResponseEntity<ResponseDto<ModelVersionDto>> createVersion(
            @Valid @RequestBody ModelVersionCreateRequestDto request) {
        log.info("새 모델 버전 생성 요청: {}", request.getVersion());
        ResponseDto<ModelVersionDto> response = modelVersionService.createVersion(request);
        return ResponseEntity.ok(response);
    }

    // 모델 버전 활성화
    @PostMapping("/{versionId}/activate")
    public ResponseEntity<ResponseDto<ModelVersionDto>> activateVersion(@PathVariable Long versionId) {
        log.info("모델 버전 활성화 요청: {}", versionId);
        ResponseDto<ModelVersionDto> response = modelVersionService.activateVersion(versionId);
        return ResponseEntity.ok(response);
    }

    // 모델 롤백
    @PostMapping("/rollback")
    public ResponseEntity<ResponseDto<ModelVersionDto>> rollbackToVersion(
            @Valid @RequestBody ModelRollbackRequestDto request) {
        log.info("모델 롤백 요청: {} - {}", request.getVersionId(), request.getReason());
        ResponseDto<ModelVersionDto> response = modelVersionService.rollbackToVersion(request);
        return ResponseEntity.ok(response);
    }

    // 모델 버전 성능 비교
    @GetMapping("/comparison")
    public ResponseEntity<ResponseDto<ModelVersionComparisonDto>> compareVersions() {
        log.info("모델 버전 성능 비교 요청");
        ResponseDto<ModelVersionComparisonDto> response = modelVersionService.compareVersions();
        return ResponseEntity.ok(response);
    }

    // 롤백 가능한 모델 목록 조회
    @GetMapping("/rollback-candidates")
    public ResponseEntity<ResponseDto<List<ModelVersionDto>>> getRollbackCandidates() {
        log.info("롤백 후보 조회 요청");
        ResponseDto<List<ModelVersionDto>> response = modelVersionService.getRollbackCandidates();
        return ResponseEntity.ok(response);
    }

    // 모델 상태를 에러로 변경
    @PostMapping("/{versionId}/mark-error")
    public ResponseEntity<ResponseDto<Void>> markVersionAsError(
            @PathVariable Long versionId, 
            @RequestParam(required = false) String errorMessage) {
        log.info("모델 에러 상태 변경 요청: {} - {}", versionId, errorMessage);
        ResponseDto<Void> response = modelVersionService.markVersionAsError(versionId, errorMessage);
        return ResponseEntity.ok(response);
    }
}
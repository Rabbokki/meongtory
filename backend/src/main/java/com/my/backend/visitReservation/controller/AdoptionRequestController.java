package com.my.backend.visitReservation.controller;

import com.my.backend.global.dto.ResponseDto;
import com.my.backend.global.security.user.UserDetailsImpl;
import com.my.backend.visitReservation.dto.AdoptionRequestDto;
import com.my.backend.visitReservation.entity.AdoptionRequest;
import com.my.backend.visitReservation.service.AdoptionRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adoption-requests")
@RequiredArgsConstructor
@Slf4j
public class AdoptionRequestController {

    private final AdoptionRequestService adoptionRequestService;

    // 입양신청 생성
    @PostMapping
    public ResponseEntity<ResponseDto<?>> createAdoptionRequest(@RequestBody AdoptionRequestDto.CreateRequest request) {
        try {
            // 현재 로그인한 사용자 ID 가져오기
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getAccount().getId();
            
            AdoptionRequestDto.Response response = adoptionRequestService.createAdoptionRequest(request, userId);
            return ResponseEntity.ok(ResponseDto.success(response));
        } catch (Exception e) {
            log.error("입양신청 생성 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseDto.fail("ADOPTION_REQUEST_CREATE_FAILED", e.getMessage()));
        }
    }

    // 관리자용 전체 입양신청 조회
    @GetMapping
    public ResponseEntity<ResponseDto<?>> getAllAdoptionRequests() {
        try {
            List<AdoptionRequestDto.Response> requests = adoptionRequestService.getAllAdoptionRequests();
            return ResponseEntity.ok(ResponseDto.success(requests));
        } catch (Exception e) {
            log.error("입양신청 목록 조회 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseDto.fail("ADOPTION_REQUEST_LIST_FAILED", e.getMessage()));
        }
    }

    // 사용자별 입양신청 조회
    @GetMapping("/user")
    public ResponseEntity<ResponseDto<?>> getUserAdoptionRequests() {
        try {
            // 현재 로그인한 사용자 ID 가져오기
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getAccount().getId();
            
            List<AdoptionRequestDto.UserResponse> requests = adoptionRequestService.getUserAdoptionRequests(userId);
            return ResponseEntity.ok(ResponseDto.success(requests));
        } catch (Exception e) {
            log.error("사용자 입양신청 목록 조회 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseDto.fail("USER_ADOPTION_REQUEST_LIST_FAILED", e.getMessage()));
        }
    }

    // 특정 입양신청 조회
    @GetMapping("/{requestId}")
    public ResponseEntity<ResponseDto<?>> getAdoptionRequest(@PathVariable Long requestId) {
        try {
            AdoptionRequestDto.Response request = adoptionRequestService.getAdoptionRequest(requestId);
            return ResponseEntity.ok(ResponseDto.success(request));
        } catch (Exception e) {
            log.error("입양신청 조회 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseDto.fail("ADOPTION_REQUEST_GET_FAILED", e.getMessage()));
        }
    }

    // 상태 변경
    @PutMapping("/{requestId}/status")
    public ResponseEntity<ResponseDto<?>> updateAdoptionRequestStatus(
            @PathVariable Long requestId,
            @RequestBody AdoptionRequestDto.UpdateStatusRequest request) {
        try {
            AdoptionRequestDto.Response response = adoptionRequestService.updateAdoptionRequestStatus(requestId, request.getStatus());
            return ResponseEntity.ok(ResponseDto.success(response));
        } catch (Exception e) {
            log.error("입양신청 상태 변경 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseDto.fail("ADOPTION_REQUEST_STATUS_UPDATE_FAILED", e.getMessage()));
        }
    }

    // 상태별 조회
    @GetMapping("/status/{status}")
    public ResponseEntity<ResponseDto<?>> getAdoptionRequestsByStatus(@PathVariable AdoptionRequest.AdoptionStatus status) {
        try {
            List<AdoptionRequestDto.Response> requests = adoptionRequestService.getAdoptionRequestsByStatus(status);
            return ResponseEntity.ok(ResponseDto.success(requests));
        } catch (Exception e) {
            log.error("상태별 입양신청 조회 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseDto.fail("ADOPTION_REQUEST_STATUS_LIST_FAILED", e.getMessage()));
        }
    }

    // 입양신청 수정 (사용자용)
    @PutMapping("/{requestId}")
    public ResponseEntity<ResponseDto<?>> updateAdoptionRequest(
            @PathVariable Long requestId,
            @RequestBody AdoptionRequestDto.UpdateRequest request) {
        try {
            // 현재 로그인한 사용자 ID 가져오기
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Long userId = userDetails.getAccount().getId();
            
            AdoptionRequestDto.Response response = adoptionRequestService.updateAdoptionRequest(requestId, userId, request);
            return ResponseEntity.ok(ResponseDto.success(response));
        } catch (Exception e) {
            log.error("입양신청 수정 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseDto.fail("ADOPTION_REQUEST_UPDATE_FAILED", e.getMessage()));
        }
    }
} 
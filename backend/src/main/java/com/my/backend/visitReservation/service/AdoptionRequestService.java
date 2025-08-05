package com.my.backend.visitReservation.service;

import com.my.backend.account.entity.Account;
import com.my.backend.account.repository.AccountRepository;
import com.my.backend.global.dto.ResponseDto;
import com.my.backend.pet.entity.Pet;
import com.my.backend.pet.repository.PetRepository;
import com.my.backend.visitReservation.dto.AdoptionRequestDto;
import com.my.backend.visitReservation.entity.AdoptionRequest;
import com.my.backend.visitReservation.repository.AdoptionRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AdoptionRequestService {

    private final AdoptionRequestRepository adoptionRequestRepository;
    private final PetRepository petRepository;
    private final AccountRepository accountRepository;

    // 입양신청 생성
    @Transactional
    public AdoptionRequestDto.Response createAdoptionRequest(AdoptionRequestDto.CreateRequest request, Long userId) {
        // 중복 신청 확인
        if (adoptionRequestRepository.existsByUserIdAndPetId(userId, request.getPetId())) {
            throw new RuntimeException("이미 입양신청을 하신 동물입니다.");
        }

        // 펫과 사용자 조회
        Pet pet = petRepository.findById(request.getPetId())
                .orElseThrow(() -> new RuntimeException("동물을 찾을 수 없습니다."));
        
        Account user = accountRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        // 입양신청 생성
        AdoptionRequest adoptionRequest = new AdoptionRequest();
        adoptionRequest.setPet(pet);
        adoptionRequest.setUser(user);
        adoptionRequest.setApplicantName(request.getApplicantName());
        adoptionRequest.setContactNumber(request.getContactNumber());
        adoptionRequest.setEmail(request.getEmail());
        adoptionRequest.setMessage(request.getMessage());
        adoptionRequest.setStatus(AdoptionRequest.AdoptionStatus.PENDING);

        AdoptionRequest savedRequest = adoptionRequestRepository.save(adoptionRequest);
        return convertToResponse(savedRequest);
    }

    // 관리자용 전체 입양신청 조회
    public List<AdoptionRequestDto.Response> getAllAdoptionRequests() {
        List<AdoptionRequest> requests = adoptionRequestRepository.findAllWithPetAndUser();
        return requests.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 사용자별 입양신청 조회
    public List<AdoptionRequestDto.UserResponse> getUserAdoptionRequests(Long userId) {
        List<AdoptionRequest> requests = adoptionRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return requests.stream()
                .map(this::convertToUserResponse)
                .collect(Collectors.toList());
    }

    // 상태 변경
    @Transactional
    public AdoptionRequestDto.Response updateAdoptionRequestStatus(Long requestId, AdoptionRequest.AdoptionStatus status) {
        AdoptionRequest request = adoptionRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("입양신청을 찾을 수 없습니다."));

        request.setStatus(status);
        AdoptionRequest updatedRequest = adoptionRequestRepository.save(request);
        return convertToResponse(updatedRequest);
    }

    // 특정 입양신청 조회
    public AdoptionRequestDto.Response getAdoptionRequest(Long requestId) {
        AdoptionRequest request = adoptionRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("입양신청을 찾을 수 없습니다."));
        return convertToResponse(request);
    }

    // 상태별 조회
    public List<AdoptionRequestDto.Response> getAdoptionRequestsByStatus(AdoptionRequest.AdoptionStatus status) {
        List<AdoptionRequest> requests = adoptionRequestRepository.findByStatusOrderByCreatedAtDesc(status);
        return requests.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 입양신청 수정 (사용자용)
    @Transactional
    public AdoptionRequestDto.Response updateAdoptionRequest(Long requestId, Long userId, AdoptionRequestDto.UpdateRequest request) {
        AdoptionRequest adoptionRequest = adoptionRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("입양신청을 찾을 수 없습니다."));

        // 본인이 신청한 입양신청인지 확인
        if (!adoptionRequest.getUser().getId().equals(userId)) {
            throw new RuntimeException("본인이 신청한 입양신청만 수정할 수 있습니다.");
        }

        // 대기중인 입양신청만 수정 가능
        if (adoptionRequest.getStatus() != AdoptionRequest.AdoptionStatus.PENDING) {
            throw new RuntimeException("대기중인 입양신청만 수정할 수 있습니다.");
        }

        // 정보 업데이트
        adoptionRequest.setApplicantName(request.getApplicantName());
        adoptionRequest.setContactNumber(request.getContactNumber());
        adoptionRequest.setEmail(request.getEmail());
        adoptionRequest.setMessage(request.getMessage());

        AdoptionRequest updatedRequest = adoptionRequestRepository.save(adoptionRequest);
        return convertToResponse(updatedRequest);
    }

    // DTO 변환 메서드들
    private AdoptionRequestDto.Response convertToResponse(AdoptionRequest request) {
        return new AdoptionRequestDto.Response(
                request.getId(),
                request.getPet().getPetId(),
                request.getPet().getName(),
                request.getPet().getBreed(),
                request.getUser().getId(),
                request.getUser().getName(),
                request.getApplicantName(),
                request.getContactNumber(),
                request.getEmail(),
                request.getMessage(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getUpdatedAt()
        );
    }

    private AdoptionRequestDto.UserResponse convertToUserResponse(AdoptionRequest request) {
        return new AdoptionRequestDto.UserResponse(
                request.getId(),
                request.getPet().getPetId(),
                request.getPet().getName(),
                request.getPet().getBreed(),
                request.getApplicantName(),
                request.getContactNumber(),
                request.getEmail(),
                request.getMessage(),
                request.getStatus(),
                request.getCreatedAt(),
                request.getUpdatedAt()
        );
    }
} 
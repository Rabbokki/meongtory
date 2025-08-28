package com.my.backend.pet.service;

import com.my.backend.account.entity.Account;
import com.my.backend.account.repository.AccountRepository;
import com.my.backend.pet.dto.MyPetListResponseDto;
import com.my.backend.pet.dto.MyPetRequestDto;
import com.my.backend.pet.dto.MyPetResponseDto;
import com.my.backend.pet.dto.MyPetSearchDto;
import com.my.backend.pet.entity.MyPet;
import com.my.backend.pet.repository.MyPetRepository;
import com.my.backend.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MyPetService {

    private final MyPetRepository myPetRepository;
    private final AccountRepository accountRepository;
    private final S3Service s3Service;

    // 펫 등록
    public MyPetResponseDto registerMyPet(Long ownerId, MyPetRequestDto requestDto) {
        Account owner = accountRepository.findById(ownerId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        MyPet myPet = MyPet.builder()
                .owner(owner)
                .name(requestDto.getName())
                .breed(requestDto.getBreed())
                .age(requestDto.getAge())
                .gender(requestDto.getGender())
                .type(requestDto.getType())
                .weight(requestDto.getWeight())
                .imageUrl(requestDto.getImageUrl())
                .medicalHistory(requestDto.getMedicalHistory())
                .vaccinations(requestDto.getVaccinations())
                .notes(requestDto.getNotes())
                .microchipId(requestDto.getMicrochipId())
                .specialNeeds(requestDto.getSpecialNeeds())
                .build();

        MyPet savedPet = myPetRepository.save(myPet);
        return convertToResponseDto(savedPet);
    }

    // 펫 수정
    public MyPetResponseDto updateMyPet(Long myPetId, Long ownerId, MyPetRequestDto requestDto) {
        MyPet myPet = myPetRepository.findByMyPetIdAndOwnerId(myPetId, ownerId)
                .orElseThrow(() -> new IllegalArgumentException("펫을 찾을 수 없습니다."));

        myPet.setName(requestDto.getName());
        myPet.setBreed(requestDto.getBreed());
        myPet.setAge(requestDto.getAge());
        myPet.setGender(requestDto.getGender());
        myPet.setType(requestDto.getType());
        myPet.setWeight(requestDto.getWeight());
        myPet.setImageUrl(requestDto.getImageUrl());
        myPet.setMedicalHistory(requestDto.getMedicalHistory());
        myPet.setVaccinations(requestDto.getVaccinations());
        myPet.setNotes(requestDto.getNotes());
        myPet.setMicrochipId(requestDto.getMicrochipId());
        myPet.setSpecialNeeds(requestDto.getSpecialNeeds());

        MyPet updatedPet = myPetRepository.save(myPet);
        return convertToResponseDto(updatedPet);
    }

    // 펫 삭제
    public void deleteMyPet(Long myPetId, Long ownerId) {
        if (!myPetRepository.existsByMyPetIdAndOwnerId(myPetId, ownerId)) {
            throw new IllegalArgumentException("펫을 찾을 수 없습니다.");
        }
        myPetRepository.deleteById(myPetId);
    }

    // 사용자의 모든 펫 조회 (DTO 반환)
    public MyPetListResponseDto getMyPets(Long ownerId) {
        List<MyPet> myPets = myPetRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId);
        Long totalCount = myPetRepository.countByOwnerId(ownerId);

        List<MyPetResponseDto> responseDtos = myPets.stream()
                .map(this::convertToResponseDto)
                .collect(Collectors.toList());

        return MyPetListResponseDto.builder()
                .myPets(responseDtos)
                .totalCount(totalCount)
                .build();
    }
    


    // 특정 펫 조회
    public MyPetResponseDto getMyPet(Long myPetId, Long ownerId) {
        MyPet myPet = myPetRepository.findByMyPetIdAndOwnerId(myPetId, ownerId)
                .orElseThrow(() -> new IllegalArgumentException("펫을 찾을 수 없습니다."));
        return convertToResponseDto(myPet);
    }

    // 내부 통신용 펫 조회 (AI 서비스에서 사용)
    public MyPetResponseDto getMyPetInternal(Long myPetId) {
        MyPet myPet = myPetRepository.findById(myPetId)
                .orElseThrow(() -> new IllegalArgumentException("펫을 찾을 수 없습니다."));
        return convertToResponseDto(myPet);
    }

    // 이미지 업로드
    public String uploadPetImage(MultipartFile file) {
        return s3Service.uploadMyPetImage(file);
    }

    // MyPet 검색 (자동완성용)
    @Transactional(readOnly = true)
    public List<MyPetSearchDto> searchMyPets(Long ownerId, String keyword) {
        List<MyPet> myPets;
        
        if (keyword == null || keyword.trim().isEmpty()) {
            // 빈 키워드일 때는 모든 MyPet 반환
            myPets = myPetRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId);
        } else {
            // 키워드가 있을 때는 이름으로 검색
            myPets = myPetRepository.findByOwnerIdAndNameContaining(ownerId, keyword.trim());
        }
        
        return myPets.stream()
                .map(this::convertToSearchDto)
                .collect(Collectors.toList());
    }

    // DTO 변환
    private MyPetResponseDto convertToResponseDto(MyPet myPet) {
        return MyPetResponseDto.builder()
                .myPetId(myPet.getMyPetId())
                .name(myPet.getName())
                .breed(myPet.getBreed())
                .age(myPet.getAge())
                .gender(myPet.getGender())
                .type(myPet.getType())
                .weight(myPet.getWeight())
                .imageUrl(myPet.getImageUrl())
                .createdAt(myPet.getCreatedAt())
                .updatedAt(myPet.getUpdatedAt())
                .medicalHistory(myPet.getMedicalHistory())
                .vaccinations(myPet.getVaccinations())
                .notes(myPet.getNotes())
                .microchipId(myPet.getMicrochipId())
                .specialNeeds(myPet.getSpecialNeeds())
                .build();
    }

    // 검색용 DTO 변환
    private MyPetSearchDto convertToSearchDto(MyPet myPet) {
        return MyPetSearchDto.builder()
                .myPetId(myPet.getMyPetId())
                .name(myPet.getName())
                .breed(myPet.getBreed())
                .type(myPet.getType())
                .imageUrl(myPet.getImageUrl())
                .build();
    }
} 
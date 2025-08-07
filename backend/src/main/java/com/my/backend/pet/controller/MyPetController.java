package com.my.backend.pet.controller;

import com.my.backend.global.dto.ResponseDto;
import com.my.backend.global.security.user.UserDetailsImpl;
import com.my.backend.pet.dto.MyPetListResponseDto;
import com.my.backend.pet.dto.MyPetRequestDto;
import com.my.backend.pet.dto.MyPetResponseDto;
import com.my.backend.pet.service.MyPetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/mypet")
@RequiredArgsConstructor
public class MyPetController {

    private final MyPetService myPetService;

    // 펫 등록
    @PostMapping
    public ResponseEntity<ResponseDto<MyPetResponseDto>> registerMyPet(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody MyPetRequestDto requestDto) {
        try {
            Long ownerId = userDetails.getId();
            MyPetResponseDto response = myPetService.registerMyPet(ownerId, requestDto);
            return ResponseEntity.ok(ResponseDto.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDto.fail("ERROR", e.getMessage()));
        }
    }

    // 펫 수정
    @PutMapping("/{myPetId}")
    public ResponseEntity<ResponseDto<MyPetResponseDto>> updateMyPet(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long myPetId,
            @RequestBody MyPetRequestDto requestDto) {
        try {
            Long ownerId = userDetails.getId();
            MyPetResponseDto response = myPetService.updateMyPet(myPetId, ownerId, requestDto);
            return ResponseEntity.ok(ResponseDto.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDto.fail("ERROR", e.getMessage()));
        }
    }

    // 펫 삭제
    @DeleteMapping("/{myPetId}")
    public ResponseEntity<ResponseDto<Void>> deleteMyPet(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long myPetId) {
        try {
            Long ownerId = userDetails.getId();
            myPetService.deleteMyPet(myPetId, ownerId);
            return ResponseEntity.ok(ResponseDto.success(null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDto.fail("ERROR", e.getMessage()));
        }
    }

    // 사용자의 모든 펫 조회
    @GetMapping
    public ResponseEntity<ResponseDto<MyPetListResponseDto>> getMyPets(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            Long ownerId = userDetails.getId();
            MyPetListResponseDto response = myPetService.getMyPets(ownerId);
            return ResponseEntity.ok(ResponseDto.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDto.fail("ERROR", e.getMessage()));
        }
    }

    // 특정 펫 조회
    @GetMapping("/{myPetId}")
    public ResponseEntity<ResponseDto<MyPetResponseDto>> getMyPet(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long myPetId) {
        try {
            Long ownerId = userDetails.getId();
            MyPetResponseDto response = myPetService.getMyPet(myPetId, ownerId);
            return ResponseEntity.ok(ResponseDto.success(response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDto.fail("ERROR", e.getMessage()));
        }
    }

    // 이미지 업로드
    @PostMapping("/upload-image")
    public ResponseEntity<ResponseDto<String>> uploadPetImage(
            @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = myPetService.uploadPetImage(file);
            return ResponseEntity.ok(ResponseDto.success(imageUrl));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseDto.fail("ERROR", e.getMessage()));
        }
    }
} 
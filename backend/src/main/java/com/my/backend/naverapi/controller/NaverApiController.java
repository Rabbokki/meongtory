package com.my.backend.naverapi.controller;

import com.my.backend.naverapi.dto.NaverProductSearchRequestDto;
import com.my.backend.naverapi.dto.NaverProductSearchResponseDto;
import com.my.backend.naverapi.service.NaverApiService;
import com.my.backend.global.dto.ResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/naver")
@RequiredArgsConstructor
public class NaverApiController {

    private final NaverApiService naverApiService;

    @GetMapping("/products/search")
    public ResponseEntity<ResponseDto<NaverProductSearchResponseDto>> searchProducts(
            @RequestParam(required = false, defaultValue = "") String query,
            @RequestParam(required = false, defaultValue = "1") int display,
            @RequestParam(required = false, defaultValue = "1") int start,
            @RequestParam(required = false, defaultValue = "sim") String sort) {
        
        NaverProductSearchRequestDto requestDto = NaverProductSearchRequestDto.builder()
                .query(query)
                .display(display)
                .start(start)
                .sort(sort)
                .build();

        NaverProductSearchResponseDto response = naverApiService.searchProducts(requestDto);
        return ResponseEntity.ok(ResponseDto.success(response));
    }

    @PostMapping("/products/search")
    public ResponseEntity<ResponseDto<NaverProductSearchResponseDto>> searchProductsPost(
            @RequestBody NaverProductSearchRequestDto requestDto) {
        
        NaverProductSearchResponseDto response = naverApiService.searchProducts(requestDto);
        return ResponseEntity.ok(ResponseDto.success(response));
    }
}

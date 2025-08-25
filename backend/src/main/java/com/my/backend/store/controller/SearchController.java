package com.my.backend.store.controller;

import com.my.backend.store.dto.SearchRequestDto;
import com.my.backend.store.dto.SearchResponseDto;
import com.my.backend.store.service.SearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SearchController {

    private final SearchService searchService;

    /**
     * 임베딩 기반 상품 검색
     * GET /api/search?query=검색어&limit=10
     */
    @GetMapping
    public ResponseEntity<List<SearchResponseDto>> searchProducts(
            @RequestParam String query,
            @RequestParam(required = false, defaultValue = "10") Integer limit) {
        
        try {
            log.info("=== 임베딩 기반 유사도 검색 요청 시작 ===");
            log.info("검색어: '{}'", query);
            log.info("제한 개수: {}", limit);
            log.info("검색 방식: 임베딩 기반 유사도 검색 (AI 기반)");
            log.info("엔드포인트: /api/search");
            
            SearchRequestDto searchRequest = new SearchRequestDto();
            searchRequest.setQuery(query);
            searchRequest.setLimit(limit);
            
            log.info("SearchRequestDto 생성 완료: {}", searchRequest);
            
            List<SearchResponseDto> results = searchService.searchByEmbedding(searchRequest);
            
            log.info("임베딩 기반 유사도 검색 결과 개수: {}", results.size());
            log.info("=== 임베딩 기반 유사도 검색 요청 완료 ===");
            
            return ResponseEntity.ok(results);
            
        } catch (IllegalArgumentException e) {
            log.warn("임베딩 기반 유사도 검색 요청 오류: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
            
        } catch (Exception e) {
            log.error("임베딩 기반 유사도 검색 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * POST 방식으로 검색 (더 복잡한 검색 조건을 위해)
     * POST /api/search
     */
    @PostMapping
    public ResponseEntity<List<SearchResponseDto>> searchProductsPost(@RequestBody SearchRequestDto searchRequest) {
        try {
            log.info("POST 검색 요청: query='{}', limit={}", 
                    searchRequest.getQuery(), searchRequest.getLimit());
            
            List<SearchResponseDto> results = searchService.searchByEmbedding(searchRequest);
            
            return ResponseEntity.ok(results);
            
        } catch (IllegalArgumentException e) {
            log.warn("POST 검색 요청 오류: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
            
        } catch (Exception e) {
            log.error("POST 검색 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}

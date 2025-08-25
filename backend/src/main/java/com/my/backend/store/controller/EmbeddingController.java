package com.my.backend.store.controller;

import com.my.backend.store.service.EmbeddingUpdateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/embedding")
@RequiredArgsConstructor
@Slf4j
public class EmbeddingController {

    private final EmbeddingUpdateService embeddingUpdateService;

    /**
     * 모든 상품의 임베딩 업데이트 시작
     */
    @PostMapping("/update-all")
    public ResponseEntity<Map<String, Object>> updateAllEmbeddings() {
        try {
            log.info("모든 상품 임베딩 업데이트 요청을 받았습니다.");
            
            // 비동기로 실행 (백그라운드에서 처리)
            new Thread(() -> {
                try {
                    embeddingUpdateService.updateAllProductEmbeddings();
                } catch (Exception e) {
                    log.error("임베딩 업데이트 중 오류 발생: {}", e.getMessage(), e);
                }
            }).start();
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "임베딩 업데이트가 백그라운드에서 시작되었습니다.");
            response.put("status", "started");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("임베딩 업데이트 시작 실패: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("error", "임베딩 업데이트 시작에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 특정 상품의 임베딩 업데이트
     */
    @PostMapping("/update/{productId}")
    public ResponseEntity<Map<String, Object>> updateProductEmbedding(@PathVariable Long productId) {
        try {
            embeddingUpdateService.updateProductEmbedding(productId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "상품 임베딩 업데이트가 완료되었습니다.");
            response.put("productId", productId);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("상품 임베딩 업데이트 실패 (ID: {}): {}", productId, e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("error", "상품 임베딩 업데이트에 실패했습니다: " + e.getMessage());
            response.put("productId", productId);
            
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * 임베딩이 없는 상품 수 조회
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getEmbeddingStats() {
        try {
            long productsWithoutEmbedding = embeddingUpdateService.countProductsWithoutEmbedding();
            
            Map<String, Object> response = new HashMap<>();
            response.put("productsWithoutEmbedding", productsWithoutEmbedding);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("임베딩 통계 조회 실패: {}", e.getMessage(), e);
            
            Map<String, Object> response = new HashMap<>();
            response.put("error", "임베딩 통계 조회에 실패했습니다: " + e.getMessage());
            
            return ResponseEntity.internalServerError().body(response);
        }
    }
}

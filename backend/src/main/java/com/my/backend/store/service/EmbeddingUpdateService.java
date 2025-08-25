package com.my.backend.store.service;

import com.my.backend.store.entity.NaverProduct;
import com.my.backend.store.repository.NaverProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmbeddingUpdateService {

    private final NaverProductRepository naverProductRepository;
    private final EmbeddingService embeddingService;

    /**
     * 모든 네이버 상품의 title을 임베딩으로 변환하여 DB에 업데이트
     */
    @Transactional
    public void updateAllProductEmbeddings() {
        log.info("모든 네이버 상품의 임베딩 업데이트를 시작합니다.");
        
        int page = 0;
        int size = 100; // 한 번에 처리할 상품 수
        int totalProcessed = 0;
        int totalUpdated = 0;
        
        while (true) {
            Pageable pageable = PageRequest.of(page, size);
            Page<NaverProduct> productPage = naverProductRepository.findAll(pageable);
            
            if (productPage.isEmpty()) {
                break;
            }
            
            List<NaverProduct> products = productPage.getContent();
            log.info("페이지 {} 처리 중: {}개 상품", page + 1, products.size());
            
            for (NaverProduct product : products) {
                try {
                    // 이미 임베딩이 있는 경우 스킵
                    if (product.getTitleEmbedding() != null && !product.getTitleEmbedding().isEmpty()) {
                        log.debug("상품 {} (ID: {})는 이미 임베딩이 있습니다. 스킵합니다.", 
                                product.getTitle(), product.getId());
                        continue;
                    }
                    
                    // title이 없는 경우 스킵
                    if (product.getTitle() == null || product.getTitle().trim().isEmpty()) {
                        log.warn("상품 ID {}의 title이 비어있습니다. 스킵합니다.", product.getId());
                        continue;
                    }
                    
                    // 임베딩 생성
                    List<Double> embedding = embeddingService.generateEmbedding(product.getTitle());
                    String vectorString = embeddingService.embeddingToVectorString(embedding);
                    
                    // DB 업데이트
                    product.setTitleEmbedding(vectorString);
                    naverProductRepository.save(product);
                    
                    totalUpdated++;
                    log.debug("상품 {} (ID: {}) 임베딩 업데이트 완료", product.getTitle(), product.getId());
                    
                    // API 호출 제한을 위한 딜레이 (초당 3회 제한)
                    Thread.sleep(350);
                    
                } catch (Exception e) {
                    log.error("상품 {} (ID: {}) 임베딩 업데이트 실패: {}", 
                            product.getTitle(), product.getId(), e.getMessage());
                }
                
                totalProcessed++;
            }
            
            page++;
            
            // 진행 상황 로그
            if (totalProcessed % 100 == 0) {
                log.info("진행 상황: {}개 처리됨, {}개 업데이트됨", totalProcessed, totalUpdated);
            }
        }
        
        log.info("임베딩 업데이트 완료: 총 {}개 처리됨, {}개 업데이트됨", totalProcessed, totalUpdated);
    }

    /**
     * 특정 상품의 임베딩 업데이트
     */
    @Transactional
    public void updateProductEmbedding(Long productId) {
        NaverProduct product = naverProductRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다: " + productId));
        
        if (product.getTitle() == null || product.getTitle().trim().isEmpty()) {
            throw new RuntimeException("상품의 title이 비어있습니다: " + productId);
        }
        
        List<Double> embedding = embeddingService.generateEmbedding(product.getTitle());
        String vectorString = embeddingService.embeddingToVectorString(embedding);
        
        product.setTitleEmbedding(vectorString);
        naverProductRepository.save(product);
        
        log.info("상품 {} (ID: {}) 임베딩 업데이트 완료", product.getTitle(), productId);
    }

    /**
     * 임베딩이 없는 상품 수 조회
     */
    public long countProductsWithoutEmbedding() {
        return naverProductRepository.countByTitleEmbeddingIsNull();
    }
}

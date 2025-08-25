package com.my.backend.store.service;

import com.my.backend.store.dto.SearchRequestDto;
import com.my.backend.store.dto.SearchResponseDto;
import com.my.backend.store.entity.NaverProduct;
import com.my.backend.store.repository.NaverProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    private final NaverProductRepository naverProductRepository;
    private final EmbeddingService embeddingService;

    /**
     * 검색어를 임베딩으로 변환하여 유사한 상품들을 검색
     * @param searchRequest 검색 요청
     * @return 검색 결과 리스트
     */
    public List<SearchResponseDto> searchByEmbedding(SearchRequestDto searchRequest) {
        try {
            log.info("=== SearchService.searchByEmbedding 시작 (임베딩 기반 유사도 검색) ===");
            
            String query = searchRequest.getQuery();
            int limit = searchRequest.getLimit() != null ? searchRequest.getLimit() : 10;
            
            log.info("검색어: '{}'", query);
            log.info("제한 개수: {}", limit);
            log.info("검색 방식: 임베딩 기반 유사도 검색 (AI 기반)");
            
            if (query == null || query.trim().isEmpty()) {
                log.error("검색어가 비어있습니다.");
                throw new IllegalArgumentException("검색어가 비어있습니다.");
            }
            
            log.info("임베딩 검색 시작: '{}', limit: {}", query, limit);
            
            log.info("검색어 임베딩 생성 시작...");
            
            // 검색어를 임베딩으로 변환
            List<Double> queryEmbedding = embeddingService.generateEmbedding(query);
            log.info("임베딩 생성 완료: {}차원", queryEmbedding != null ? queryEmbedding.size() : 0);
            
            String queryVectorString = embeddingService.embeddingToVectorString(queryEmbedding);
            log.info("벡터 문자열 변환 완료: {}", queryVectorString != null ? "성공" : "실패");
            
            if (queryVectorString == null) {
                log.error("검색어 임베딩 생성에 실패했습니다.");
                throw new RuntimeException("검색어 임베딩 생성에 실패했습니다.");
            }
            
            log.info("PostgreSQL 임베딩 검색 시작 (cosine similarity)...");
            
            // PostgreSQL에서 cosine similarity로 유사한 상품 ID와 유사도 점수 검색
            List<Object[]> similarProductIdsWithSimilarity = naverProductRepository
                    .findSimilarProductIdsWithSimilarity(queryVectorString, limit);
            
            log.info("PostgreSQL 임베딩 검색 완료: {}개 상품 발견", similarProductIdsWithSimilarity.size());
            
            log.info("DTO 변환 시작...");
            
            // DTO로 변환 (유사도 점수 포함)
            List<SearchResponseDto> results = similarProductIdsWithSimilarity.stream()
                    .map(this::convertToSearchResponseDtoFromId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            
            log.info("임베딩 기반 유사도 검색 완료: {}개 결과", results.size());
            log.info("=== SearchService.searchByEmbedding 완료 (임베딩 기반 유사도 검색) ===");
            
            return results;
            
        } catch (Exception e) {
            log.error("임베딩 기반 유사도 검색 실패: {}", e.getMessage(), e);
            throw new RuntimeException("임베딩 기반 유사도 검색 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    /**
     * Object[] (상품 ID + 유사도 점수)를 SearchResponseDto로 변환
     */
    private SearchResponseDto convertToSearchResponseDtoFromId(Object[] result) {
        try {
            log.info("DTO 변환 시작: Object[] 길이 = {}", result.length);
            
            // Object[] 구조: [id, similarity]
            Long id = safeCastToLong(result[0]);
            Double distance = safeCastToDouble(result[1]); // Euclidean distance
            
            // Euclidean distance를 유사도 점수로 변환 (0~1 범위)
            // 거리가 0에 가까울수록 유사도 1, 거리가 클수록 유사도 0에 가까워짐
            Double similarity = convertDistanceToSimilarity(distance);
            
            log.info("상품 ID: {}, 원본 거리: {}, 변환된 유사도: {}", id, distance, similarity);
            
            // ID로 상품 조회
            NaverProduct product = naverProductRepository.findById(id).orElse(null);
            if (product == null) {
                log.warn("상품을 찾을 수 없습니다: id = {}", id);
                return null;
            }
            
            log.info("상품 조회 완료: {}", product.getTitle());
            
            SearchResponseDto dto = SearchResponseDto.builder()
                    .id(product.getId())
                    .productId(product.getProductId())
                    .title(product.getTitle())
                    .description(product.getDescription())
                    .price(product.getPrice())
                    .imageUrl(product.getImageUrl())
                    .mallName(product.getMallName())
                    .productUrl(product.getProductUrl())
                    .brand(product.getBrand())
                    .maker(product.getMaker())
                    .category1(product.getCategory1())
                    .category2(product.getCategory2())
                    .category3(product.getCategory3())
                    .category4(product.getCategory4())
                    .reviewCount(product.getReviewCount())
                    .rating(product.getRating())
                    .searchCount(product.getSearchCount())
                    .createdAt(product.getCreatedAt())
                    .updatedAt(product.getUpdatedAt())
                    .relatedProductId(product.getRelatedProduct() != null ? product.getRelatedProduct().getId() : null)
                    .similarity(similarity) // 변환된 유사도 점수 사용
                    .build();
            
            log.info("DTO 변환 완료: {}", dto.getTitle());
            return dto;
            
        } catch (Exception e) {
            log.error("DTO 변환 중 오류 발생: {}", e.getMessage(), e);
            return null; // 개별 상품 변환 실패 시 null 반환하여 필터링
        }
    }
    
    /**
     * Euclidean distance를 유사도 점수(0~1)로 변환
     * @param distance Euclidean distance
     * @return 유사도 점수 (0~1, 1에 가까울수록 유사)
     */
    private Double convertDistanceToSimilarity(Double distance) {
        if (distance == null) return 0.0;
        
        // 거리가 0에 가까울수록 유사도 1, 거리가 클수록 유사도 0에 가까워짐
        // 일반적으로 1536차원 벡터에서 거리 1.0 이하가 매우 유사한 것으로 간주
        // 거리 2.0 이상은 덜 유사한 것으로 간주
        
        if (distance <= 0.5) {
            // 매우 유사 (거리 0.5 이하)
            return 1.0 - (distance / 0.5) * 0.1; // 0.9 ~ 1.0
        } else if (distance <= 1.0) {
            // 유사 (거리 0.5 ~ 1.0)
            return 0.9 - ((distance - 0.5) / 0.5) * 0.3; // 0.6 ~ 0.9
        } else if (distance <= 2.0) {
            // 보통 (거리 1.0 ~ 2.0)
            return 0.6 - ((distance - 1.0) / 1.0) * 0.4; // 0.2 ~ 0.6
        } else {
            // 덜 유사 (거리 2.0 이상)
            return Math.max(0.1, 0.2 - ((distance - 2.0) / 2.0) * 0.1); // 0.1 ~ 0.2
        }
    }
    
    // 안전한 타입 변환 헬퍼 메서드들
    private Long safeCastToLong(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Long) return (Long) obj;
        if (obj instanceof Double) return ((Double) obj).longValue();
        if (obj instanceof Integer) return ((Integer) obj).longValue();
        return Long.valueOf(obj.toString());
    }
    
    private String safeCastToString(Object obj) {
        return obj == null ? null : obj.toString();
    }
    
    private Integer safeCastToInteger(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Integer) return (Integer) obj;
        if (obj instanceof Long) return ((Long) obj).intValue();
        if (obj instanceof Double) return ((Double) obj).intValue();
        return Integer.valueOf(obj.toString());
    }
    
    private Double safeCastToDouble(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Double) return (Double) obj;
        if (obj instanceof Long) return ((Long) obj).doubleValue();
        if (obj instanceof Integer) return ((Integer) obj).doubleValue();
        return Double.valueOf(obj.toString());
    }
    
    private LocalDateTime safeCastToLocalDateTime(Object obj) {
        if (obj == null) return null;
        if (obj instanceof LocalDateTime) return (LocalDateTime) obj;
        if (obj instanceof java.sql.Timestamp) {
            return ((java.sql.Timestamp) obj).toLocalDateTime();
        }
        return LocalDateTime.parse(obj.toString());
    }
}

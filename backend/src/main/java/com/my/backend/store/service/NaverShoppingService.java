package com.my.backend.store.service;

import com.my.backend.config.NaverApiConfig;
import com.my.backend.store.dto.NaverProductDto;
import com.my.backend.store.dto.NaverShoppingItemDto;
import com.my.backend.store.dto.NaverShoppingResponseDto;
import com.my.backend.store.dto.NaverShoppingSearchRequestDto;
import com.my.backend.store.entity.NaverProduct;
import com.my.backend.store.entity.Product;
import com.my.backend.store.repository.NaverProductRepository;
import com.my.backend.store.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NaverShoppingService {

    private final NaverApiConfig naverApiConfig;
    private final RestTemplate naverRestTemplate;
    private final NaverProductRepository naverProductRepository;
    private final ProductRepository productRepository;

    @Value("${naver.api.shopping-url}")
    private String naverShoppingUrl;

    /**
     * 네이버 쇼핑 API에서 상품 검색
     */
    public NaverShoppingResponseDto searchProducts(NaverShoppingSearchRequestDto requestDto) {
        try {
            HttpHeaders headers = naverApiConfig.getNaverApiHeaders();
            
            URI uri = UriComponentsBuilder
                    .fromHttpUrl(naverShoppingUrl)
                    .queryParam("query", requestDto.getQuery())
                    .queryParam("display", requestDto.getDisplay())
                    .queryParam("start", requestDto.getStart())
                    .queryParam("sort", requestDto.getSort())
                    .build()
                    .encode()
                    .toUri();

            log.info("네이버 쇼핑 API 호출 URL: {}", uri);
            log.info("네이버 쇼핑 API 헤더: X-Naver-Client-Id={}, X-Naver-Client-Secret={}", 
                    headers.getFirst("X-Naver-Client-Id"), 
                    headers.getFirst("X-Naver-Client-Secret") != null ? "***" : "null");

            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<NaverShoppingResponseDto> response = naverRestTemplate.exchange(
                    uri, 
                    HttpMethod.GET, 
                    entity, 
                    NaverShoppingResponseDto.class
            );

            log.info("네이버 쇼핑 API 호출 성공: {}", requestDto.getQuery());
            return response.getBody();
            
        } catch (Exception e) {
            log.error("네이버 쇼핑 API 호출 실패: {}", e.getMessage(), e);
            if (e instanceof RestClientException) {
                log.error("RestClientException 상세: {}", e.getCause() != null ? e.getCause().getMessage() : "원인 없음");
            }
            // 더 자세한 에러 정보 로깅
            if (e instanceof org.springframework.web.client.HttpClientErrorException) {
                org.springframework.web.client.HttpClientErrorException httpEx = (org.springframework.web.client.HttpClientErrorException) e;
                log.error("HTTP 상태 코드: {}", httpEx.getStatusCode());
                log.error("응답 바디: {}", httpEx.getResponseBodyAsString());
            }
            throw new RuntimeException("네이버 쇼핑 API 호출에 실패했습니다.", e);
        }
    }

    /**
     * 네이버 쇼핑 상품을 DB에 저장
     */
    @Transactional
    public void saveNaverProducts(List<NaverShoppingItemDto> items) {
        for (NaverShoppingItemDto item : items) {
            try {
                // 이미 존재하는 상품인지 확인
                Optional<NaverProduct> existingProduct = naverProductRepository.findByProductId(item.getProductId());
                
                if (existingProduct.isPresent()) {
                    // 기존 상품 정보 업데이트
                    NaverProduct product = existingProduct.get();
                    updateNaverProduct(product, item);
                } else {
                    // 새 상품 생성
                    NaverProduct newProduct = createNaverProductFromItem(item);
                    naverProductRepository.save(newProduct);
                }
            } catch (Exception e) {
                log.error("상품 저장 실패 - ProductId: {}, Error: {}", item.getProductId(), e.getMessage());
            }
        }
    }

    /**
     * 네이버 상품을 기존 Product와 연결
     */
    @Transactional
    public void linkToProduct(Long naverProductId, Long productId) {
        Optional<NaverProduct> naverProductOpt = naverProductRepository.findById(naverProductId);
        Optional<Product> productOpt = productRepository.findById(productId);
        
        if (naverProductOpt.isPresent() && productOpt.isPresent()) {
            NaverProduct naverProduct = naverProductOpt.get();
            Product product = productOpt.get();
            naverProduct.setRelatedProduct(product);
            naverProductRepository.save(naverProduct);
            log.info("네이버 상품과 기존 상품 연결 완료: {} -> {}", naverProductId, productId);
        }
    }

    /**
     * 키워드로 네이버 상품 검색
     */
    public Page<NaverProductDto> searchNaverProductsByKeyword(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NaverProduct> naverProducts = naverProductRepository.findByKeyword(keyword, pageable);
        return naverProducts.map(this::convertToDto);
    }

    /**
     * 카테고리로 네이버 상품 검색
     */
    public Page<NaverProductDto> searchNaverProductsByCategory(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NaverProduct> naverProducts = naverProductRepository.findByCategory(category, pageable);
        return naverProducts.map(this::convertToDto);
    }

    /**
     * 가격 범위로 네이버 상품 검색
     */
    public Page<NaverProductDto> searchNaverProductsByPriceRange(Long minPrice, Long maxPrice, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NaverProduct> naverProducts = naverProductRepository.findByPriceRange(minPrice, maxPrice, pageable);
        return naverProducts.map(this::convertToDto);
    }

    /**
     * 인기 상품 조회
     */
    public Page<NaverProductDto> getPopularProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NaverProduct> naverProducts = naverProductRepository.findPopularProducts(pageable);
        return naverProducts.map(this::convertToDto);
    }

    /**
     * 높은 평점 상품 조회
     */
    public Page<NaverProductDto> getTopRatedProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<NaverProduct> naverProducts = naverProductRepository.findTopRatedProducts(pageable);
        return naverProducts.map(this::convertToDto);
    }

    /**
     * 특정 상품과 관련된 네이버 상품 조회
     */
    public List<NaverProductDto> getRelatedNaverProducts(Long productId) {
        List<NaverProduct> naverProducts = naverProductRepository.findByRelatedProductId(productId);
        return naverProducts.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    private NaverProduct createNaverProductFromItem(NaverShoppingItemDto item) {
        return NaverProduct.builder()
                .productId(item.getProductId())
                .title(item.getTitle())
                .description(item.getTitle()) // 네이버 API에서는 별도 description이 없으므로 title 사용
                .price(parsePrice(item.getLprice()))
                .imageUrl(item.getImage())
                .mallName(item.getMallName())
                .productUrl(item.getLink())
                .brand(item.getBrand() != null ? item.getBrand() : "")
                .maker(item.getMaker() != null ? item.getMaker() : "")
                .category1(item.getCategory1() != null ? item.getCategory1() : "")
                .category2(item.getCategory2() != null ? item.getCategory2() : "")
                .category3(item.getCategory3() != null ? item.getCategory3() : "")
                .category4(item.getCategory4() != null ? item.getCategory4() : "")
                .reviewCount(parseInteger(item.getReviewCount()))
                .rating(parseDouble(item.getRating()))
                .searchCount(parseInteger(item.getSearchCount()))
                .build();
    }

    private void updateNaverProduct(NaverProduct product, NaverShoppingItemDto item) {
        product.setTitle(item.getTitle());
        product.setDescription(item.getTitle());
        product.setPrice(parsePrice(item.getLprice()));
        product.setImageUrl(item.getImage());
        product.setMallName(item.getMallName());
        product.setProductUrl(item.getLink());
        product.setBrand(item.getBrand() != null ? item.getBrand() : "");
        product.setMaker(item.getMaker() != null ? item.getMaker() : "");
        product.setCategory1(item.getCategory1() != null ? item.getCategory1() : "");
        product.setCategory2(item.getCategory2() != null ? item.getCategory2() : "");
        product.setCategory3(item.getCategory3() != null ? item.getCategory3() : "");
        product.setCategory4(item.getCategory4() != null ? item.getCategory4() : "");
        product.setReviewCount(parseInteger(item.getReviewCount()));
        product.setRating(parseDouble(item.getRating()));
        product.setSearchCount(parseInteger(item.getSearchCount()));
        
        naverProductRepository.save(product);
    }

    private NaverProductDto convertToDto(NaverProduct product) {
        return NaverProductDto.builder()
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
                .build();
    }

    private Long parsePrice(String priceStr) {
        try {
            return Long.parseLong(priceStr.replaceAll("[^0-9]", ""));
        } catch (Exception e) {
            return 0L;
        }
    }

    private Integer parseInteger(String str) {
        try {
            return Integer.parseInt(str.replaceAll("[^0-9]", ""));
        } catch (Exception e) {
            return 0;
        }
    }

    private Double parseDouble(String str) {
        try {
            return Double.parseDouble(str);
        } catch (Exception e) {
            return 0.0;
        }
    }
}

package com.my.backend.store.controller;

import com.my.backend.global.dto.ResponseDto;
import com.my.backend.store.dto.NaverProductDto;
import com.my.backend.store.dto.NaverShoppingSearchRequestDto;
import com.my.backend.store.service.CartService;
import com.my.backend.store.service.NaverShoppingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/naver-shopping")
@RequiredArgsConstructor
@Slf4j
public class NaverShoppingController {
    private final NaverShoppingService naverShoppingService;
    private final CartService cartService;

    /**
     * 네이버 쇼핑 실시간 검색
     */
    @PostMapping("/search")
    public ResponseEntity<ResponseDto> searchProducts(@RequestBody NaverShoppingSearchRequestDto requestDto) {
        try {
            var response = naverShoppingService.searchProducts(requestDto);
            return ResponseEntity.ok(ResponseDto.success(response));
        } catch (Exception e) {
            log.error("네이버 쇼핑 검색 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseDto.fail("SEARCH_FAILED", "네이버 쇼핑 검색에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 저장된 네이버 상품 키워드 검색
     */
    @GetMapping("/products/search")
    public ResponseEntity<ResponseDto> searchNaverProducts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Page<NaverProductDto> products = naverShoppingService.searchNaverProductsByKeyword(keyword, page, size);
            return ResponseEntity.ok(ResponseDto.success(products));
        } catch (Exception e) {
            log.error("네이버 상품 검색 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseDto.fail("SEARCH_FAILED", "네이버 상품 검색에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 카테고리별 네이버 상품 검색
     */
    @GetMapping("/products/category/{category}")
    public ResponseEntity<ResponseDto> searchByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Page<NaverProductDto> products = naverShoppingService.searchNaverProductsByCategory(category, page, size);
            return ResponseEntity.ok(ResponseDto.success(products));
        } catch (Exception e) {
            log.error("카테고리별 네이버 상품 검색 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseDto.fail("CATEGORY_SEARCH_FAILED", "카테고리별 네이버 상품 검색에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 가격 범위별 네이버 상품 검색
     */
    @GetMapping("/products/price-range")
    public ResponseEntity<ResponseDto> searchByPriceRange(
            @RequestParam Long minPrice,
            @RequestParam Long maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Page<NaverProductDto> products = naverShoppingService.searchNaverProductsByPriceRange(minPrice, maxPrice, page, size);
            return ResponseEntity.ok(ResponseDto.success(products));
        } catch (Exception e) {
            log.error("가격 범위별 네이버 상품 검색 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseDto.fail("PRICE_RANGE_SEARCH_FAILED", "가격 범위별 네이버 상품 검색에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 인기 네이버 상품 조회
     */
    @GetMapping("/products/popular")
    public ResponseEntity<ResponseDto> getPopularProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Page<NaverProductDto> products = naverShoppingService.getPopularProducts(page, size);
            return ResponseEntity.ok(ResponseDto.success(products));
        } catch (Exception e) {
            log.error("인기 네이버 상품 조회 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseDto.fail("POPULAR_PRODUCTS_FAILED", "인기 네이버 상품 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 높은 평점 네이버 상품 조회
     */
    @GetMapping("/products/top-rated")
    public ResponseEntity<ResponseDto> getTopRatedProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Page<NaverProductDto> products = naverShoppingService.getTopRatedProducts(page, size);
            return ResponseEntity.ok(ResponseDto.success(products));
        } catch (Exception e) {
            log.error("높은 평점 네이버 상품 조회 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseDto.fail("TOP_RATED_PRODUCTS_FAILED", "높은 평점 네이버 상품 조회에 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 네이버 상품을 카트에 추가
     */
    @PostMapping("/cart/{naverProductId}")
    public ResponseEntity<ResponseDto> addToCart(
            @PathVariable Long naverProductId,
            @RequestParam(defaultValue = "1") int quantity) {
        try {
            // TODO: 실제 사용자 ID를 가져오는 로직 필요
            Long accountId = 1L; // 임시로 1로 설정
            cartService.addNaverProductToCart(accountId, naverProductId, quantity);
            
            return ResponseEntity.ok(ResponseDto.success("네이버 상품을 카트에 추가했습니다"));
        } catch (Exception e) {
            log.error("네이버 상품 카트 추가 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseDto.fail("CART_ADD_FAILED", "네이버 상품을 카트에 추가하는데 실패했습니다: " + e.getMessage()));
        }
    }

    /**
     * 네이버 상품을 기존 상품과 연결
     */
    @PostMapping("/link/{naverProductId}/product/{productId}")
    public ResponseEntity<ResponseDto> linkToProduct(
            @PathVariable Long naverProductId,
            @PathVariable Long productId) {
        try {
            naverShoppingService.linkToProduct(naverProductId, productId);
            return ResponseEntity.ok(ResponseDto.success("네이버 상품과 기존 상품이 연결되었습니다"));
        } catch (Exception e) {
            log.error("네이버 상품 연결 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ResponseDto.fail("LINK_FAILED", "네이버 상품 연결에 실패했습니다: " + e.getMessage()));
        }
    }
}

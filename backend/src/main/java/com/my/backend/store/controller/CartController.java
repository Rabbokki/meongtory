package com.my.backend.store.controller;

import com.my.backend.store.dto.CartDto;
import com.my.backend.store.entity.Cart;
import com.my.backend.store.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 장바구니 관련 API를 제공하는 컨트롤러
 */
@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    /**
     * 현재 로그인한 사용자의 장바구니 목록을 조회 (DTO 반환)
     *
     * @return 현재 사용자의 장바구니 항목 리스트 (DTO)
     *
     * 예: GET /api/carts
     */
    @GetMapping
    public List<CartDto> getCurrentUserCart() {
        // SecurityContext에서 현재 사용자 정보 가져오기
        org.springframework.security.core.Authentication authentication = 
            org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        com.my.backend.global.security.user.UserDetailsImpl userDetails = 
            (com.my.backend.global.security.user.UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getAccount().getId();
        
        return cartService.getCartDtoByUserId(userId);
    }

    /**
     * 특정 사용자의 장바구니 목록을 조회 (DTO 반환)
     *
     * @param userId 사용자 ID
     * @return 해당 사용자의 장바구니 항목 리스트 (DTO)
     *
     * 예: GET /api/carts/1
     */
    @GetMapping("/{userId}")
    public List<CartDto> getCartByUserId(@PathVariable Long userId) {
        return cartService.getCartDtoByUserId(userId);
    }

    /**
     * 장바구니에 상품을 추가
     * - 이미 장바구니에 있는 상품이면 수량만 증가
     *
     * @param userId 사용자 ID
     * @param productId 상품 ID
     * @param quantity 수량 (기본값: 1)
     * @return 추가되거나 수정된 장바구니 항목 (DTO)
     *
     * 예: POST /api/carts?userId=1&productId=3&quantity=2
     */
    @PostMapping
    public CartDto addToCart(@RequestParam Long userId,
                             @RequestParam Integer productId,
                             @RequestParam(required = false) Integer quantity) {
        Cart cart = cartService.addToCart(userId, productId, quantity);
        return cartService.toDto(cart);
    }

    /**
     * 장바구니에서 특정 항목 삭제
     *
     * @param cartId 장바구니 항목 ID
     *
     * 예: DELETE /api/carts/5
     */
    @DeleteMapping("/{cartId}")
    public void removeFromCart(@PathVariable Integer cartId) {
        cartService.removeFromCart(cartId);
    }

    /**
     * 장바구니에 담긴 상품의 수량을 변경
     *
     * @param cartId 장바구니 항목 ID
     * @param quantity 수정할 수량
     * @return 수정된 장바구니 항목 (DTO)
     *
     * 예: PUT /api/carts/5?quantity=4
     */
    @PutMapping("/{cartId}")
    public CartDto updateQuantity(@PathVariable Integer cartId,
                                  @RequestParam Integer quantity) {
        Cart cart = cartService.updateCartQuantity(cartId, quantity);
        return cartService.toDto(cart);
    }
}
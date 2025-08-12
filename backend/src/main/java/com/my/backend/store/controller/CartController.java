package com.my.backend.store.controller;

import com.my.backend.store.dto.CartDto;
import com.my.backend.store.entity.Cart;
import com.my.backend.store.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
     * 현재 로그인한 사용자의 장바구니 목록을 조회
     *
     * @return 현재 사용자의 장바구니 항목 리스트 (DTO)
     *
     * 예: GET /api/carts/my
     */
    @GetMapping("/my")
    public List<CartDto> getMyCart() {
        // 현재 로그인한 사용자의 ID를 가져오기
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            // 인증되지 않은 경우 빈 리스트 반환
            return List.of();
        }
        
        // Principal에서 사용자 ID 추출 (실제 구현에 따라 다를 수 있음)
        String principal = authentication.getPrincipal().toString();
        Integer currentUserId;
        
        try {
            // Principal이 사용자 ID인 경우
            currentUserId = Integer.parseInt(principal);
        } catch (NumberFormatException e) {
            // Principal이 사용자 ID가 아닌 경우 (예: 이메일), 기본값 사용
            currentUserId = 1;
        }
        
        return cartService.getCartDtoByUserId(currentUserId);
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
    public List<CartDto> getCartByUserId(@PathVariable Integer userId) {
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
    public CartDto addToCart(@RequestParam Integer userId,
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
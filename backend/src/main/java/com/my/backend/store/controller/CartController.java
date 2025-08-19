package com.my.backend.store.controller;

import com.my.backend.account.entity.Account;
import com.my.backend.global.dto.ResponseDto;
import com.my.backend.global.security.user.UserDetailsImpl;
import com.my.backend.store.dto.CartDto;
import com.my.backend.store.entity.Cart;
import com.my.backend.store.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 장바구니 관련 API 컨트롤러
 */
@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // =======================
    // 1️⃣ 로그인 사용자 장바구니
    // =======================

    /**
     * 현재 로그인한 사용자의 장바구니 목록 조회
     * 예: GET /api/carts
     */
    @GetMapping
    public List<CartDto> getCurrentUserCart(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        System.out.println("=== 장바구니 조회 요청 ===");
        System.out.println("userDetails: " + (userDetails != null ? "not null" : "null"));
        
        // 인증 검증
        if (userDetails == null) {
            System.out.println("ERROR: userDetails가 null입니다. 인증이 필요합니다.");
            throw new RuntimeException("인증이 필요합니다.");
        }
        
        System.out.println("사용자 ID: " + userDetails.getAccount().getId());
        System.out.println("사용자 이메일: " + userDetails.getAccount().getEmail());
        System.out.println("사용자 이름: " + userDetails.getAccount().getName());
        System.out.println("================================");

        Long accountId = userDetails.getAccount().getId();
        return cartService.getCartDtoByAccountId(accountId);
    }

    /**
     * 현재 로그인한 사용자의 장바구니에 상품 추가
     * 예: POST /api/carts?productId=3&quantity=2
     */
    @PostMapping
    public ResponseDto<?> addToCart(@AuthenticationPrincipal UserDetailsImpl userDetails,
                                 @RequestParam Long productId,
                                 @RequestParam(required = false, defaultValue = "1") int quantity) {

        System.out.println("=== 장바구니 추가 요청 ===");
        System.out.println("userDetails: " + (userDetails != null ? "not null" : "null"));
        
        if(userDetails == null || userDetails.getAccount() == null) {
            System.out.println("ERROR: userDetails가 null입니다. 인증이 필요합니다.");
            return ResponseDto.fail("로그인 필요","로그인이 필요합니다.");
        }
        
        System.out.println("사용자 ID: " + userDetails.getAccount().getId());
        System.out.println("상품 ID: " + productId);
        System.out.println("수량: " + quantity);
        System.out.println("================================");
        
        Account account = userDetails.getAccount();
        Cart cart = cartService.addToCart(account.getId(), productId, quantity);
        return ResponseDto.success(cartService.toDto(cart));
    }

    // =======================
    // 3️⃣ 장바구니 항목 수정/삭제
    // =======================

    /**
     * 장바구니에서 특정 항목 삭제
     * 예: DELETE /api/carts/5
     */
    @DeleteMapping("/{cartId}")
    public void removeFromCart(@AuthenticationPrincipal UserDetailsImpl userDetails,
                              @PathVariable Long cartId) {
        System.out.println("=== 장바구니 삭제 요청 ===");
        System.out.println("userDetails: " + (userDetails != null ? "not null" : "null"));
        
        if(userDetails == null || userDetails.getAccount() == null) {
            System.out.println("ERROR: userDetails가 null입니다. 인증이 필요합니다.");
            throw new RuntimeException("로그인이 필요합니다.");
        }
        
        System.out.println("사용자 ID: " + userDetails.getAccount().getId());
        System.out.println("삭제할 장바구니 ID: " + cartId);
        System.out.println("================================");
        
        cartService.removeFromCart(cartId);
    }

    /**
     * 장바구니 항목 수량 변경
     * 예: PUT /api/carts/5?quantity=4
     */
    @PutMapping("/{cartId}")
    public CartDto updateQuantity(@PathVariable Long cartId,
                                  @RequestParam int quantity) {
        Cart cart = cartService.updateCartQuantity(cartId, quantity);
        return cartService.toDto(cart);
    }
}

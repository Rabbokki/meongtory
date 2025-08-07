package com.my.backend.store.service;

import com.my.backend.account.entity.Account;
import com.my.backend.account.repository.AccountRepository;
import com.my.backend.store.dto.CartDto;
import com.my.backend.store.dto.ProductDto;
import com.my.backend.store.entity.Cart;
import com.my.backend.store.entity.Product;
import com.my.backend.store.repository.CartRepository;
import com.my.backend.store.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final AccountRepository accountRepository;
    private final ProductService productService;  // Product -> ProductDto 변환용 서비스

    /**
     * 사용자별 장바구니 전체 조회 (엔티티 리스트)
     */
    public List<Cart> getCartByUserId(Long userId) {
        return cartRepository.findByUser_Id(userId);
    }

    /**
     * 사용자별 장바구니 전체 조회 (DTO 리스트)
     */
    public List<CartDto> getCartDtoByUserId(Long userId) {
        List<Cart> carts = cartRepository.findByUser_IdWithProduct(userId);
        return carts.stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * 장바구니에 상품 추가 (중복 시 수량 증가)
     */
    public Cart addToCart(Long userId, Integer productId, Integer quantity) {
        Account user = accountRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 존재하지 않습니다."));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("해당 상품이 존재하지 않습니다."));

        // 재고 확인
        int requestedQuantity = quantity != null ? quantity : 1;
        if (product.getStock() < requestedQuantity) {
            throw new RuntimeException("상품 '" + product.getName() + "'의 재고가 부족합니다. (재고: " + product.getStock() + ", 요청: " + requestedQuantity + ")");
        }

        return cartRepository.findByUser_IdAndProduct_ProductId(userId, productId)
                .map(existingCart -> {
                    int newQuantity = existingCart.getQuantity() + requestedQuantity;
                    // 기존 수량 + 새로 추가할 수량이 재고를 초과하는지 확인
                    if (product.getStock() < newQuantity) {
                        throw new RuntimeException("상품 '" + product.getName() + "'의 재고가 부족합니다. (재고: " + product.getStock() + ", 요청: " + newQuantity + ")");
                    }
                    existingCart.setQuantity(newQuantity);
                    return cartRepository.save(existingCart);
                })
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .user(user)
                            .product(product)
                            .quantity(requestedQuantity)
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    /**
     * 장바구니에서 항목 제거
     */
    public void removeFromCart(Integer cartId) {
        cartRepository.deleteById(cartId);
    }

    /**
     * 장바구니 수량 수정
     */
    public Cart updateCartQuantity(Integer cartId, Integer quantity) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("해당 장바구니 항목이 존재하지 않습니다."));

        // 재고 확인
        Product product = cart.getProduct();
        if (product.getStock() < quantity) {
            throw new RuntimeException("상품 '" + product.getName() + "'의 재고가 부족합니다. (재고: " + product.getStock() + ", 요청: " + quantity + ")");
        }

        cart.setQuantity(quantity);
        return cartRepository.save(cart);
    }

    /**
     * Cart 엔티티 -> CartDto 변환
     */
    public CartDto toDto(Cart cart) {
        return CartDto.builder()
                .cartId(cart.getCartId())
                .userId(cart.getUser().getId())
                .product(productService.toDto(cart.getProduct()))
                .quantity(cart.getQuantity())
                .build();
    }
}
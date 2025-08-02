package com.my.backend.store.service;

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
    private final ProductService productService;  // Product -> ProductDto 변환용 서비스

    /**
     * 사용자별 장바구니 전체 조회 (엔티티 리스트)
     */
    public List<Cart> getCartByUserId(Integer userId) {
        return cartRepository.findByUserId(userId);
    }

    /**
     * 사용자별 장바구니 전체 조회 (DTO 리스트)
     */
    public List<CartDto> getCartDtoByUserId(Integer userId) {
        List<Cart> carts = cartRepository.findByUserId(userId);
        return carts.stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * 장바구니에 상품 추가 (중복 시 수량 증가)
     */
    public Cart addToCart(Integer userId, Integer productId, Integer quantity) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("해당 상품이 존재하지 않습니다."));

        return cartRepository.findByUserIdAndProduct_ProductId(userId, productId)
                .map(existingCart -> {
                    existingCart.setQuantity(existingCart.getQuantity() + (quantity != null ? quantity : 1));
                    return cartRepository.save(existingCart);
                })
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .userId(userId)
                            .product(product)
                            .quantity(quantity != null ? quantity : 1)
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

        cart.setQuantity(quantity);
        return cartRepository.save(cart);
    }

    /**
     * Cart 엔티티 -> CartDto 변환
     */
    public CartDto toDto(Cart cart) {
        return CartDto.builder()
                .cartId(cart.getCartId())
                .userId(cart.getUserId())
                .product(productService.toDto(cart.getProduct()))
                .quantity(cart.getQuantity())
                .build();
    }
}

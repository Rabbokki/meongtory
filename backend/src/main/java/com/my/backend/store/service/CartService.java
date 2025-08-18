package com.my.backend.store.service;

import com.my.backend.account.entity.Account;
import com.my.backend.account.repository.AccountRepository;
import com.my.backend.global.dto.ResponseDto;
import com.my.backend.store.dto.CartDto;
import com.my.backend.store.dto.NaverProductDto;
import com.my.backend.store.entity.Cart;
import com.my.backend.store.entity.Product;
import com.my.backend.store.entity.NaverProduct;
import com.my.backend.store.repository.CartRepository;
import com.my.backend.store.repository.ProductRepository;
import com.my.backend.store.repository.NaverProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final NaverProductRepository naverProductRepository;
    private final AccountRepository accountRepository;
    private final ProductService productService;

    /**
     * 사용자별 장바구니 전체 조회 (엔티티 리스트)
     */
    public List<Cart> getCartByAccountId(Long accountId) {
        return cartRepository.findByAccount_Id(accountId);
    }

    public ResponseDto<?> addToCart(Long id, Account account, CartDto cartDto) {
        Product product = productRepository.findById(id).orElse(null);
        if (ObjectUtils.isEmpty(product)) {
            return ResponseDto.fail("상품 없음", "찾을 수 없습니다");
        }
        Cart cart = cartRepository.findByProductAndAccount(product, account);
        if (cart != null) {
            cart.setQuantity(cart.getQuantity() + 1);
            cartRepository.save(cart);
            CartDto dto = new CartDto(cart);
            return ResponseDto.success(dto);
        } else {
            Long price = product.getPrice() * 1;
            Cart cart1 = new Cart(product, account, 1, price);
            cartRepository.save(cart1);
            CartDto dto = new CartDto(cart1);
            return ResponseDto.success(dto);
        }

}

/**
 * 사용자별 장바구니 전체 조회 (DTO 리스트)
 */
public List<CartDto> getCartDtoByAccountId(Long accountId) {
    System.out.println("=== CartService.getCartDtoByAccountId ===");
    System.out.println("조회할 사용자 ID: " + accountId);

    if (accountId == null) {
        System.out.println("ERROR: accountId가 null입니다.");
        throw new IllegalArgumentException("사용자 ID가 필요합니다.");
    }

    List<Cart> carts = cartRepository.findByAccount_IdWithProduct(accountId);
    System.out.println("조회된 장바구니 항목 수: " + carts.size());

    for (Cart cart : carts) {
        System.out.println("장바구니 항목 ID: " + cart.getId() + ", 소유자 ID: " + cart.getAccount().getId());
    }

    List<CartDto> result = carts.stream()
            .map(this::toDto)
            .toList();

    System.out.println("반환할 DTO 수: " + result.size());
    System.out.println("================================");

    return result;
}

/**
 * 장바구니에 상품 추가 (중복 시 수량 증가)
 */
public Cart addToCart(Long accountId, Long productId, int quantity) {
    System.out.println("=== CartService.addToCart ===");
    System.out.println("사용자 ID: " + accountId);
    System.out.println("상품 ID: " + productId);
    System.out.println("수량: " + quantity);

    if (accountId == null) {
        System.out.println("ERROR: accountId가 null입니다.");
        throw new IllegalArgumentException("사용자 ID가 필요합니다.");
    }

    Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 존재하지 않습니다."));

    System.out.println("찾은 사용자: " + account.getEmail() + " (ID: " + account.getId() + ")");

    Product product = productRepository.findById(productId)
            .orElseThrow(() -> new IllegalArgumentException("해당 상품이 존재하지 않습니다."));

    // 재고 확인
    int requestedQuantity = (quantity > 0) ? quantity : 1;

    // 기존 장바구니 항목 확인
    Cart existingCart = cartRepository.findByAccount_IdAndProduct_Id(accountId, productId).orElse(null);
    
    // 총 요청 수량 계산 (기존 장바구니 수량 + 새로 요청한 수량)
    int totalRequestedQuantity = requestedQuantity;
    if (existingCart != null) {
        totalRequestedQuantity += existingCart.getQuantity();
    }

    if (product.getStock() < totalRequestedQuantity) {
        throw new RuntimeException("상품 '" + product.getName() + "'의 재고가 부족합니다. (재고: " + product.getStock() + ", 요청: " + totalRequestedQuantity + ")");
    }
    
    if (existingCart != null) {
        // 기존 항목이 있으면 수량 증가
        existingCart.setQuantity(existingCart.getQuantity() + requestedQuantity);
        Cart saved = cartRepository.save(existingCart);
        System.out.println("기존 장바구니 항목 수량 증가: " + saved.getQuantity());
        return saved;
    } else {
        // 새 항목 생성
        Cart newCart = Cart.builder()
                .account(account)
                .product(product)
                .quantity(requestedQuantity)
                .build();
        
        Cart saved = cartRepository.save(newCart);
        System.out.println("새 장바구니 항목 생성: " + saved.getId());
        return saved;
    }
}

/**
 * 장바구니에서 항목 제거
 */
public void removeFromCart(Long cartId) {
    cartRepository.deleteById(cartId);
}

/**
 * 장바구니 수량 수정
 */
public Cart updateCartQuantity(Long cartId, int quantity) {
    Cart cart = cartRepository.findById(cartId)
            .orElseThrow(() -> new IllegalArgumentException("해당 장바구니 항목이 존재하지 않습니다."));

    // 일반 상품인 경우 재고 확인
    if (cart.getProduct() != null) {
        Product product = cart.getProduct();
        if (product.getStock() < quantity) {
            throw new RuntimeException("상품 '" + product.getName() + "'의 재고가 부족합니다. (재고: " + product.getStock() + ", 요청: " + quantity + ")");
        }
    }
    // 네이버 상품인 경우 재고 제한 없음

    cart.setQuantity(quantity);
    return cartRepository.save(cart);
}

/**
 * 네이버 상품을 장바구니에 추가
 */
public Cart addNaverProductToCart(Long accountId, Long naverProductId, int quantity) {
    System.out.println("=== CartService.addNaverProductToCart ===");
    System.out.println("사용자 ID: " + accountId);
    System.out.println("네이버 상품 ID: " + naverProductId);
    System.out.println("수량: " + quantity);

    if (accountId == null) {
        System.out.println("ERROR: accountId가 null입니다.");
        throw new IllegalArgumentException("사용자 ID가 필요합니다.");
    }

    Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 존재하지 않습니다."));

    System.out.println("찾은 사용자: " + account.getEmail() + " (ID: " + account.getId() + ")");

    // 네이버 상품 조회 (productId로 조회)
    NaverProduct naverProduct = naverProductRepository.findByProductId(String.valueOf(naverProductId))
            .orElseThrow(() -> new IllegalArgumentException("해당 네이버 상품이 존재하지 않습니다. 상품 ID: " + naverProductId));

    // 기존 장바구니 항목 확인
    Cart existingCart = cartRepository.findByAccount_IdAndNaverProduct_Id(accountId, naverProduct.getId()).orElse(null);
    
    int requestedQuantity = (quantity > 0) ? quantity : 1;
    
    if (existingCart != null) {
        // 기존 항목이 있으면 수량 증가
        existingCart.setQuantity(existingCart.getQuantity() + requestedQuantity);
        Cart saved = cartRepository.save(existingCart);
        System.out.println("기존 네이버 상품 장바구니 항목 수량 증가: " + saved.getQuantity());
        return saved;
    } else {
        // 새 항목 생성
        Cart newCart = Cart.builder()
                .account(account)
                .naverProduct(naverProduct)
                .quantity(requestedQuantity)
                .build();
        
        Cart saved = cartRepository.save(newCart);
        System.out.println("새 네이버 상품 장바구니 항목 생성: " + saved.getId());
        return saved;
    }
}

/**
 * Cart 엔티티 -> CartDto 변환
 */
public CartDto toDto(Cart cart) {
    return CartDto.builder()
            .id(cart.getId())
            .accountId(cart.getAccount().getId())
            .product(cart.getProduct() != null ? productService.toDto(cart.getProduct()) : null)
            .naverProduct(cart.getNaverProduct() != null ? convertNaverProductToDto(cart.getNaverProduct()) : null)
            .quantity(cart.getQuantity())
            .build();
}

/**
 * NaverProduct -> NaverProductDto 변환
 */
private NaverProductDto convertNaverProductToDto(NaverProduct naverProduct) {
    return NaverProductDto.builder()
            .id(naverProduct.getId())
            .productId(naverProduct.getProductId())
            .title(naverProduct.getTitle())
            .description(naverProduct.getDescription())
            .price(naverProduct.getPrice())
            .imageUrl(naverProduct.getImageUrl())
            .mallName(naverProduct.getMallName())
            .productUrl(naverProduct.getProductUrl())
            .brand(naverProduct.getBrand())
            .maker(naverProduct.getMaker())
            .category1(naverProduct.getCategory1())
            .category2(naverProduct.getCategory2())
            .category3(naverProduct.getCategory3())
            .category4(naverProduct.getCategory4())
            .reviewCount(naverProduct.getReviewCount())
            .rating(naverProduct.getRating())
            .searchCount(naverProduct.getSearchCount())
            .createdAt(naverProduct.getCreatedAt())
            .updatedAt(naverProduct.getUpdatedAt())
            .relatedProductId(naverProduct.getRelatedProduct() != null ? naverProduct.getRelatedProduct().getId() : null)
            .build();
}
}

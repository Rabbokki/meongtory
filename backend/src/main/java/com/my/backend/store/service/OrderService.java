package com.my.backend.store.service;

import com.my.backend.account.entity.Account;
import com.my.backend.account.repository.AccountRepository;
import com.my.backend.store.dto.OrderDto;
import com.my.backend.store.entity.Order;
import com.my.backend.store.entity.OrderItem;
import com.my.backend.store.entity.Product;
import com.my.backend.store.repository.OrderRepository;
import com.my.backend.store.repository.OrderItemRepository;
import com.my.backend.store.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.my.backend.store.entity.Cart;
import com.my.backend.store.repository.CartRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final AccountRepository accountRepository;

    // 주문 생성
    public Order createOrder(OrderDto orderDto) {
        System.out.println("=== createOrder 시작 ===");
        System.out.println("주문 데이터: " + orderDto);

        Account user = accountRepository.findById(orderDto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 존재하지 않습니다."));

        Order order = Order.builder()
                .user(user)
                .totalPrice(orderDto.getTotalPrice())
                .paymentStatus(Order.PaymentStatus.PENDING)
                .orderedAt(java.time.LocalDateTime.now())
                .build();

        Order savedOrder = orderRepository.save(order);
        System.out.println("주문 생성 완료, 주문 ID: " + savedOrder.getOrderId());

        // OrderItem 생성 및 재고 감소 (OrderDto에 orderItems가 있다면)
        if (orderDto.getOrderItems() != null) {
            System.out.println("OrderItem 생성 및 재고 감소 시작, 개수: " + orderDto.getOrderItems().size());
            for (var orderItemDto : orderDto.getOrderItems()) {
                System.out.println("처리 중인 OrderItem: " + orderItemDto);
                System.out.println("OrderItem의 imageUrl: " + orderItemDto.getImageUrl());

                // Product 조회
                var product = productRepository.findById(orderItemDto.getProductId())
                        .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다: " + orderItemDto.getProductId()));

                System.out.println("찾은 상품: " + product.getName() + ", 이미지: " + product.getImageUrl());

                // 재고 확인
                if (product.getStock() < orderItemDto.getQuantity()) {
                    throw new RuntimeException("상품 '" + product.getName() + "'의 재고가 부족합니다. (재고: " + product.getStock() + ", 요청: " + orderItemDto.getQuantity() + ")");
                }

                OrderItem orderItem = OrderItem.builder()
                        .order(savedOrder)
                        .product(product)
                        .productName(orderItemDto.getProductName())
                        .imageUrl(product.getImageUrl()) // Product 엔티티에서 이미지 URL 가져오기
                        .quantity(orderItemDto.getQuantity())
                        .price(orderItemDto.getPrice())
                        .build();
                orderItemRepository.save(orderItem);
                System.out.println("OrderItem 생성 완료: " + orderItem.getProductName());

                // 재고 감소
                product.setStock(product.getStock() - orderItemDto.getQuantity());
                productRepository.save(product);
                System.out.println("재고 감소 완료: " + product.getName() + " (감소: " + orderItemDto.getQuantity() + ", 남은 재고: " + product.getStock() + ")");
            }
        } else {
            System.out.println("OrderItems가 null입니다.");
        }

        return savedOrder;
    }
    // 전체 주문 목록 조회
    public List<Order> getAllOrders() {
        // N+1 문제 해결을 위해 JOIN FETCH 사용
        return orderRepository.findAllWithOrderItemsAndProductOrderByOrderedAtDesc();
    }

    // 특정 사용자 주문 목록 조회
    public List<Order> getOrdersByUserId(Long userId) {
        // N+1 문제 해결을 위해 JOIN FETCH 사용
        return orderRepository.findByUser_IdWithOrderItemsAndProductOrderByOrderedAtDesc(userId);
    }

    // 주문 상태 업데이트 (예: 결제 완료)
    public Order updatePaymentStatus(Integer orderId, Order.PaymentStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("주문을 찾을 수 없습니다"));
        order.setPaymentStatus(status);
        return orderRepository.save(order);
    }

    // 주문 전체 삭제 (관리자 기능 등)
    public void deleteOrder(Integer orderId) {
        orderRepository.deleteById(orderId);
    }
    /**
     * 장바구니 전체 구매 처리
     */
    @Transactional
    public Order purchaseAllFromCart(Long userId) {
        System.out.println("=== purchaseAllFromCart 시작 ===");
        System.out.println("사용자 ID: " + userId);
        
        try {
            // 1. 사용자 존재 여부 먼저 확인
            System.out.println("사용자 조회 중...");
            Account user = accountRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("해당 사용자가 존재하지 않습니다: " + userId));
            System.out.println("사용자 조회 성공: " + user.getEmail());

            // 2. 장바구니 항목 조회 (Product 정보를 포함하여 조회)
            System.out.println("장바구니 조회 중...");
            List<Cart> cartItems = cartRepository.findByUser_IdWithProduct(userId);
            System.out.println("조회된 장바구니 항목 수: " + cartItems.size());
            
            if (cartItems.isEmpty()) {
                throw new IllegalArgumentException("장바구니가 비어 있습니다.");
            }

            // 3. 각 장바구니 항목의 Product 정보 확인
            System.out.println("장바구니 항목 상세 정보:");
            for (Cart cartItem : cartItems) {
                System.out.println("  - Cart ID: " + cartItem.getCartId());
                System.out.println("  - Product ID: " + cartItem.getProduct().getProductId());
                System.out.println("  - Product Name: " + cartItem.getProduct().getName());
                System.out.println("  - Product Price: " + cartItem.getProduct().getPrice());
                System.out.println("  - Quantity: " + cartItem.getQuantity());
            }

            // 4. 총 가격 계산
            int totalPrice = 0;
            for (Cart cartItem : cartItems) {
                totalPrice += cartItem.getProduct().getPrice() * cartItem.getQuantity();
                System.out.println("상품: " + cartItem.getProduct().getName() + ", 가격: " + cartItem.getProduct().getPrice() + ", 수량: " + cartItem.getQuantity());
            }
            System.out.println("총 가격: " + totalPrice);

            // 5. 주문 생성
            System.out.println("주문 생성 중...");
            Order order = Order.builder()
                    .user(user)
                    .totalPrice(totalPrice)
                    .paymentStatus(Order.PaymentStatus.PENDING)
                    .orderedAt(java.time.LocalDateTime.now())
                    .build();
            Order savedOrder = orderRepository.save(order);
            System.out.println("주문 생성 완료, 주문 ID: " + savedOrder.getOrderId());

            // 6. OrderItem 생성 및 재고 감소
            System.out.println("OrderItem 생성 및 재고 감소 중...");
            for (Cart cartItem : cartItems) {
                try {
                    // 재고 확인
                    Product product = cartItem.getProduct();
                    if (product.getStock() < cartItem.getQuantity()) {
                        throw new RuntimeException("상품 '" + product.getName() + "'의 재고가 부족합니다. (재고: " + product.getStock() + ", 요청: " + cartItem.getQuantity() + ")");
                    }
                    
                    OrderItem orderItem = OrderItem.builder()
                            .order(savedOrder)
                            .product(product)
                            .productName(product.getName())
                            .imageUrl(product.getImageUrl())
                            .quantity(cartItem.getQuantity())
                            .price(product.getPrice())
                            .build();
                    orderItemRepository.save(orderItem);
                    System.out.println("OrderItem 생성 완료: " + product.getName());
                    
                    // 재고 감소
                    product.setStock(product.getStock() - cartItem.getQuantity());
                    productRepository.save(product);
                    System.out.println("재고 감소 완료: " + product.getName() + " (감소: " + cartItem.getQuantity() + ", 남은 재고: " + product.getStock() + ")");
                } catch (Exception e) {
                    System.out.println("OrderItem 생성 중 오류: " + e.getMessage());
                    throw e;
                }
            }

            // 7. 장바구니 비우기
            System.out.println("장바구니 비우기 중...");
            cartRepository.deleteAll(cartItems);
            System.out.println("장바구니 비우기 완료");

            System.out.println("=== purchaseAllFromCart 완료 ===");
            return savedOrder;
        } catch (Exception e) {
            System.out.println("purchaseAllFromCart 중 오류 발생: " + e.getMessage());
            System.out.println("오류 타입: " + e.getClass().getName());
            e.printStackTrace();
            throw e;
        }
    }
}
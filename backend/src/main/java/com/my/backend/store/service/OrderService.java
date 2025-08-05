package com.my.backend.store.service;

import com.my.backend.store.dto.OrderDto;
import com.my.backend.store.entity.Order;
import com.my.backend.store.entity.OrderItem;
import com.my.backend.store.repository.OrderRepository;
import com.my.backend.store.repository.OrderItemRepository;
import com.my.backend.store.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
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

    // 주문 생성
    public Order createOrder(OrderDto orderDto) {
        System.out.println("=== createOrder 시작 ===");
        System.out.println("주문 데이터: " + orderDto);

        Order order = Order.builder()
                .userId(orderDto.getUserId())
                .totalPrice(orderDto.getTotalPrice())
                .paymentStatus(Order.PaymentStatus.PENDING)
                .build();

        Order savedOrder = orderRepository.save(order);
        System.out.println("주문 생성 완료, 주문 ID: " + savedOrder.getOrderId());

        // OrderItem 생성 (OrderDto에 orderItems가 있다면)
        if (orderDto.getOrderItems() != null) {
            System.out.println("OrderItem 생성 시작, 개수: " + orderDto.getOrderItems().size());
            for (var orderItemDto : orderDto.getOrderItems()) {
                System.out.println("처리 중인 OrderItem: " + orderItemDto);
                System.out.println("OrderItem의 imageUrl: " + orderItemDto.getImageUrl());

                // Product 조회
                var product = productRepository.findById(orderItemDto.getProductId())
                        .orElseThrow(() -> new RuntimeException("상품을 찾을 수 없습니다: " + orderItemDto.getProductId()));

                System.out.println("찾은 상품: " + product.getName() + ", 이미지: " + product.getImageUrl());

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
            }
        } else {
            System.out.println("OrderItems가 null입니다.");
        }

        return savedOrder;
    }
    // 전체 주문 목록 조회
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // 특정 사용자 주문 목록 조회
    public List<Order> getOrdersByUserId(Integer userId) {
        List<Order> orders = orderRepository.findByUserId(userId);

        // 각 주문의 OrderItem을 명시적으로 로드
        for (Order order : orders) {
            List<OrderItem> orderItems = orderItemRepository.findByOrderOrderId(order.getOrderId());
            order.setOrderItems(orderItems);
        }

        return orders;
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
    public Order purchaseAllFromCart(Integer userId) {
        // 1. 장바구니 항목 조회
        List<Cart> cartItems = cartRepository.findByUserId(userId);
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("장바구니가 비어 있습니다.");
        }

        // 2. 총 가격 계산
        int totalPrice = cartItems.stream()
                .mapToInt(item -> item.getProduct().getPrice() * item.getQuantity())
                .sum();

        // 3. 주문 생성
        Order order = Order.builder()
                .userId(userId)
                .totalPrice(totalPrice)
                .paymentStatus(Order.PaymentStatus.PENDING)
                .build();
        Order savedOrder = orderRepository.save(order);

        // 4. OrderItem 생성
        for (Cart cartItem : cartItems) {
            OrderItem orderItem = OrderItem.builder()
                    .order(savedOrder)
                    .product(cartItem.getProduct())
                    .productName(cartItem.getProduct().getName())
                    .imageUrl(cartItem.getProduct().getImageUrl()) // 상품 이미지 URL 저장
                    .quantity(cartItem.getQuantity())
                    .price(cartItem.getProduct().getPrice())
                    .build();
            orderItemRepository.save(orderItem);
        }

        // 5. 장바구니 비우기
        cartRepository.deleteAll(cartItems);

        return savedOrder;
    }
}
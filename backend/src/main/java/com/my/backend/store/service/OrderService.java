package com.my.backend.store.service;

import com.my.backend.store.dto.OrderDto;
import com.my.backend.store.entity.Order;
import com.my.backend.store.entity.OrderItem;
import com.my.backend.store.entity.Product;
import com.my.backend.store.repository.OrderRepository;
import com.my.backend.store.repository.OrderItemRepository;
import com.my.backend.store.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.my.backend.store.entity.Cart;
import com.my.backend.store.repository.CartRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;

    // 주문 생성
    public Order createOrder(OrderDto orderDto) {
        Order order = Order.builder()
                .userId(orderDto.getUserId())
                .totalPrice(orderDto.getTotalPrice())
                .paymentStatus(Order.PaymentStatus.PENDING)
                // 주문 날짜가 있으면 그걸 사용하고, 없으면 현재 시각
                .orderedAt(orderDto.getOrderedAt() != null ? orderDto.getOrderedAt() : LocalDateTime.now())
                .build();

        Order savedOrder = orderRepository.save(order);

        // 주문 상품 정보 저장
        if (orderDto.getOrderItems() != null) {
            List<OrderItem> orderItems = orderDto.getOrderItems().stream()
                    .map(itemDto -> {
                        Product product = productRepository.findById(itemDto.getProductId())
                                .orElse(null);

                        return OrderItem.builder()
                                .order(savedOrder)
                                .product(product)
                                .productName(itemDto.getProductName())
                                .imageUrl(itemDto.getImageUrl())
                                .quantity(itemDto.getQuantity())
                                .price(itemDto.getPrice())
                                .build();
                    })
                    .collect(Collectors.toList());

            orderItemRepository.saveAll(orderItems);
        }

        return savedOrder;
    }

    // 전체 주문 목록 조회
    public List<Order> getAllOrders() {
        List<Order> orders = orderRepository.findAll();

        for (Order order : orders) {
            List<OrderItem> orderItems = orderItemRepository.findByOrderOrderId(order.getOrderId());
            order.setOrderItems(orderItems);
        }

        return orders;
    }

    // 특정 사용자 주문 목록 조회
    public List<Order> getOrdersByUserId(Integer userId) {
        List<Order> orders = orderRepository.findByUserId(userId);

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

        // 3. 주문 생성 (orderedAt 현재 시각 추가)
        Order order = Order.builder()
                .userId(userId)
                .totalPrice(totalPrice)
                .paymentStatus(Order.PaymentStatus.PENDING)
                .orderedAt(LocalDateTime.now())
                .build();
        Order savedOrder = orderRepository.save(order);

        // 4. 주문 상품 정보 저장
        List<OrderItem> orderItems = cartItems.stream()
                .map(cartItem -> OrderItem.builder()
                        .order(savedOrder)
                        .product(cartItem.getProduct())
                        .productName(cartItem.getProduct().getName())
                        .imageUrl(cartItem.getProduct().getImageUrl())
                        .quantity(cartItem.getQuantity())
                        .price(cartItem.getProduct().getPrice())
                        .build())
                .collect(Collectors.toList());

        orderItemRepository.saveAll(orderItems);

        // 5. 장바구니 비우기
        cartRepository.deleteAll(cartItems);

        return savedOrder;
    }
}

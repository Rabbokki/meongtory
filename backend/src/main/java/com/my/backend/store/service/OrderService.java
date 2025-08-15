package com.my.backend.store.service;

import com.my.backend.account.entity.Account;
import com.my.backend.account.repository.AccountRepository;
import com.my.backend.store.dto.OrderRequestDto;
import com.my.backend.store.dto.OrderResponseDto;
import com.my.backend.store.entity.Order;
import com.my.backend.store.entity.OrderStatus;
import com.my.backend.store.entity.Product;
import com.my.backend.store.repository.CartRepository;
import com.my.backend.store.repository.OrderRepository;
import com.my.backend.store.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.my.backend.store.entity.Cart;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final CartRepository cartRepository; // 추가

    private final OrderRepository orderRepository;
    private final AccountRepository accountRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;

    // 단일 주문 생성
    @Transactional
    public OrderResponseDto createOrder(OrderRequestDto requestDto) {
        System.out.println("=== 주문 생성 요청 ===");
        System.out.println("요청 데이터: " + requestDto);
        System.out.println("AccountId: " + requestDto.getAccountId());
        System.out.println("ProductId: " + requestDto.getProductId());
        System.out.println("Quantity: " + requestDto.getQuantity());
        
        // 주문자 조회
        Account account = accountRepository.findById(requestDto.getAccountId())
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + requestDto.getAccountId()));
        System.out.println("찾은 계정: " + account.getEmail() + " (ID: " + account.getId() + ")");

        // 상품 조회
        Product product = productRepository.findById(requestDto.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Product not found: " + requestDto.getProductId()));
        System.out.println("찾은 상품: " + product.getName() + " (ID: " + product.getId() + ", 가격: " + product.getPrice() + ")");

        // 금액 계산
        long amount = (long) product.getPrice() * requestDto.getQuantity();
        System.out.println("계산된 금액: " + amount);

        // merchantOrderId 자동 생성
        String merchantOrderId = generateMerchantOrderId();
        System.out.println("생성된 주문 ID: " + merchantOrderId);

        // 주문 생성
        Order order = Order.builder()
                .merchantOrderId(merchantOrderId)
                .amount(amount)
                .status(OrderStatus.CREATED)
                .createdAt(LocalDateTime.now())
                .quantity(requestDto.getQuantity())
                .account(account)
                .product(product)
                .build();

        Order saved = orderRepository.save(order);
        System.out.println("주문 저장 완료: " + saved.getId());
        System.out.println("================================");
        
        return mapToResponseDto(saved);
    }

    // 단일 주문 조회
    @Transactional(readOnly = true)
    public OrderResponseDto getOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found id=" + id));
        return mapToResponseDto(order);
    }

    // 모든 사용자의 주문 조회 (관리자용)
    @Transactional(readOnly = true)
    public List<OrderResponseDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // 특정 사용자의 주문 조회
    @Transactional(readOnly = true)
    public List<OrderResponseDto> getUserOrders(Long accountId) {
        return orderRepository.findByAccountId(accountId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    // 주문 삭제
    @Transactional
    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Order not found id=" + id));
        orderRepository.delete(order);
    }

    @Transactional
    public List<OrderResponseDto> createOrdersFromCart(Long accountId) {
        // account 조회
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found: " + accountId));

        // CartService를 통해 장바구니 아이템 조회
        List<Cart> cartItems = cartService.getCartByAccountId(accountId);
        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("장바구니가 비어있습니다.");
        }

        List<Order> orders = cartItems.stream().map(cart -> {
            Product product = cart.getProduct();
            String merchantOrderId = generateMerchantOrderId();

            Order order = Order.builder()
                    .merchantOrderId(merchantOrderId)
                    .amount((Long) product.getPrice() * cart.getQuantity())
                    .status(OrderStatus.CREATED)
                    .createdAt(LocalDateTime.now())
                    .account(account)
                    .quantity(cart.getQuantity())
                    .product(product)
                    .build();

            return orderRepository.save(order);
        }).toList();

        // 주문 생성 후 장바구니 비우기
        cartItems.forEach(cart -> cartService.removeFromCart(cart.getId()));

        return orders.stream().map(this::mapToResponseDto).collect(Collectors.toList());
    }

    // 주문 엔티티 → DTO 매핑
    private OrderResponseDto mapToResponseDto(Order order) {
        return OrderResponseDto.builder()
                .id(order.getId())
                .merchantOrderId(order.getMerchantOrderId())
                .amount(order.getAmount())
                .status(order.getStatus())
                .createdAt(order.getCreatedAt())
                .paidAt(order.getPaidAt())
                .accountId(order.getAccount().getId())
                .quantity(order.getQuantity())
                .build();
    }

    // merchantOrderId 자동 생성
    private String generateMerchantOrderId() {
        String datePart = LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE); // 20250813
        long countToday = orderRepository.countByCreatedAtBetween(
                LocalDate.now().atStartOfDay(),
                LocalDate.now().plusDays(1).atStartOfDay()
        ) + 1;
        
        // 중복 방지를 위해 랜덤 숫자 추가
        String randomSuffix = String.format("%03d", (int)(Math.random() * 1000));
        return String.format("order-%s-%03d-%s", datePart, countToday, randomSuffix);
    }
    @Transactional
    public OrderResponseDto updateOrderStatus(Long orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found id=" + orderId));

        order.setStatus(newStatus);

        // 예: 결제 완료 시 paidAt 업데이트
        if (newStatus == OrderStatus.PAID) {
            order.setPaidAt(LocalDateTime.now());
        }

        Order updated = orderRepository.save(order);
        return mapToResponseDto(updated);
    }

}

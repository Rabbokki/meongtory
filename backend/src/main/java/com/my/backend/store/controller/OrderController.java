package com.my.backend.store.controller;

import com.my.backend.account.repository.AccountRepository;
import com.my.backend.store.dto.OrderDto;
import com.my.backend.store.entity.Order;
import com.my.backend.store.service.OrderService;
import com.my.backend.store.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final AccountRepository accountRepository;
    private final CartRepository cartRepository;

    // 주문 생성 (단일 or 전체 구매 공통)
    @PostMapping
    public Order createOrder(@RequestBody OrderDto orderDto) {
        return orderService.createOrder(orderDto);
    }

    // 전체 주문 목록 조회
    @GetMapping
    public List<Map<String, Object>> getAllOrders() {
        System.out.println("=== 전체 주문 목록 조회 시작 ===");
        
        List<Order> orders = orderService.getAllOrders();
        System.out.println("조회된 주문 수: " + orders.size());

        List<Map<String, Object>> result = orders.stream()
                .map(this::mapOrderToResponse)
                .collect(Collectors.toList());
                
        System.out.println("반환할 주문 데이터: " + result);
        return result;
    }

    // 특정 사용자 주문 조회
    @GetMapping("/user/{userId}")
    public List<Map<String, Object>> getOrdersByUser(@PathVariable Long userId) {
        System.out.println("=== 사용자 주문 조회 시작 ===");
        System.out.println("요청된 사용자 ID: " + userId);

        List<Order> orders = orderService.getOrdersByUserId(userId);
        System.out.println("조회된 주문 수: " + orders.size());

        // JOIN FETCH로 이미 로드된 OrderItem 확인
        for (Order order : orders) {
            if (order.getOrderItems() != null) {
                System.out.println("주문 " + order.getOrderId() + "의 OrderItem 수: " + order.getOrderItems().size());
                for (var item : order.getOrderItems()) {
                    System.out.println("  - 상품명: " + item.getProductName() + ", 이미지: " + item.getImageUrl());
                }
            } else {
                System.out.println("주문 " + order.getOrderId() + "의 OrderItem이 null입니다.");
            }
        }

        List<Map<String, Object>> result = orders.stream()
                .map(this::mapOrderToResponse)
                .collect(Collectors.toList());

        System.out.println("반환할 주문 데이터: " + result);
        return result;
    }

    // 주문 결제 상태 변경
    @PutMapping("/{orderId}/status")
    public Map<String, Object> updatePaymentStatus(
            @PathVariable Integer orderId,
            @RequestParam("status") Order.PaymentStatus status) {
        System.out.println("=== 주문 상태 업데이트 시작 ===");
        System.out.println("주문 ID: " + orderId);
        System.out.println("새 상태: " + status);

        try {
            Order updatedOrder = orderService.updatePaymentStatus(orderId, status);
            System.out.println("업데이트된 주문: " + updatedOrder.getOrderId());

            Map<String, Object> result = mapOrderToResponse(updatedOrder);
            System.out.println("반환할 결과: " + result);

            return result;
        } catch (Exception e) {
            System.out.println("주문 상태 업데이트 중 오류 발생: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("orderId", orderId);
            errorMap.put("userId", 0);
            errorMap.put("totalPrice", 0);
            errorMap.put("paymentStatus", status.toString());
            errorMap.put("orderedAt", "");
            errorMap.put("orderItems", List.of());
            errorMap.put("error", e.getMessage());

            return errorMap;
        }
    }

    // 주문 삭제
    @DeleteMapping("/{orderId}")
    public void deleteOrder(@PathVariable Integer orderId) {
        orderService.deleteOrder(orderId);
    }

    // 장바구니 전체 구매
    @PostMapping("/purchase-all/{userId}")
    public Order purchaseAllFromCart(@PathVariable Long userId) {
        System.out.println("=== OrderController.purchaseAllFromCart 시작 ===");
        System.out.println("요청된 사용자 ID: " + userId);
        
        try {
            // 1. 사용자 존재 여부 확인
            System.out.println("사용자 존재 여부 확인 중...");
            var user = accountRepository.findById(userId);
            if (user.isEmpty()) {
                System.out.println("사용자를 찾을 수 없습니다: " + userId);
                throw new RuntimeException("사용자를 찾을 수 없습니다: " + userId);
            }
            System.out.println("사용자 확인 완료: " + user.get().getEmail());

            // 2. 장바구니 항목 확인
            System.out.println("장바구니 항목 확인 중...");
            var cartItems = cartRepository.findByUser_Id(userId);
            System.out.println("장바구니 항목 수: " + cartItems.size());
            
            if (cartItems.isEmpty()) {
                System.out.println("장바구니가 비어있습니다.");
                throw new RuntimeException("장바구니가 비어있습니다.");
            }

            // 3. 주문 생성
            System.out.println("주문 생성 시작...");
            Order result = orderService.purchaseAllFromCart(userId);
            System.out.println("주문 생성 성공: " + result.getOrderId());
            return result;
        } catch (Exception e) {
            System.out.println("OrderController에서 오류 발생: " + e.getMessage());
            System.out.println("오류 타입: " + e.getClass().getName());
            e.printStackTrace();
            throw e;
        }
    }

    // 주문 및 주문상품 매핑 메서드
    private Map<String, Object> mapOrderToResponse(Order order) {
        try {
            System.out.println("=== 주문 매핑 시작 ===");
            System.out.println("주문 ID: " + order.getOrderId());
            System.out.println("사용자 ID: " + (order.getUser() != null ? order.getUser().getId() : "null"));
            System.out.println("주문 상품 수: " + (order.getOrderItems() != null ? order.getOrderItems().size() : 0));
            System.out.println("주문 날짜 (orderedAt): " + order.getOrderedAt());
            System.out.println("주문 날짜 null 여부: " + (order.getOrderedAt() == null));
            System.out.println("주문 날짜 타입: " + (order.getOrderedAt() != null ? order.getOrderedAt().getClass().getName() : "null"));
            System.out.println("주문 날짜 toString(): " + (order.getOrderedAt() != null ? order.getOrderedAt().toString() : "null"));

            Map<String, Object> orderMap = new HashMap<>();
            orderMap.put("orderId", order.getOrderId() != null ? order.getOrderId() : 0);
            orderMap.put("userId", order.getUser() != null ? order.getUser().getId() : 0);
            orderMap.put("totalPrice", order.getTotalPrice() != null ? order.getTotalPrice() : 0);
            orderMap.put("paymentStatus", order.getPaymentStatus() != null ? order.getPaymentStatus().toString() : "PENDING");
            orderMap.put("orderedAt", order.getOrderedAt() != null ? order.getOrderedAt().toString() : "");

            List<Map<String, Object>> orderItems;
            if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
                System.out.println("주문 상품 정보 처리 중...");
                orderItems = order.getOrderItems().stream()
                        .filter(item -> item != null)
                        .map(item -> {
                            try {
                                System.out.println("상품 ID: " + item.getId() + ", 상품명: " + item.getProductName() + ", 이미지: " + item.getImageUrl());
                                Map<String, Object> itemMap = new HashMap<>();
                                itemMap.put("id", item.getId() != null ? item.getId() : 0);
                                itemMap.put("productId", item.getProduct() != null ? item.getProduct().getProductId() : 0);
                                itemMap.put("productName", item.getProductName() != null ? item.getProductName() : "상품명 없음");
                                itemMap.put("ImageUrl", item.getImageUrl() != null ? item.getImageUrl() : "/placeholder.svg");
                                itemMap.put("quantity", item.getQuantity() != null ? item.getQuantity() : 1);
                                itemMap.put("price", item.getPrice() != null ? item.getPrice() : 0);
                                return itemMap;
                            } catch (Exception e) {
                                System.out.println("OrderItem 처리 중 오류: " + e.getMessage());
                                Map<String, Object> errorItemMap = new HashMap<>();
                                errorItemMap.put("id", 0);
                                errorItemMap.put("productId", 0);
                                errorItemMap.put("productName", "오류 발생");
                                errorItemMap.put("ImageUrl", "/placeholder.svg");
                                errorItemMap.put("quantity", 1);
                                errorItemMap.put("price", 0);
                                return errorItemMap;
                            }
                        })
                        .collect(Collectors.toList());
            } else {
                System.out.println("주문 상품 정보가 없습니다.");
                orderItems = List.of();
            }

            orderMap.put("orderItems", orderItems);
            System.out.println("매핑된 주문 데이터: " + orderMap);

            return orderMap;
        } catch (Exception e) {
            System.out.println("주문 매핑 중 오류 발생: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("orderId", 0);
            errorMap.put("userId", 0);
            errorMap.put("totalPrice", 0);
            errorMap.put("paymentStatus", "PENDING");
            errorMap.put("orderedAt", "");
            errorMap.put("orderItems", List.of());
            return errorMap;
        }
    }
}
package com.my.backend.store.controller;

import com.my.backend.store.dto.OrderDto;
import com.my.backend.store.entity.Order;
import com.my.backend.store.service.OrderService;
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

    // 주문 생성 (단일 or 전체 구매 공통)
    @PostMapping
    public Order createOrder(@RequestBody OrderDto orderDto) {
        return orderService.createOrder(orderDto);
    }

    // 전체 주문 목록 조회
    @GetMapping
    public List<Map<String, Object>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();

        return orders.stream()
                .map(this::mapOrderToResponse)
                .collect(Collectors.toList());
    }

    // 특정 사용자 주문 조회
    @GetMapping("/user/{userId}")
    public List<Map<String, Object>> getOrdersByUser(@PathVariable Integer userId) {
        System.out.println("=== 사용자 주문 조회 시작 ===");
        System.out.println("요청된 사용자 ID: " + userId);

        List<Order> orders = orderService.getOrdersByUserId(userId);
        System.out.println("조회된 주문 수: " + orders.size());

        // 각 주문의 OrderItem을 명시적으로 로드
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
    public Order purchaseAllFromCart(@PathVariable Integer userId) {
        return orderService.purchaseAllFromCart(userId);
    }

    // 주문 및 주문상품 매핑 메서드
    private Map<String, Object> mapOrderToResponse(Order order) {
        try {
            System.out.println("=== 주문 매핑 시작 ===");
            System.out.println("주문 ID: " + order.getOrderId());
            System.out.println("사용자 ID: " + order.getUserId());
            System.out.println("주문 상품 수: " + (order.getOrderItems() != null ? order.getOrderItems().size() : 0));

            Map<String, Object> orderMap = new HashMap<>();
            orderMap.put("orderId", order.getOrderId() != null ? order.getOrderId() : 0);
            orderMap.put("userId", order.getUserId() != null ? order.getUserId() : 0);
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
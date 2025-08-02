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
        List<Order> orders = orderService.getOrdersByUserId(userId);

        return orders.stream()
                .map(this::mapOrderToResponse)
                .collect(Collectors.toList());
    }

    // 주문 결제 상태 변경
    @PutMapping("/{orderId}/status")
    public Order updatePaymentStatus(
            @PathVariable Integer orderId,
            @RequestParam("status") Order.PaymentStatus status) {
        return orderService.updatePaymentStatus(orderId, status);
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
        Map<String, Object> orderMap = new HashMap<>();
        orderMap.put("orderId", order.getOrderId());
        orderMap.put("userId", order.getUserId());
        orderMap.put("totalPrice", order.getTotalPrice());
        orderMap.put("paymentStatus", order.getPaymentStatus());
        orderMap.put("orderedAt", order.getOrderedAt());

        List<Map<String, Object>> orderItems;
        if (order.getOrderItems() != null && !order.getOrderItems().isEmpty()) {
            orderItems = order.getOrderItems().stream()
                    .map(item -> {
                        Map<String, Object> itemMap = new HashMap<>();
                        itemMap.put("id", item.getId());
                        itemMap.put("productId", item.getProduct() != null ? item.getProduct().getProductId() : null);
                        itemMap.put("productName", item.getProductName() != null ? item.getProductName() : "상품명 없음");
                        itemMap.put("ImageUrl", item.getImageUrl() != null ? item.getImageUrl() : "/placeholder.svg");
                        itemMap.put("quantity", item.getQuantity() != null ? item.getQuantity() : 1);
                        itemMap.put("price", item.getPrice() != null ? item.getPrice() : 0);
                        return itemMap;
                    })
                    .collect(Collectors.toList());
        } else {
            orderItems = List.of();
        }

        orderMap.put("orderItems", orderItems);

        return orderMap;
    }
}

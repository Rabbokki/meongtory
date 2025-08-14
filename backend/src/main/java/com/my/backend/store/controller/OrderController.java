package com.my.backend.store.controller;

import com.my.backend.store.dto.CartOrderRequestDto;
import com.my.backend.store.dto.OrderRequestDto;
import com.my.backend.store.dto.OrderResponseDto;
import com.my.backend.store.entity.OrderStatus;
import com.my.backend.store.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // 단일 주문 생성
    @PostMapping
    public ResponseEntity<OrderResponseDto> createOrder(@Valid @RequestBody OrderRequestDto requestDto) {
        System.out.println("=== OrderController.createOrder ===");
        System.out.println("받은 요청 데이터: " + requestDto);
        System.out.println("AccountId: " + requestDto.getAccountId());
        System.out.println("ProductId: " + requestDto.getProductId());
        System.out.println("Quantity: " + requestDto.getQuantity());
        
        try {
            OrderResponseDto responseDto = orderService.createOrder(requestDto);
            System.out.println("주문 생성 성공: " + responseDto.getId());
            return ResponseEntity.ok(responseDto);
        } catch (Exception e) {
            System.out.println("주문 생성 실패: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    // 단일 주문 조회
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponseDto> getOrder(@PathVariable Long id) {
        OrderResponseDto responseDto = orderService.getOrder(id);
        return ResponseEntity.ok(responseDto);
    }

    // 사용자의 전체 주문 조회
    @GetMapping
    public ResponseEntity<List<OrderResponseDto>> getAllOrders() {
        List<OrderResponseDto> list = orderService.getAllOrders();
        return ResponseEntity.ok(list);
    }

    // 특정 사용자의 주문 조회
    @GetMapping("/user/{accountId}")
    public ResponseEntity<List<OrderResponseDto>> getUserOrders(@PathVariable Long accountId) {
        List<OrderResponseDto> userOrders = orderService.getUserOrders(accountId);
        return ResponseEntity.ok(userOrders);
    }

    // 장바구니 기반 전체 주문 생성
    @PostMapping("/bulk")
    public ResponseEntity<List<OrderResponseDto>> createOrdersFromCart(@Valid @RequestBody CartOrderRequestDto requestDto) {
        List<OrderResponseDto> responseDtos = orderService.createOrdersFromCart(requestDto.getAccountId());
        return ResponseEntity.ok(responseDtos);
    }

    // 관리자용 모든 사용자의 주문 조회
    @GetMapping("/admin/all")
    public ResponseEntity<List<OrderResponseDto>> getAllOrdersForAdmin() {
        List<OrderResponseDto> allOrders = orderService.getAllOrders(); // 서비스에서 전체 조회
        return ResponseEntity.ok(allOrders);
    }

    // 주문 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }

    // 주문 상태 변경 (관리자용)
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderResponseDto> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        OrderResponseDto updatedOrder = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(updatedOrder);
    }

}

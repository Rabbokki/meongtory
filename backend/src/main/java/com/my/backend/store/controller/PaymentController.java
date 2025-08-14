package com.my.backend.store.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.my.backend.store.dto.CancelPaymentRequest;
import com.my.backend.store.dto.ConfirmPaymentRequest;
import com.my.backend.store.dto.PaymentErrorResponse;
import com.my.backend.store.dto.SaveAmountRequest;
import com.my.backend.store.entity.TossPayment;
import com.my.backend.store.service.PaymentService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Base64;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class PaymentController {

    private final ObjectMapper objectMapper;
    private final PaymentService paymentService;

    // 환경변수 또는 application.properties에 설정한 toss.secret.key 주입
    @Value("${toss.secret.key}")
    private String secretKey;

    private String getAuthorizations() {
        // 시크릿 키 뒤에 ":" 반드시 포함해서 base64 인코딩
        String encoded = Base64.getEncoder().encodeToString((secretKey + ":").getBytes());
        return "Basic " + encoded;
    }

    @PostMapping("/saveAmount")
    public ResponseEntity<?> tempsave(HttpSession session, @RequestBody SaveAmountRequest saveAmountRequest) {
        session.setAttribute(saveAmountRequest.orderId(), saveAmountRequest.amount());
        return ResponseEntity.ok("Payment temp save successful");
    }

    @PostMapping("/verifyAmount")
    public ResponseEntity<?> verifyAmount(HttpSession session, @RequestBody SaveAmountRequest saveAmountRequest) {
        String amount = (String) session.getAttribute(saveAmountRequest.orderId());
        if (amount == null || !amount.equals(saveAmountRequest.amount())) {
            return ResponseEntity.badRequest()
                    .body(PaymentErrorResponse.builder()
                            .code(400)
                            .message("결제 금액 정보가 유효하지 않습니다.")
                            .build());
        }
        session.removeAttribute(saveAmountRequest.orderId());
        return ResponseEntity.ok("Payment is valid");
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@RequestBody ConfirmPaymentRequest confirmPaymentRequest) throws Exception {
        HttpResponse<String> response = requestConfirm(confirmPaymentRequest);

        if (response.statusCode() == 200) {
            try {
                TossPayment payment = paymentService.savePaymentInfo(confirmPaymentRequest, response.body());
                return ResponseEntity.ok(payment);
            } catch (Exception e) {
                requestPaymentCancel(confirmPaymentRequest.paymentKey(), "결제 승인 후 DB 저장 실패");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("결제 승인 후 DB 저장 중 오류가 발생하여 결제가 취소되었습니다.");
            }
        } else {
            return ResponseEntity.status(response.statusCode())
                    .body("결제 승인 실패: " + response.body());
        }
    }

    public HttpResponse<String> requestConfirm(ConfirmPaymentRequest confirmPaymentRequest) throws IOException, InterruptedException {
        JsonNode requestObj = objectMapper.createObjectNode()
                .put("orderId", confirmPaymentRequest.orderId())
                .put("amount", confirmPaymentRequest.amount())
                .put("paymentKey", confirmPaymentRequest.paymentKey());

        String requestBody = objectMapper.writeValueAsString(requestObj);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.tosspayments.com/v1/payments/confirm"))
                .header("Authorization", getAuthorizations())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        return HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
    }

    @PostMapping("/cancel")
    public ResponseEntity<?> cancelPayment(@RequestBody CancelPaymentRequest cancelPaymentRequest) throws IOException, InterruptedException {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body("취소 기능은 아직 구현되지 않았습니다.");
    }

    public HttpResponse<String> requestPaymentCancel(String paymentKey, String cancelReason) throws IOException, InterruptedException {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.tosspayments.com/v1/payments/" + paymentKey + "/cancel"))
                .header("Authorization", getAuthorizations())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString("{\"cancelReason\":\"" + cancelReason + "\"}"))
                .build();

        return HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPayment(@PathVariable("id") String backendOrderId) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).body("조회 기능은 아직 구현되지 않았습니다.");
    }
}

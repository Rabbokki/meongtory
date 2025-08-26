package com.my.backend.global.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(BadWordException.class)
    public ResponseEntity<Map<String, String>> handleBadWord(BadWordException ex) {
        System.out.println("=== GlobalExceptionHandler - BadWordException 처리 ===");
        System.out.println("Exception message: " + ex.getMessage());
        
        Map<String, String> body = new HashMap<>();
        body.put("message", ex.getMessage());
        
        System.out.println("Response body: " + body);
        return ResponseEntity.badRequest().body(body);
    }
}

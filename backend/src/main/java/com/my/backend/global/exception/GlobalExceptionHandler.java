package com.my.backend.global.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BadWordException.class)
    public ResponseEntity<Map<String, String>> handleBadWord(BadWordException ex) {
        log.info("BadWordException 발생: {}", ex.getMessage());
        
        Map<String, String> body = new HashMap<>();
        body.put("message", ex.getMessage());
        
        return ResponseEntity.badRequest().body(body);
    }
}

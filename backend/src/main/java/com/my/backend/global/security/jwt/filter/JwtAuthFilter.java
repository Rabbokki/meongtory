package com.my.backend.global.security.jwt.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.my.backend.global.dto.GlobalResDto;
import com.my.backend.global.security.jwt.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Enumeration;

@Slf4j
@RequiredArgsConstructor
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        Enumeration<String> headerNames = request.getHeaderNames();
        log.info("🔥 Incoming request headers:");
        while (headerNames.hasMoreElements()) {
            String headerName = headerNames.nextElement();
            log.info("{}: {}", headerName, request.getHeader(headerName));
        }

        log.info("Request Content-Type: {}", request.getContentType());
        String accessToken = jwtUtil.getHeaderToken(request, "Access_Token");
        String refreshToken = jwtUtil.getHeaderToken(request, "Refresh_Token");

        log.info("Access Token from header: {}", accessToken);
        log.info("Refresh Token from header: {}", refreshToken);
        log.info("Raw Access_Token from header: {}", request.getHeader("Access_Token"));
        log.info("Parsed Access Token: {}", accessToken);

        if (accessToken != null) {
            if (!jwtUtil.tokenValidation(accessToken)) {
                log.warn("Token validation failed for Access Token: {}", accessToken);
                handleAuthenticationFailure(request, response, "AccessToken Expired", HttpStatus.UNAUTHORIZED);
                return;
            }
            String email = jwtUtil.getEmailFromToken(accessToken);
            log.info("Extracted email from Access Token: {}", email);
            setAuthentication(email);
            log.info("Authentication set for Access Token: {}", SecurityContextHolder.getContext().getAuthentication());
        } else if (refreshToken != null) {
            if (!jwtUtil.refreshTokenValidation(refreshToken)) {
                log.warn("Token validation failed for Refresh Token: {}", refreshToken);
                handleAuthenticationFailure(request, response, "RefreshToken Expired", HttpStatus.BAD_REQUEST);
                return;
            }
            String email = jwtUtil.getEmailFromToken(refreshToken);
            log.info("Extracted email from Refresh Token: {}", email);
            setAuthentication(email);
            log.info("Authentication set for Refresh Token: {}", SecurityContextHolder.getContext().getAuthentication());
        } else {
            log.info("No valid tokens provided - Proceeding without authentication");
        }

        filterChain.doFilter(request, response);
    }

    public void setAuthentication(String email) {
        try {
            Authentication authentication = jwtUtil.createAuthentication(email);
            if (authentication == null) {
                log.error("Failed to create authentication for email: {}", email);
                return;
            }
            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.info("Authentication successfully set in SecurityContext: {}", authentication);
        } catch (Exception e) {
            log.error("Error setting authentication for email: {}. Exception: {}", email, e.getMessage());
        }
    }

    /**
     * 인증 실패 시 API 요청과 웹 페이지 요청을 구분하여 처리
     */
    private void handleAuthenticationFailure(HttpServletRequest request, HttpServletResponse response, String msg, HttpStatus status) throws IOException {
        String requestURI = request.getRequestURI();
        log.info("Authentication failure for URI: {}", requestURI);

        // API 요청인 경우 JSON 응답으로 401 상태 코드 반환
        if (requestURI.startsWith("/api/")) {
            jwtExceptionHandler(response, msg, status);
        } else {
            // 웹 페이지 요청인 경우 로그인 페이지로 리다이렉트
            response.sendRedirect("/login");
        }
    }

    public void jwtExceptionHandler(HttpServletResponse response, String msg, HttpStatus status) {
        response.setStatus(status.value());
        response.setContentType("application/json");
        try {
            String json = new ObjectMapper().writeValueAsString(new GlobalResDto(msg, status.value()));
            response.getWriter().write(json);
        } catch (Exception e) {
            log.error(e.getMessage());
        }
    }
}

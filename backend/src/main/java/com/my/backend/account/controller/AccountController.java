package com.my.backend.account.controller;

import com.my.backend.account.dto.AccountRegisterRequestDto;
import com.my.backend.account.dto.LoginRequestDto;
import com.my.backend.account.service.AccountService;
import com.my.backend.global.dto.GlobalResDto;
import com.my.backend.global.dto.ResponseDto;
import com.my.backend.global.security.jwt.dto.TokenDto;
import com.my.backend.global.security.jwt.util.JwtUtil;
import com.my.backend.global.security.user.UserDetailsImpl;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Slf4j
public class AccountController {
    private final AccountService accountService;
    private final JwtUtil jwtUtil;

    //회원가입
    @PostMapping("/register")
    public ResponseDto<?> register(@RequestBody @Valid AccountRegisterRequestDto request) {
        log.info("회원가입 요청 수신: email={}, name={}", request.getEmail(), request.getName());
        try {
            ResponseDto<?> response = accountService.register(request);
            log.info("회원가입 성공: email={}", request.getEmail());
            return response;
        } catch (Exception e) {
            log.error("회원가입 실패: email={}, error={}", request.getEmail(), e.getMessage());
            return ResponseDto.fail("REGISTRATION_FAILED", e.getMessage());
        }
    }

    //로그인
    @PostMapping("/login")
    public ResponseDto<?> login(@RequestBody @Valid LoginRequestDto loginReqDto) {
        try {
            TokenDto tokenDto = accountService.accountLogin(loginReqDto);
            return ResponseDto.success(tokenDto);
        } catch (Exception e) {
            return ResponseDto.fail("LOGIN_FAILED", e.getMessage());
        }
    }

    //로그아웃
    @PostMapping("/logout")
    public ResponseDto<?> logout(@AuthenticationPrincipal UserDetailsImpl userDetails)throws Exception{
        String email = userDetails.getAccount().getEmail();
        accountService.accountLogout(email);
        return ResponseDto.success("로그아웃이 완료되었습니다.");
    }

    @GetMapping("/me")
    public ResponseDto<?> getUserInfo(@AuthenticationPrincipal UserDetailsImpl userDetails) throws IOException {
        if (userDetails == null) {
            return ResponseDto.fail("UNAUTHORIZED", "인증이 필요합니다.");
        }
        String email = userDetails.getUsername();
        return ResponseDto.success(accountService.getUserInfoByEmail(email));
    }


}
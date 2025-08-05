package com.my.backend.account.service;

import com.my.backend.account.dto.AccountRegisterRequestDto;
import com.my.backend.account.dto.AccountResponseDto;
import com.my.backend.account.dto.LoginRequestDto;
import com.my.backend.account.entity.Account;
import com.my.backend.account.entity.RefreshToken;
import com.my.backend.account.repository.AccountRepository;
import com.my.backend.account.repository.RefreshTokenRepository;
import com.my.backend.global.dto.ResponseDto;
import com.my.backend.global.security.jwt.dto.TokenDto;
import com.my.backend.global.security.jwt.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountService {
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;

    @Transactional
    public ResponseDto<?> register(AccountRegisterRequestDto requestDto) {
        if (accountRepository.findByEmail(requestDto.getEmail()).isPresent()) {
            return ResponseDto.fail("EMAIL_ALREADY_TAKEN", "이미 사용 중인 이메일입니다.");
        }

        requestDto.setEncodePwd(passwordEncoder.encode(requestDto.getPassword()));

        Account account = new Account(requestDto);
        accountRepository.save(account);

        AccountResponseDto responseDto = new AccountResponseDto(
                account.getId(),
                account.getEmail(),
                account.getName(),
                account.getRole(),
                account.getPet(),
                account.getPetAge(),
                account.getPetBreeds()
        );

        return ResponseDto.success(responseDto);
    }

    @Transactional
    public TokenDto accountLogin(LoginRequestDto request) {
        Account account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 이메일입니다."));

        if (!passwordEncoder.matches(request.getPassword(), account.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        TokenDto tokenDto = jwtUtil.createAllToken(account.getEmail(), account.getRole());
        RefreshToken refreshToken = RefreshToken.builder()
                .accountEmail(account.getEmail())
                .refreshToken(tokenDto.getRefreshToken())
                .build();
        refreshTokenRepository.save(refreshToken);
        log.info("로그인 성공: {}", account.getEmail());
        return tokenDto;
    }

    @Transactional
    public void accountLogout(String email) {
        refreshTokenRepository.deleteByAccountEmail(email);
        log.info("로그아웃 성공: {}", email);
    }

    public AccountResponseDto getUserInfoByEmail(String email) {
        if (email == null || email.isEmpty()) {
            throw new IllegalArgumentException("이메일이 제공되지 않았습니다.");
        }
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("계정이 없습니다: " + email));
        return new AccountResponseDto(
                account.getId(),
                account.getEmail(),
                account.getName(),
                account.getRole(),
                account.getPet(),
                account.getPetAge(),
                account.getPetBreeds()
        );
    }


}
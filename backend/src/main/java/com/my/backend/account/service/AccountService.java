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
import com.my.backend.pet.entity.MyPet;
import com.my.backend.pet.repository.MyPetRepository;
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
    private final MyPetRepository myPetRepository;

    @Transactional
    public ResponseDto<?> register(AccountRegisterRequestDto requestDto) {
        if (accountRepository.findByEmail(requestDto.getEmail()).isPresent()) {
            return ResponseDto.fail("EMAIL_ALREADY_TAKEN", "이미 사용 중인 이메일입니다.");
        }

        requestDto.setEncodePwd(passwordEncoder.encode(requestDto.getPassword()));

        Account account = new Account(requestDto);
        accountRepository.save(account);

        // 회원가입 시 펫 정보가 있으면 MyPet도 함께 생성
        if (requestDto.getPet() != null && requestDto.getPetBreeds() != null) {
            try {
                MyPet myPet = MyPet.builder()
                        .owner(account)
                        .name(account.getName() + "의 " + getPetDisplayName(requestDto.getPet()))
                        .breed(requestDto.getPetBreeds())
                        .age(parseAge(requestDto.getPetAge()))
                        .gender(MyPet.Gender.UNKNOWN)
                        .type(getPetDisplayName(requestDto.getPet()))
                        .build();
                
                myPetRepository.save(myPet);
                log.info("회원가입 시 펫 정보 자동 등록 완료: {}", account.getEmail());
            } catch (Exception e) {
                log.warn("회원가입 시 펫 정보 자동 등록 실패: {}", e.getMessage());
                // 펫 등록 실패해도 회원가입은 성공으로 처리
            }
        }

        AccountResponseDto responseDto = new AccountResponseDto(
                account.getId(),
                account.getEmail(),
                account.getName(),
                account.getRole()
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
                account.getRole()
        );
    }
    
    // 펫 타입을 한글 표시명으로 변환
    private String getPetDisplayName(com.my.backend.account.entity.PetType petType) {
        if (petType == null) return "반려동물";
        switch (petType) {
            case DOG:
                return "강아지";
            case CAT:
                return "고양이";
            default:
                return "반려동물";
        }
    }
    
    // 나이 파싱 헬퍼 메서드
    private Integer parseAge(String ageStr) {
        if (ageStr == null || ageStr.trim().isEmpty()) {
            return null;
        }
        
        try {
            // "2살", "5개월" 등의 형식을 파싱
            if (ageStr.contains("살")) {
                return Integer.parseInt(ageStr.replace("살", "").trim());
            } else if (ageStr.contains("개월")) {
                int months = Integer.parseInt(ageStr.replace("개월", "").trim());
                return months / 12; // 개월을 년으로 변환
            } else {
                // 숫자만 있는 경우
                return Integer.parseInt(ageStr.trim());
            }
        } catch (NumberFormatException e) {
            log.warn("나이 파싱 실패: {}", ageStr);
            return null;
        }
    }
}
package com.my.backend.account.oauth2;

import com.my.backend.account.entity.Account;
import com.my.backend.account.entity.RefreshToken;
import com.my.backend.account.repository.AccountRepository;
import com.my.backend.account.repository.RefreshTokenRepository;
import com.my.backend.account.service.AccountService;
import com.my.backend.global.security.jwt.dto.TokenDto;
import com.my.backend.global.security.jwt.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
    private final AccountRepository accountRepository;
    private final JwtUtil jwtUtil; // JwtUtil로 토큰 생성 처리
    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String userNameAttributeName = userRequest.getClientRegistration()
                .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

        OAuth2UserInfo oAuth2UserInfo = getOAuth2UserInfo(registrationId, oAuth2User.getAttributes());

        String email = oAuth2UserInfo.getEmail();
        String name = oAuth2UserInfo.getName();
        String provider = oAuth2UserInfo.getProvider();
        String providerId = oAuth2UserInfo.getProviderId();

        Account account = accountRepository.findByProviderAndProviderId(provider, providerId)
                .orElseGet(() -> {
                    Account newAccount = new Account(email, name, provider, providerId);
                    return accountRepository.save(newAccount);
                });

        // OAuth2 로그인 후 토큰 생성
        TokenDto tokenDto = jwtUtil.createAllToken(account.getEmail(), account.getRole());
        RefreshToken refreshToken = RefreshToken.builder()
                .accountEmail(account.getEmail())
                .refreshToken(tokenDto.getRefreshToken())
                .build();
        refreshTokenRepository.save(refreshToken);
        log.info("OAuth2 로그인 성공: {}", account.getEmail());

        return new CustomUserDetails(account, oAuth2User.getAttributes());
    }

    private OAuth2UserInfo getOAuth2UserInfo(String registrationId, Map<String, Object> attributes) {
        if ("google".equals(registrationId)) {
            return new GoogleUserDetails(attributes);
        } else {
            log.error("지원하지 않는 OAuth2 제공자: {}", registrationId);
            throw new OAuth2AuthenticationException("지원하지 않는 OAuth2 제공자입니다: " + registrationId);
        }
    }
}

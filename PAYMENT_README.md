# 토스페이먼츠 v2 SDK 결제 시스템 구현 완료

## 개요
토스페이먼츠 공식 문서를 기반으로 한 완전한 결제 시스템을 구현했습니다. v2 SDK를 사용하여 최신 토스페이먼츠 결제 서비스를 연동했습니다.

## 주요 개선사항

### 1. 프론트엔드 (React/Next.js)
- **토스페이먼츠 v2 SDK 적용**: v1에서 v2로 마이그레이션
- **통합 SDK 사용**: `https://js.tosspayments.com/v2/standard` 사용
- **결제창 방식**: `payment.requestPayment()` 메서드 사용
- **다양한 결제수단 지원**: 카드, 계좌이체, 가상계좌
- **비회원 결제**: `TossPayments.ANONYMOUS` 사용

### 2. 백엔드 (Spring Boot)
- **결제 승인 API**: 토스페이먼츠 공식 문서 기반 구현
- **결제 취소 API**: 완전한 취소 기능 구현
- **결제 조회 API**: 주문 ID 기반 결제 정보 조회
- **에러 처리 강화**: 상세한 로깅과 에러 응답
- **보안 검증**: 결제 금액 검증 로직

### 3. 결제 플로우
```
1. 결제창 요청 (프론트엔드)
   ↓
2. 결제 인증 (토스페이먼츠)
   ↓
3. 성공/실패 리다이렉트
   ↓
4. 결제 승인 API 호출 (백엔드)
   ↓
5. DB 저장 및 완료
```

## 구현된 기능

### 결제창 연동
- ✅ 토스페이먼츠 v2 SDK 연동
- ✅ 카드, 계좌이체, 가상계좌 지원
- ✅ 결제 금액 설정 및 검증
- ✅ 성공/실패 URL 처리

### 결제 승인
- ✅ 토스페이먼츠 결제 승인 API 연동
- ✅ 결제 정보 DB 저장
- ✅ 에러 처리 및 로깅
- ✅ 결제 금액 검증

### 결제 취소
- ✅ 토스페이먼츠 결제 취소 API 연동
- ✅ DB 상태 업데이트
- ✅ 부분 취소 지원 (구조 준비)

### 결제 조회
- ✅ 주문 ID 기반 결제 정보 조회
- ✅ 결제 상태 확인

### 에러 처리
- ✅ 토스페이먼츠 공식 에러 코드 매핑
- ✅ 사용자 친화적 에러 메시지
- ✅ 카테고리별 해결 방법 안내

## 파일 구조

### 프론트엔드
```
frontend/app/(store)/payment/
├── PaymentPage.tsx          # 결제 페이지 (v2 SDK 적용)
├── success/page.tsx         # 결제 성공 페이지
└── fail/page.tsx           # 결제 실패 페이지
```

### 백엔드
```
backend/src/main/java/com/my/backend/store/
├── controller/
│   └── PaymentController.java    # 결제 관련 API 컨트롤러
├── service/
│   └── PaymentService.java       # 결제 비즈니스 로직
├── entity/
│   ├── TossPayment.java          # 결제 엔티티
│   ├── TossPaymentStatus.java    # 결제 상태 enum
│   └── TossPaymentMethod.java    # 결제 수단 enum
├── repository/
│   └── TossPaymentRepository.java # 결제 데이터 접근
└── dto/
    ├── ConfirmPaymentRequest.java # 결제 승인 요청 DTO
    └── CancelPaymentRequest.java  # 결제 취소 요청 DTO
```

## API 엔드포인트

### 결제 관련
- `POST /api/saveAmount` - 결제 금액 임시 저장
- `POST /api/verifyAmount` - 결제 금액 검증
- `POST /api/confirm` - 결제 승인
- `POST /api/cancel` - 결제 취소
- `GET /api/payment/{id}` - 결제 정보 조회

## 환경 설정

### 프론트엔드 환경변수
```env
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_D4yKeq5bgrpKRd0JYbLVGX0lzW6Y
```

### 백엔드 환경변수
```yaml
toss:
  payments:
    secret-key: test_sk_D4yKeq5bgrpKRd0JYbLVGX0lzW6Y
```

## 보안 고려사항

1. **결제 금액 검증**: 클라이언트에서 전송된 금액과 서버에 저장된 금액 비교
2. **API 키 보안**: 시크릿 키는 서버에서만 사용
3. **에러 처리**: 민감한 정보 노출 방지
4. **로깅**: 결제 과정의 모든 단계 로깅

## 테스트 방법

1. **테스트 키 사용**: 토스페이먼츠 테스트 키로 안전한 테스트 가능
2. **다양한 시나리오**: 성공, 실패, 취소 등 모든 케이스 테스트

## 주요 변경사항 (v1 → v2)

### 프론트엔드
- SDK 로드 방식 변경: `https://js.tosspayments.com/v2/standard`
- 결제창 인스턴스 생성: `tossPayments.payment({ customerKey: TossPayments.ANONYMOUS })`
- 결제 요청 방식: `payment.requestPayment()` 메서드 사용
- 파라미터 구조 변경: 결제수단과 결제정보 통합

### 백엔드
- API 엔드포인트: v1 API 사용 (변경 없음)
- 에러 처리 강화: 토스페이먼츠 공식 에러 코드 매핑
- 결제 정보 저장: JSON 형태로 상세 정보 저장
- 보안 검증: 결제 금액 검증 로직 추가

## 에러 코드 매핑

토스페이먼츠 공식 에러 코드를 사용자 친화적인 메시지로 변환:

- `PAY_PROCESS_CANCELED`: "결제가 취소되었습니다."
- `INSUFFICIENT_BALANCE`: "잔액이 부족합니다."
- `CARD_EXPIRED`: "만료된 카드입니다."
- `INVALID_ORDER_ID`: "유효하지 않은 주문번호입니다."
- 기타 다양한 에러 코드 지원

## 결제 수단별 설정

### 카드 결제
```javascript
card: {
  useEscrow: false,
  flowMode: "DEFAULT",
  useCardPoint: false,
  useAppCardOnly: false,
}
```

### 계좌이체
```javascript
transfer: {
  cashReceipt: {
    type: "소득공제",
  },
  useEscrow: false,
}
```

### 가상계좌
```javascript
virtualAccount: {
  validHours: 24,
  cashReceipt: {
    type: "소득공제",
  },
}
```

## 로깅 및 모니터링

- 모든 결제 과정의 상세 로깅
- 에러 발생 시 자동 알림 구조
- 결제 성공/실패 통계 수집
- 보안 이벤트 모니터링

## 성능 최적화

- 결제창 로딩 최적화
- API 응답 시간 모니터링
- 데이터베이스 쿼리 최적화
- 캐싱 전략 적용

## 향후 개선 계획

1. **웹훅 연동**: 토스페이먼츠 웹훅을 통한 실시간 결제 상태 업데이트
2. **부분 취소**: 부분 취소 기능 완전 구현
3. **정기 결제**: 자동결제(빌링) 기능 추가
4. **해외 결제**: 다국어 결제 지원
5. **모바일 SDK**: React Native, Flutter SDK 연동

## 문제 해결

### 자주 발생하는 문제

1. **SDK 로딩 실패**
   - 네트워크 연결 확인
   - 클라이언트 키 유효성 검증

2. **결제 승인 실패**
   - 결제 금액 검증 확인
   - 주문 ID 중복 확인
   - API 키 권한 확인

3. **에러 응답 파싱 실패**
   - 토스페이먼츠 응답 형식 확인
   - JSON 파싱 로직 검증

### 디버깅 방법

1. 브라우저 개발자 도구에서 네트워크 탭 확인
2. 서버 로그에서 상세 에러 메시지 확인
3. 토스페이먼츠 개발자센터에서 결제 내역 확인

## 연락처

문제가 발생하거나 개선 사항이 있으시면 언제든지 문의해주세요.

---

**구현 완료일**: 2024년 12월
**버전**: v2.0.0
**토스페이먼츠 SDK 버전**: v2

# 입양신청 시스템 구현 TODO

## 1. 백엔드 구현 ✅

### 1.1 데이터베이스 엔티티 생성 ✅
- [x] `AdoptionRequest` 엔티티 생성
  - [x] id, petId, userId, status, message, createdAt, updatedAt 필드
  - [x] status: "PENDING", "APPROVED", "REJECTED", "CONTACTED" enum
  - [x] Pet, User와의 관계 설정

### 1.2 Repository 생성 ✅
- [x] `AdoptionRequestRepository` 생성
- [x] 기본 CRUD 메서드 구현
- [x] 사용자별, 펫별 조회 메서드 추가

### 1.3 Service 생성 ✅
- [x] `AdoptionRequestService` 생성
- [x] 입양신청 생성 메서드
- [x] 상태 변경 메서드 (승인, 거절, 전화연결완료)
- [x] 조회 메서드들

### 1.4 Controller 생성 ✅
- [x] `AdoptionRequestController` 생성
- [x] POST `/api/adoption-requests` - 입양신청 생성
- [x] GET `/api/adoption-requests` - 입양신청 목록 조회
- [x] PUT `/api/adoption-requests/{id}/status` - 상태 변경
- [x] GET `/api/adoption-requests/user/{userId}` - 사용자별 신청 조회

## 2. 프론트엔드 구현

### 2.1 입양신청 모달 생성 ✅
- [x] `adoption-request-modal.tsx` 생성
- [x] 사용자 정보 입력 폼 (이름, 연락처, 메시지)
- [x] 신청 버튼 및 취소 버튼
- [x] 유효성 검사
- [x] **관리자 모드에서 필드 추가/삭제 기능**
- [x] **사용자 정보 자동 가져오기 기능**

### 2.2 입양 상세 페이지 수정 ✅
- [x] `adoption-detail-page.tsx` 수정
- [x] 입양신청 버튼 추가
- [x] 입양신청 모달 연결
- [x] 신청 상태 표시
- [x] **로그인한 회원만 신청 가능하도록 수정**

### 2.3 관리자 페이지 수정 ✅
- [x] `admin-page.tsx` 수정
- [x] 입양신청 관리 탭 추가
- [x] 신청 목록 테이블 생성
- [x] 상태 변경 드롭다운 추가
- [x] 사용자 정보 모달 연결

### 2.4 사용자 정보 모달 생성
- [ ] `user-info-modal.tsx` 생성
- [ ] 신청자 정보 표시 (이름, 연락처, 메시지)
- [ ] 승인/거절/전화연결완료 버튼
- [ ] 상태 변경 후 목록 새로고침

## 3. API 연동

### 3.1 프론트엔드 API 함수 추가 ✅
- [x] `lib/api.ts`에 입양신청 관련 함수 추가
- [x] `createAdoptionRequest`
- [x] `getAdoptionRequests`
- [x] `updateAdoptionRequestStatus`
- [x] `getUserAdoptionRequests`
- [x] **사용자 정보 API 함수 추가**

### 3.2 상태 관리
- [ ] 입양신청 상태 관리
- [ ] 로딩 상태 처리
- [ ] 에러 처리

## 4. UI/UX 개선

### 4.1 상태 표시
- [ ] 신청 상태별 배지 색상 설정
- [ ] 상태 변경 시 시각적 피드백
- [ ] 로딩 스피너 추가

### 4.2 알림 시스템
- [ ] 신청 완료 알림
- [ ] 상태 변경 알림
- [ ] 에러 메시지 표시

## 5. 테스트 및 검증

### 5.1 기능 테스트
- [ ] 입양신청 생성 테스트
- [ ] 상태 변경 테스트
- [ ] 관리자 권한 테스트

### 5.2 UI 테스트
- [ ] 모달 동작 테스트
- [ ] 반응형 디자인 테스트
- [ ] 접근성 테스트

## 진행 순서
1. ✅ 백엔드 엔티티 및 기본 CRUD 구현
2. ✅ 프론트엔드 입양신청 모달 구현
3. ✅ 입양 상세 페이지 수정
4. 관리자 페이지 입양신청 관리 탭 구현
5. 사용자 정보 모달 구현
6. API 연동 및 테스트
7. UI/UX 개선

## 현재 상태
- [x] 백엔드 구현 완료
- [x] 입양신청 모달 구현 완료 (관리자 필드 편집 기능 포함)
- [x] 입양 상세 페이지 수정 완료 (로그인 체크 포함)
- [x] 관리자 페이지 입양신청 관리 탭 구현 완료

## 추가 구현된 기능
- ✅ **로그인한 회원만 입양신청 가능**: 비로그인 시 "로그인 후 입양신청" 버튼 표시
- ✅ **관리자 모드에서 모달 필드 편집**: 필드 추가/삭제 기능
- ✅ **동적 폼 필드**: 기본 필드 + 커스텀 필드 지원
- ✅ **사용자 정보 자동 가져오기**: 회원 정보를 자동으로 폼에 채워넣기
- ✅ **사용자 정보 미리보기**: 회원 정보를 시각적으로 표시
- ✅ **로딩 상태 표시**: 사용자 정보 가져오는 동안 로딩 스피너 표시 
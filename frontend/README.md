# 멍토리 프론트엔드 - Next.js 15.2.4 폴더 구조 정리

## 현재 상태 분석

### 현재 문제점
1. **루트 레벨에 페이지 파일들이 산재**: `admin-page.tsx`, `animal-edit-modal.tsx` 등이 루트에 위치
2. **App Router 미활용**: `app/` 폴더가 제대로 활용되지 않음
3. **컴포넌트 구조화 부족**: 공통 컴포넌트들이 적절히 분리되지 않음
4. **타입 정의 부족**: TypeScript 타입 정의가 분산되어 있음

## Next.js 15.2.4 권장 폴더 구조

```
frontend/
├── app/                          # App Router (Next.js 13+)
│   ├── (auth)/                   # 인증 관련 페이지 그룹
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── signup/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/              # 관리자 페이지 그룹
│   │   ├── admin/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (pets)/                   # 반려동물 관련 페이지 그룹
│   │   ├── adoption/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── diary/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── write/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── (store)/                  # 스토어 관련 페이지 그룹
│   │   ├── store/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── cart/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── (community)/              # 커뮤니티 관련 페이지 그룹
│   │   ├── community/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── write/
│   │   │       └── page.tsx
│   │   └── layout.tsx
│   ├── (services)/               # 서비스 관련 페이지 그룹
│   │   ├── insurance/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── naming/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/                      # API 라우트
│   │   ├── auth/
│   │   ├── pets/
│   │   ├── store/
│   │   └── ...
│   ├── globals.css
│   ├── layout.tsx                # 루트 레이아웃
│   └── page.tsx                  # 홈페이지
├── components/                   # 재사용 가능한 컴포넌트
│   ├── ui/                       # 기본 UI 컴포넌트 (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   └── ...
│   ├── forms/                    # 폼 관련 컴포넌트
│   │   ├── login-form.tsx
│   │   ├── signup-form.tsx
│   │   └── ...
│   ├── modals/                   # 모달 컴포넌트
│   │   ├── login-modal.tsx
│   │   ├── signup-modal.tsx
│   │   ├── animal-edit-modal.tsx
│   │   └── ...
│   ├── layout/                   # 레이아웃 컴포넌트
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   ├── sidebar.tsx
│   │   └── ...
│   └── features/                 # 기능별 컴포넌트
│       ├── pets/
│       │   ├── pet-card.tsx
│       │   ├── pet-form.tsx
│       │   └── ...
│       ├── store/
│       │   ├── product-card.tsx
│       │   ├── cart-item.tsx
│       │   └── ...
│       └── ...
├── lib/                          # 유틸리티 및 설정
│   ├── api.ts                    # API 클라이언트
│   ├── utils.ts                  # 유틸리티 함수
│   ├── auth.ts                   # 인증 관련
│   └── ...
├── hooks/                        # 커스텀 훅
│   ├── use-auth.ts
│   ├── use-pets.ts
│   ├── use-store.ts
│   └── ...
├── types/                        # TypeScript 타입 정의
│   ├── auth.ts
│   ├── pets.ts
│   ├── store.ts
│   ├── api.ts
│   └── ...
├── styles/                       # 스타일 파일
│   └── globals.css
├── public/                       # 정적 파일
│   ├── images/
│   ├── icons/
│   └── ...
└── config/                       # 설정 파일
    ├── site.ts
    └── ...
```

## 정리 작업 단계

### 1단계: 타입 정의 정리
- `types/` 폴더 생성
- 각 도메인별 타입 정의 파일 생성
- 공통 타입 정의

### 2단계: 컴포넌트 정리
- `components/` 폴더 구조화
- 모달 컴포넌트들을 `components/modals/`로 이동
- 기능별 컴포넌트들을 `components/features/`로 이동

### 3단계: 페이지 정리
- `app/` 폴더에 라우트 그룹 생성
- 각 페이지를 해당 라우트 그룹으로 이동
- 레이아웃 파일 생성

### 4단계: API 라우트 정리
- `app/api/` 폴더 구조화
- 각 도메인별 API 라우트 정리

### 5단계: 유틸리티 및 훅 정리
- `lib/` 폴더 정리
- `hooks/` 폴더 정리

## 파일 이동 계획

### 현재 파일 → 새로운 위치

#### 페이지 파일들
- `admin-page.tsx` → `app/(dashboard)/admin/page.tsx`
- `animal-registration-page.tsx` → `app/(pets)/adoption/register/page.tsx`
- `adoption-page.tsx` → `app/(pets)/adoption/page.tsx`
- `adoption-detail-page.tsx` → `app/(pets)/adoption/[id]/page.tsx`
- `growth-diary-page.tsx` → `app/(pets)/diary/page.tsx`
- `growth-diary-write-page.tsx` → `app/(pets)/diary/write/page.tsx`
- `store-page.tsx` → `app/(store)/store/page.tsx`
- `store-product-detail-page.tsx` → `app/(store)/store/[id]/page.tsx`
- `cart-page.tsx` → `app/(store)/store/cart/page.tsx`
- `community-page.tsx` → `app/(community)/community/page.tsx`
- `community-detail-page.tsx` → `app/(community)/community/[id]/page.tsx`
- `community-write-page.tsx` → `app/(community)/community/write/page.tsx`
- `pet-insurance-page.tsx` → `app/(services)/insurance/page.tsx`
- `insurance-detail-page.tsx` → `app/(services)/insurance/[id]/page.tsx`
- `pet-naming-service.tsx` → `app/(services)/naming/page.tsx`

#### 모달 컴포넌트들
- `login-modal.tsx` → `components/modals/login-modal.tsx`
- `signup-modal.tsx` → `components/modals/signup-modal.tsx`
- `animal-edit-modal.tsx` → `components/modals/animal-edit-modal.tsx`
- `adoption-request-modal.tsx` → `components/modals/adoption-request-modal.tsx`
- `password-recovery-modal.tsx` → `components/modals/password-recovery-modal.tsx`

#### 기타 파일들
- `diary.ts` → `types/diary.ts`
- `utils.ts` → `lib/utils.ts`
- `use-mobile.tsx` → `hooks/use-mobile.tsx`
- `use-toast.ts` → `hooks/use-toast.ts`

## 주의사항

1. **import 경로 수정**: 모든 파일 이동 후 import 경로를 새로운 구조에 맞게 수정
2. **라우트 그룹**: `(auth)`, `(dashboard)` 등은 URL에 영향을 주지 않는 라우트 그룹
3. **레이아웃 중첩**: 각 라우트 그룹별로 layout.tsx 생성하여 공통 레이아웃 적용
4. **타입 안전성**: TypeScript 타입 정의를 통한 타입 안전성 확보

## 예상 효과

1. **코드 구조 개선**: 명확한 폴더 구조로 코드 가독성 향상
2. **재사용성 증가**: 컴포넌트 분리로 재사용성 향상
3. **유지보수성 향상**: 도메인별 분리로 유지보수 용이
4. **Next.js 15.2.4 최적화**: App Router 활용으로 성능 최적화
5. **타입 안전성**: TypeScript 타입 정의로 런타임 에러 방지

이 계획에 동의하시면 단계별로 진행하겠습니다. 
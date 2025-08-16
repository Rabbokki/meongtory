# Order/Product 마이그레이션 가이드

## 개요
이 마이그레이션은 Order와 Product 관련 테이블들의 구조를 개선하고 누락된 필드들을 추가하는 1회용 SQL 스크립트입니다.

## 주요 변경사항

### 1. Product 테이블 개선
- **새로운 필드 추가**:
  - `brand`: 브랜드명
  - `weight`: 상품 무게
  - `dimensions`: 상품 크기
  - `is_active`: 활성화 상태
  - `discount_rate`: 할인율
  - `original_price`: 원가
  - `tags`: 태그 정보
  - `specifications`: 상품 스펙
  - `shipping_info`: 배송 정보
  - `return_policy`: 반품 정책

- **인덱스 추가**:
  - 카테고리, 대상동물, 가격, 활성화 상태별 인덱스

### 2. Order 테이블 개선
- **새로운 필드 추가**:
  - `order_number`: 주문 번호
  - `shipping_address`: 배송 주소
  - `billing_address`: 청구 주소
  - `customer_phone`: 고객 전화번호
  - `customer_email`: 고객 이메일
  - `shipping_fee`: 배송비
  - `discount_amount`: 할인 금액
  - `total_amount`: 총 금액
  - `payment_method`: 결제 수단
  - `notes`: 주문 메모
  - `estimated_delivery_date`: 예상 배송일
  - `actual_delivery_date`: 실제 배송일
  - `tracking_number`: 운송장 번호
  - `is_gift`: 선물 여부
  - `gift_message`: 선물 메시지

### 3. OrderItem 테이블 개선
- **새로운 필드 추가**:
  - `product_name`: 상품명 (주문 시점)
  - `product_image_url`: 상품 이미지 URL
  - `discount_rate`: 할인율
  - `discounted_price`: 할인된 가격
  - `total_price`: 총 가격
  - `options`: 옵션 정보 (JSON)

### 4. Cart 테이블 개선
- **새로운 필드 추가**:
  - `created_at`: 생성 시간
  - `updated_at`: 수정 시간
  - `is_active`: 활성화 상태
  - `options`: 옵션 정보 (JSON)

### 5. TossPayment 테이블 개선
- **토스페이먼츠 관련 상세 필드 추가**:
  - 통화, 잔액, 공급가액, 부가세 등
  - 카드 정보, 가상계좌 정보 등
  - 취소 관련 정보

## 실행 방법

### 1. 자동 실행 (Windows)
```bash
# 배치 파일 실행
run_migration.bat
```

### 2. 수동 실행
```bash
# PostgreSQL에 직접 연결
psql -h localhost -p 5433 -d meong -U jjj -f order_product_migration.sql
```

### 3. Docker 환경에서 실행
```bash
# Docker 컨테이너 내부에서 실행
docker exec -i <postgres_container_name> psql -U jjj -d meong < order_product_migration.sql
```

## 실행 전 주의사항

### ⚠️ 필수 백업
```bash
# 데이터베이스 백업
pg_dump -h localhost -p 5433 -U jjj -d meong > backup_before_migration.sql
```

### ⚠️ 실행 환경 확인
- PostgreSQL 서버가 실행 중인지 확인
- 데이터베이스 연결 정보가 올바른지 확인
- 충분한 디스크 공간이 있는지 확인

### ⚠️ 애플리케이션 중지
- 마이그레이션 실행 전 Spring Boot 애플리케이션을 중지하세요
- 마이그레이션 완료 후 애플리케이션을 재시작하세요

## 실행 후 확인사항

### 1. 테이블 구조 확인
```sql
-- Product 테이블 구조 확인
\d product

-- Order 테이블 구조 확인
\d orders

-- OrderItem 테이블 구조 확인
\d order_items

-- Cart 테이블 구조 확인
\d cart

-- TossPayment 테이블 구조 확인
\d toss_payments
```

### 2. 데이터 무결성 확인
```sql
-- Product 데이터 확인
SELECT COUNT(*) FROM product;

-- Order 데이터 확인
SELECT COUNT(*) FROM orders;

-- OrderItem 데이터 확인
SELECT COUNT(*) FROM order_items;
```

### 3. 인덱스 확인
```sql
-- 생성된 인덱스 확인
SELECT indexname, tablename FROM pg_indexes WHERE tablename IN ('product', 'orders', 'order_items', 'cart', 'toss_payments');
```

## 문제 해결

### 1. 권한 오류
```sql
-- 사용자 권한 확인
\du

-- 필요한 권한 부여
GRANT ALL PRIVILEGES ON DATABASE meong TO jjj;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO jjj;
```

### 2. 연결 오류
- PostgreSQL 서비스 상태 확인
- 방화벽 설정 확인
- 데이터베이스 연결 정보 재확인

### 3. 스크립트 실행 오류
- SQL 문법 오류 확인
- 기존 데이터와의 충돌 확인
- 로그 파일 확인

## 롤백 방법

### 1. 백업에서 복원
```bash
# 백업 파일에서 복원
psql -h localhost -p 5433 -U jjj -d meong < backup_before_migration.sql
```

### 2. 개별 테이블 롤백
```sql
-- 추가된 컬럼들 삭제 (주의: 데이터 손실)
ALTER TABLE product DROP COLUMN IF EXISTS brand;
ALTER TABLE orders DROP COLUMN IF EXISTS order_number;
-- ... 기타 추가된 컬럼들
```

## 추가 작업

### 1. 애플리케이션 코드 업데이트
- 새로운 필드들을 사용하는 엔티티 클래스 업데이트
- DTO 클래스에 새로운 필드 추가
- 서비스 로직에서 새로운 필드 활용

### 2. API 엔드포인트 업데이트
- 새로운 필드를 포함하는 API 응답 업데이트
- 새로운 필드를 받는 API 요청 업데이트

### 3. 프론트엔드 업데이트
- 새로운 필드를 표시하는 UI 컴포넌트 업데이트
- 새로운 필드를 입력받는 폼 업데이트

## 문의사항
마이그레이션 실행 중 문제가 발생하면 다음 정보와 함께 문의해주세요:
- 오류 메시지
- 실행 환경 (OS, PostgreSQL 버전)
- 데이터베이스 크기
- 실행 시점의 로그

# MyPet 의료기록 기능 추가

## 개요
사용자가 소유한 반려동물(MyPet)에 의료기록 기능을 추가하여 반려동물의 건강 정보를 체계적으로 관리할 수 있도록 개선했습니다.

## 추가된 기능

### 1. 의료기록 관련 필드
- **medical_history**: 의료 기록 (예방접종, 수술, 치료 등)
- **vaccinations**: 예방접종 기록
- **notes**: 추가 메모
- **microchip_id**: 마이크로칩 ID
- **special_needs**: 특별 관리 사항

### 2. 백엔드 변경사항

#### 엔티티 수정
- `MyPet.java`: 의료기록 관련 필드 5개 추가
- `MyPetRequestDto.java`: 요청 DTO에 의료기록 필드 추가
- `MyPetResponseDto.java`: 응답 DTO에 의료기록 필드 추가

#### 서비스 수정
- `MyPetService.java`: 
  - `registerMyPet()`: 의료기록 필드 처리 추가
  - `updateMyPet()`: 의료기록 필드 업데이트 추가
  - `convertToResponseDto()`: 응답 변환 시 의료기록 필드 포함

### 3. 프론트엔드 변경사항

#### 타입 정의 수정
- `frontend/types/pets.ts`: MyPet 인터페이스에 의료기록 필드 추가
- `frontend/lib/mypet.ts`: MyPetRequestDto, MyPetResponseDto에 의료기록 필드 추가

#### UI 컴포넌트 수정
- `frontend/app/(dashboard)/my/page.tsx`:
  - MyPet 등록/수정 모달에 의료기록 입력 필드 추가
  - MyPet 목록에서 의료기록 정보 표시
  - 폼 초기화 시 의료기록 필드 포함

### 4. 데이터베이스 마이그레이션
- `database_migration.sql`: MyPet 테이블에 의료기록 관련 컬럼 5개 추가

## 사용 방법

### 1. 데이터베이스 마이그레이션 실행
```sql
-- database_migration.sql 파일의 내용을 실행
```

### 2. MyPet 등록/수정
1. 마이페이지 → "내 반려동물" 탭 접속
2. "펫 등록" 버튼 클릭 또는 기존 펫 "수정" 버튼 클릭
3. 의료기록 관련 정보 입력:
   - 마이크로칩 ID
   - 의료 기록
   - 예방접종 기록
   - 특별 관리 사항
   - 추가 메모

### 3. 의료기록 확인
- 마이페이지에서 등록된 MyPet 카드에 의료기록 정보가 표시됩니다
- 의료기록이 있는 경우 "의료 정보" 섹션이 자동으로 표시됩니다

## 기술적 세부사항

### 데이터 타입
- `medical_history`: TEXT (긴 텍스트)
- `vaccinations`: TEXT (긴 텍스트)
- `notes`: TEXT (긴 텍스트)
- `microchip_id`: VARCHAR(255) (짧은 문자열)
- `special_needs`: TEXT (긴 텍스트)

### API 엔드포인트
기존 MyPet API 엔드포인트들이 의료기록 필드를 자동으로 처리합니다:
- `POST /api/mypet`: 펫 등록
- `PUT /api/mypet/{myPetId}`: 펫 수정
- `GET /api/mypet`: 펫 목록 조회
- `GET /api/mypet/{myPetId}`: 펫 상세 조회

## 주의사항
1. 데이터베이스 마이그레이션 실행 전 반드시 백업을 수행하세요
2. 기존 MyPet 데이터는 의료기록 필드가 NULL로 설정됩니다
3. 의료기록 필드는 선택사항이므로 기존 기능에 영향을 주지 않습니다

## 향후 개선 방향
1. 의료기록 히스토리 관리 (날짜별 기록)
2. 예방접종 일정 알림 기능
3. 수의사 연동 기능
4. 의료기록 파일 업로드 기능 
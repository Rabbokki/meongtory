# 🐾 입양동물 트래킹 시스템 및 추가 기능 개발 계획서

## 📋 프로젝트 개요

멍토리 플랫폼의 입양동물 관리 및 사용자 경험 향상을 위한 종합적인 기능 개발 계획서입니다.

## 🎯 주요 목표

1. **입양동물 생애주기 관리**: 입양부터 평생 관리까지의 완전한 트래킹
2. **사용자 경험 향상**: 마이펫 정보의 전역 접근성 및 편의성 증대
3. **커뮤니티 활성화**: 일기 공유 및 소셜 기능 강화
4. **데이터 관리 최적화**: 효율적인 펫 정보 관리 시스템

---

## 🚀 1. 입양동물 트래킹 시스템

### 1.1 데이터베이스 설계

#### **AdoptionTracking 엔티티**
```java
@Entity
@Table(name = "adoption_tracking")
public class AdoptionTracking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id")
    private Pet pet;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adopter_id")
    private Account adopter;
    
    @Enumerated(EnumType.STRING)
    private AdoptionStatus status; // PENDING, APPROVED, COMPLETED, CANCELLED
    
    @Column(columnDefinition = "TEXT")
    private String adoptionNotes;
    
    @Column(columnDefinition = "TEXT")
    private String healthRecords;
    
    @Column(columnDefinition = "TEXT")
    private String behaviorNotes;
    
    private LocalDateTime adoptionDate;
    private LocalDateTime lastCheckupDate;
    private LocalDateTime nextCheckupDate;
    
    @OneToMany(mappedBy = "adoptionTracking", cascade = CascadeType.ALL)
    private List<AdoptionMilestone> milestones;
    
    @OneToMany(mappedBy = "adoptionTracking", cascade = CascadeType.ALL)
    private List<HealthRecord> healthRecords;
    
    @OneToMany(mappedBy = "adoptionTracking", cascade = CascadeType.ALL)
    private List<BehaviorRecord> behaviorRecords;
}
```

#### **AdoptionMilestone 엔티티**
```java
@Entity
@Table(name = "adoption_milestones")
public class AdoptionMilestone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adoption_tracking_id")
    private AdoptionTracking adoptionTracking;
    
    @Enumerated(EnumType.STRING)
    private MilestoneType type; // FIRST_WEEK, FIRST_MONTH, SIX_MONTHS, ONE_YEAR, etc.
    
    private String title;
    private String description;
    private LocalDateTime achievedDate;
    private boolean isCompleted;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
}
```

#### **HealthRecord 엔티티**
```java
@Entity
@Table(name = "health_records")
public class HealthRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "adoption_tracking_id")
    private AdoptionTracking adoptionTracking;
    
    private LocalDateTime recordDate;
    private String recordType; // VACCINATION, CHECKUP, TREATMENT, etc.
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String veterinarian;
    private String clinic;
    private BigDecimal cost;
    
    @Column(columnDefinition = "TEXT")
    private String attachments; // JSON 형태로 파일 URL 저장
}
```

### 1.2 API 엔드포인트 설계

#### **AdoptionTrackingController**
```java
@RestController
@RequestMapping("/api/adoption-tracking")
public class AdoptionTrackingController {
    
    // 입양 트래킹 생성
    @PostMapping
    public ResponseEntity<ResponseDto<AdoptionTrackingDto>> createTracking(
            @RequestBody CreateAdoptionTrackingDto request);
    
    // 입양 상태 업데이트
    @PutMapping("/{id}/status")
    public ResponseEntity<ResponseDto<AdoptionTrackingDto>> updateStatus(
            @PathVariable Long id, @RequestBody UpdateStatusDto request);
    
    // 마일스톤 추가
    @PostMapping("/{id}/milestones")
    public ResponseEntity<ResponseDto<AdoptionMilestoneDto>> addMilestone(
            @PathVariable Long id, @RequestBody CreateMilestoneDto request);
    
    // 건강 기록 추가
    @PostMapping("/{id}/health-records")
    public ResponseEntity<ResponseDto<HealthRecordDto>> addHealthRecord(
            @PathVariable Long id, @RequestBody CreateHealthRecordDto request);
    
    // 입양자별 트래킹 목록 조회
    @GetMapping("/adopter/{adopterId}")
    public ResponseEntity<ResponseDto<List<AdoptionTrackingDto>>> getByAdopter(
            @PathVariable Long adopterId);
    
    // 펫별 트래킹 조회
    @GetMapping("/pet/{petId}")
    public ResponseEntity<ResponseDto<AdoptionTrackingDto>> getByPet(
            @PathVariable Long petId);
}
```

### 1.3 프론트엔드 구현

#### **트래킹 대시보드**
```typescript
// components/adoption-tracking/AdoptionTrackingDashboard.tsx
interface AdoptionTrackingDashboardProps {
  adoptionTracking: AdoptionTracking;
  milestones: AdoptionMilestone[];
  healthRecords: HealthRecord[];
}

const AdoptionTrackingDashboard: React.FC<AdoptionTrackingDashboardProps> = ({
  adoptionTracking,
  milestones,
  healthRecords
}) => {
  return (
    <div className="adoption-tracking-dashboard">
      <div className="status-overview">
        <h2>입양 상태: {adoptionTracking.status}</h2>
        <p>입양일: {formatDate(adoptionTracking.adoptionDate)}</p>
      </div>
      
      <div className="milestones-section">
        <h3>마일스톤</h3>
        <MilestoneTimeline milestones={milestones} />
      </div>
      
      <div className="health-records-section">
        <h3>건강 기록</h3>
        <HealthRecordsList records={healthRecords} />
      </div>
      
      <div className="next-actions">
        <h3>다음 할 일</h3>
        <NextActionsList tracking={adoptionTracking} />
      </div>
    </div>
  );
};
```

---

## 🏠 2. 마이페이지 자동 등록 시스템

### 2.1 자동 등록 로직

#### **AdoptionService 수정**
```java
@Service
@Transactional
public class AdoptionService {
    
    private final AdoptionTrackingRepository adoptionTrackingRepository;
    private final MyPetRepository myPetRepository;
    private final NotificationService notificationService;
    
    public void completeAdoption(Long petId, Long adopterId) {
        // 1. 입양 상태를 완료로 변경
        AdoptionTracking tracking = adoptionTrackingRepository
            .findByPetIdAndAdopterId(petId, adopterId)
            .orElseThrow(() -> new RuntimeException("입양 트래킹을 찾을 수 없습니다."));
        
        tracking.setStatus(AdoptionStatus.COMPLETED);
        tracking.setAdoptionDate(LocalDateTime.now());
        
        // 2. 마이펫에 자동 등록
        Pet pet = tracking.getPet();
        MyPet myPet = MyPet.builder()
            .pet(pet)
            .owner(adoptionTracking.getAdopter())
            .adoptionDate(LocalDateTime.now())
            .nickname(pet.getName())
            .relationship("입양한 반려동물")
            .build();
        
        myPetRepository.save(myPet);
        
        // 3. 초기 마일스톤 생성
        createInitialMilestones(tracking);
        
        // 4. 알림 발송
        notificationService.sendAdoptionCompletionNotification(adopterId, petId);
        
        // 5. 환영 메시지 및 가이드 제공
        sendWelcomeGuide(adopterId, petId);
    }
    
    private void createInitialMilestones(AdoptionTracking tracking) {
        LocalDateTime now = LocalDateTime.now();
        
        // 첫 주 마일스톤
        AdoptionMilestone firstWeek = AdoptionMilestone.builder()
            .adoptionTracking(tracking)
            .type(MilestoneType.FIRST_WEEK)
            .title("첫 주 적응기")
            .description("새로운 가족과의 첫 주를 보내며 적응하는 시기입니다.")
            .achievedDate(now.plusWeeks(1))
            .isCompleted(false)
            .build();
        
        // 첫 달 마일스톤
        AdoptionMilestone firstMonth = AdoptionMilestone.builder()
            .adoptionTracking(tracking)
            .type(MilestoneType.FIRST_MONTH)
            .title("첫 달 기념")
            .description("입양 후 첫 달을 함께 보낸 기념일입니다.")
            .achievedDate(now.plusMonths(1))
            .isCompleted(false)
            .build();
        
        milestoneRepository.saveAll(Arrays.asList(firstWeek, firstMonth));
    }
}
```

### 2.2 마이펫 전역 상태 관리

#### **MyPetContext (React Context)**
```typescript
// contexts/MyPetContext.tsx
interface MyPetContextType {
  myPets: MyPet[];
  loading: boolean;
  error: string | null;
  fetchMyPets: () => Promise<void>;
  addMyPet: (pet: CreateMyPetDto) => Promise<void>;
  updateMyPet: (id: number, updates: Partial<MyPet>) => Promise<void>;
  deleteMyPet: (id: number) => Promise<void>;
  getMyPetById: (id: number) => MyPet | undefined;
}

const MyPetContext = createContext<MyPetContextType | undefined>(undefined);

export const MyPetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [myPets, setMyPets] = useState<MyPet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyPets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/my-pets');
      setMyPets(response.data.data);
    } catch (err) {
      setError('마이펫 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const addMyPet = async (pet: CreateMyPetDto) => {
    try {
      const response = await api.post('/api/my-pets', pet);
      setMyPets(prev => [...prev, response.data.data]);
    } catch (err) {
      setError('마이펫 추가에 실패했습니다.');
    }
  };

  // ... 기타 메서드들

  return (
    <MyPetContext.Provider value={{
      myPets,
      loading,
      error,
      fetchMyPets,
      addMyPet,
      updateMyPet,
      deleteMyPet,
      getMyPetById
    }}>
      {children}
    </MyPetContext.Provider>
  );
};
```

#### **전역 훅**
```typescript
// hooks/useMyPets.ts
export const useMyPets = () => {
  const context = useContext(MyPetContext);
  if (context === undefined) {
    throw new Error('useMyPets must be used within a MyPetProvider');
  }
  return context;
};

// 사용 예시
const MyComponent = () => {
  const { myPets, fetchMyPets, addMyPet } = useMyPets();
  
  useEffect(() => {
    fetchMyPets();
  }, []);
  
  return (
    <div>
      {myPets.map(pet => (
        <PetCard key={pet.id} pet={pet} />
      ))}
    </div>
  );
};
```

---

## 📝 3. 일기 커뮤니티 공유 기능

### 3.1 데이터베이스 설계

#### **DiaryShare 엔티티**
```java
@Entity
@Table(name = "diary_shares")
public class DiaryShare {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diary_id")
    private Diary diary;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Account user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id")
    private Pet pet;
    
    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    @Column(columnDefinition = "TEXT")
    private String imageUrl;
    
    @Enumerated(EnumType.STRING)
    private ShareStatus status; // DRAFT, PUBLISHED, PRIVATE
    
    private LocalDateTime sharedAt;
    private int viewCount;
    private int likeCount;
    
    @OneToMany(mappedBy = "diaryShare", cascade = CascadeType.ALL)
    private List<DiaryShareComment> comments;
    
    @OneToMany(mappedBy = "diaryShare", cascade = CascadeType.ALL)
    private List<DiaryShareLike> likes;
}
```

### 3.2 API 엔드포인트

#### **DiaryShareController**
```java
@RestController
@RequestMapping("/api/diary-shares")
public class DiaryShareController {
    
    // 일기 공유 생성
    @PostMapping
    public ResponseEntity<ResponseDto<DiaryShareDto>> createShare(
            @RequestBody CreateDiaryShareDto request, Authentication authentication);
    
    // 커뮤니티 피드 조회
    @GetMapping("/feed")
    public ResponseEntity<ResponseDto<Page<DiaryShareDto>>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size);
    
    // 내 공유 목록 조회
    @GetMapping("/my-shares")
    public ResponseEntity<ResponseDto<List<DiaryShareDto>>> getMyShares(Authentication authentication);
    
    // 공유 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<ResponseDto<DiaryShareDto>> getShare(@PathVariable Long id);
    
    // 좋아요 토글
    @PostMapping("/{id}/like")
    public ResponseEntity<ResponseDto<Void>> toggleLike(@PathVariable Long id, Authentication authentication);
    
    // 댓글 추가
    @PostMapping("/{id}/comments")
    public ResponseEntity<ResponseDto<DiaryShareCommentDto>> addComment(
            @PathVariable Long id, @RequestBody CreateCommentDto request, Authentication authentication);
}
```

### 3.3 프론트엔드 구현

#### **일기 공유 모달**
```typescript
// components/diary/DiaryShareModal.tsx
interface DiaryShareModalProps {
  diary: Diary;
  isOpen: boolean;
  onClose: () => void;
  onShare: (shareData: CreateDiaryShareDto) => Promise<void>;
}

const DiaryShareModal: React.FC<DiaryShareModalProps> = ({
  diary,
  isOpen,
  onClose,
  onShare
}) => {
  const [title, setTitle] = useState(diary.title);
  const [content, setContent] = useState(diary.text);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  
  const { myPets } = useMyPets();
  
  const handleShare = async () => {
    const shareData: CreateDiaryShareDto = {
      diaryId: diary.id,
      title,
      content,
      petId: selectedPet?.id,
      isPublic,
      imageUrl: diary.imageUrl
    };
    
    await onShare(shareData);
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="diary-share-modal">
        <h2>일기 공유하기</h2>
        
        <div className="form-group">
          <label>제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="공유할 제목을 입력하세요"
          />
        </div>
        
        <div className="form-group">
          <label>내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="공유할 내용을 입력하세요"
            rows={5}
          />
        </div>
        
        <div className="form-group">
          <label>연결할 반려동물</label>
          <select
            value={selectedPet?.id || ''}
            onChange={(e) => {
              const pet = myPets.find(p => p.id === Number(e.target.value));
              setSelectedPet(pet || null);
            }}
          >
            <option value="">선택하지 않음</option>
            {myPets.map(pet => (
              <option key={pet.id} value={pet.id}>
                {pet.nickname || pet.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            공개로 공유하기
          </label>
        </div>
        
        <div className="modal-actions">
          <button onClick={onClose}>취소</button>
          <button onClick={handleShare} className="primary">
            공유하기
          </button>
        </div>
      </div>
    </Modal>
  );
};
```

---

## 🏷️ 4. 입양견 태그 기능

### 4.1 데이터베이스 설계

#### **PetTag 엔티티**
```java
@Entity
@Table(name = "pet_tags")
public class PetTag {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id")
    private Pet pet;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private Account createdBy;
    
    private String tagName;
    private String tagColor;
    private String tagIcon;
    private String description;
    
    @Enumerated(EnumType.STRING)
    private TagType type; // PERSONALITY, HEALTH, BEHAVIOR, SPECIAL, etc.
    
    private LocalDateTime createdAt;
    private boolean isActive;
}
```

#### **TagCategory 엔티티**
```java
@Entity
@Table(name = "tag_categories")
public class TagCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    private String description;
    private String defaultColor;
    private String defaultIcon;
    
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL)
    private List<PetTag> tags;
}
```

### 4.2 API 엔드포인트

#### **PetTagController**
```java
@RestController
@RequestMapping("/api/pet-tags")
public class PetTagController {
    
    // 태그 생성
    @PostMapping
    public ResponseEntity<ResponseDto<PetTagDto>> createTag(
            @RequestBody CreatePetTagDto request, Authentication authentication);
    
    // 펫별 태그 조회
    @GetMapping("/pet/{petId}")
    public ResponseEntity<ResponseDto<List<PetTagDto>>> getTagsByPet(@PathVariable Long petId);
    
    // 태그 카테고리별 조회
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ResponseDto<List<PetTagDto>>> getTagsByCategory(@PathVariable Long categoryId);
    
    // 태그 수정
    @PutMapping("/{id}")
    public ResponseEntity<ResponseDto<PetTagDto>> updateTag(
            @PathVariable Long id, @RequestBody UpdatePetTagDto request);
    
    // 태그 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseDto<Void>> deleteTag(@PathVariable Long id);
    
    // 태그 검색
    @GetMapping("/search")
    public ResponseEntity<ResponseDto<List<PetTagDto>>> searchTags(@RequestParam String keyword);
}
```

### 4.3 프론트엔드 구현

#### **태그 관리 컴포넌트**
```typescript
// components/pet-tags/PetTagManager.tsx
interface PetTagManagerProps {
  petId: number;
  tags: PetTag[];
  onTagAdd: (tag: CreatePetTagDto) => Promise<void>;
  onTagUpdate: (id: number, updates: UpdatePetTagDto) => Promise<void>;
  onTagDelete: (id: number) => Promise<void>;
}

const PetTagManager: React.FC<PetTagManagerProps> = ({
  petId,
  tags,
  onTagAdd,
  onTagUpdate,
  onTagDelete
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTag, setEditingTag] = useState<PetTag | null>(null);
  
  const tagCategories = [
    { id: 1, name: '성격', color: '#FF6B6B', icon: '😊' },
    { id: 2, name: '건강', color: '#4ECDC4', icon: '🏥' },
    { id: 3, name: '행동', color: '#45B7D1', icon: '🎾' },
    { id: 4, name: '특별', color: '#96CEB4', icon: '⭐' }
  ];
  
  return (
    <div className="pet-tag-manager">
      <div className="tag-header">
        <h3>태그 관리</h3>
        <button onClick={() => setShowAddModal(true)} className="add-tag-btn">
          + 태그 추가
        </button>
      </div>
      
      <div className="tags-container">
        {tagCategories.map(category => {
          const categoryTags = tags.filter(tag => tag.type === category.name);
          return (
            <div key={category.id} className="tag-category">
              <h4>{category.icon} {category.name}</h4>
              <div className="tag-list">
                {categoryTags.map(tag => (
                  <TagItem
                    key={tag.id}
                    tag={tag}
                    onEdit={() => setEditingTag(tag)}
                    onDelete={() => onTagDelete(tag.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
      
      {showAddModal && (
        <TagAddModal
          petId={petId}
          categories={tagCategories}
          onAdd={onTagAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}
      
      {editingTag && (
        <TagEditModal
          tag={editingTag}
          categories={tagCategories}
          onUpdate={onTagUpdate}
          onClose={() => setEditingTag(null)}
        />
      )}
    </div>
  );
};
```

---

## 🌐 5. 마이펫 전역 접근성

### 5.1 전역 상태 관리 개선

#### **MyPetStore (Zustand)**
```typescript
// stores/myPetStore.ts
interface MyPetState {
  pets: MyPet[];
  loading: boolean;
  error: string | null;
  selectedPet: MyPet | null;
  
  // Actions
  fetchPets: () => Promise<void>;
  addPet: (pet: CreateMyPetDto) => Promise<void>;
  updatePet: (id: number, updates: Partial<MyPet>) => Promise<void>;
  deletePet: (id: number) => Promise<void>;
  selectPet: (pet: MyPet | null) => void;
  getPetById: (id: number) => MyPet | undefined;
  getPetsByType: (type: PetType) => MyPet[];
}

export const useMyPetStore = create<MyPetState>((set, get) => ({
  pets: [],
  loading: false,
  error: null,
  selectedPet: null,
  
  fetchPets: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get('/api/my-pets');
      set({ pets: response.data.data, loading: false });
    } catch (error) {
      set({ error: '마이펫 정보를 불러오는데 실패했습니다.', loading: false });
    }
  },
  
  addPet: async (pet: CreateMyPetDto) => {
    try {
      const response = await api.post('/api/my-pets', pet);
      set(state => ({ pets: [...state.pets, response.data.data] }));
    } catch (error) {
      set({ error: '마이펫 추가에 실패했습니다.' });
    }
  },
  
  updatePet: async (id: number, updates: Partial<MyPet>) => {
    try {
      const response = await api.put(`/api/my-pets/${id}`, updates);
      set(state => ({
        pets: state.pets.map(pet => 
          pet.id === id ? { ...pet, ...response.data.data } : pet
        )
      }));
    } catch (error) {
      set({ error: '마이펫 수정에 실패했습니다.' });
    }
  },
  
  deletePet: async (id: number) => {
    try {
      await api.delete(`/api/my-pets/${id}`);
      set(state => ({ pets: state.pets.filter(pet => pet.id !== id) }));
    } catch (error) {
      set({ error: '마이펫 삭제에 실패했습니다.' });
    }
  },
  
  selectPet: (pet: MyPet | null) => set({ selectedPet: pet }),
  
  getPetById: (id: number) => {
    const { pets } = get();
    return pets.find(pet => pet.id === id);
  },
  
  getPetsByType: (type: PetType) => {
    const { pets } = get();
    return pets.filter(pet => pet.pet.type === type);
  }
}));
```

### 5.2 전역 컴포넌트

#### **PetSelector 컴포넌트**
```typescript
// components/common/PetSelector.tsx
interface PetSelectorProps {
  selectedPetId?: number;
  onPetSelect: (pet: MyPet) => void;
  placeholder?: string;
  showAddButton?: boolean;
}

const PetSelector: React.FC<PetSelectorProps> = ({
  selectedPetId,
  onPetSelect,
  placeholder = "반려동물 선택",
  showAddButton = false
}) => {
  const { pets, loading, selectedPet } = useMyPetStore();
  
  const handlePetSelect = (pet: MyPet) => {
    onPetSelect(pet);
  };
  
  return (
    <div className="pet-selector">
      <select
        value={selectedPetId || ''}
        onChange={(e) => {
          const pet = pets.find(p => p.id === Number(e.target.value));
          if (pet) handlePetSelect(pet);
        }}
        disabled={loading}
      >
        <option value="">{placeholder}</option>
        {pets.map(pet => (
          <option key={pet.id} value={pet.id}>
            {pet.nickname || pet.pet.name}
          </option>
        ))}
      </select>
      
      {showAddButton && (
        <button onClick={() => router.push('/my-pets/add')}>
          + 반려동물 추가
        </button>
      )}
    </div>
  );
};
```

#### **PetAvatar 컴포넌트**
```typescript
// components/common/PetAvatar.tsx
interface PetAvatarProps {
  pet: MyPet;
  size?: 'small' | 'medium' | 'large';
  showName?: boolean;
  onClick?: () => void;
}

const PetAvatar: React.FC<PetAvatarProps> = ({
  pet,
  size = 'medium',
  showName = true,
  onClick
}) => {
  return (
    <div 
      className={`pet-avatar ${size} ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
    >
      <img 
        src={pet.pet.imageUrl || '/default-pet.png'} 
        alt={pet.nickname || pet.pet.name}
      />
      {showName && (
        <span className="pet-name">
          {pet.nickname || pet.pet.name}
        </span>
      )}
    </div>
  );
};
```

---

## 📊 6. 추가 기능 추천

### 6.1 건강 관리 시스템
- **예방접종 일정 관리**: 자동 알림 및 기록
- **체중 변화 추적**: 그래프로 시각화
- **질병 이력 관리**: 증상 및 치료 기록
- **수의사 방문 기록**: 진료비 및 처방전 관리

### 6.2 행동 분석 시스템
- **행동 패턴 분석**: AI 기반 행동 분석
- **훈련 진행도 추적**: 단계별 훈련 기록
- **문제 행동 관리**: 개선 과정 기록
- **성격 변화 추적**: 시간에 따른 성격 변화

### 6.3 소셜 기능 강화
- **반려동물 친구 매칭**: 비슷한 반려동물과의 소셜 네트워킹
- **지역별 모임**: 반려동물 모임 및 이벤트
- **전문가 상담**: 수의사, 훈련사와의 1:1 상담
- **리뷰 시스템**: 병원, 훈련소, 용품 리뷰

### 6.4 데이터 분석 및 인사이트
- **건강 통계**: 연령대별 건강 지표 비교
- **비용 분석**: 반려동물 양육 비용 통계
- **행동 예측**: AI 기반 행동 예측 및 권장사항
- **생애주기 관리**: 연령별 관리 가이드

### 6.5 편의 기능
- **QR 코드 태그**: 반려동물 식별용 QR 코드
- **위치 추적**: GPS 기반 위치 추적 (선택적)
- **응급 연락처**: 수의사, 응급병원 연락처 관리
- **보험 관리**: 반려동물 보험 정보 관리

---

## 🗓️ 7. 개발 일정

### Phase 1 (1-2주): 기본 구조 구축
- [ ] 데이터베이스 설계 및 엔티티 생성
- [ ] 기본 API 엔드포인트 구현
- [ ] 전역 상태 관리 설정

### Phase 2 (2-3주): 핵심 기능 구현
- [ ] 입양 트래킹 시스템
- [ ] 마이펫 자동 등록
- [ ] 전역 접근성 구현

### Phase 3 (3-4주): 추가 기능 구현
- [ ] 일기 공유 기능
- [ ] 태그 시스템
- [ ] UI/UX 개선

### Phase 4 (4-5주): 테스트 및 최적화
- [ ] 통합 테스트
- [ ] 성능 최적화
- [ ] 사용자 피드백 반영

---

## 🎯 8. 성공 지표

### 8.1 사용자 참여도
- 마이펫 등록률: 80% 이상
- 일기 작성 빈도: 월 2회 이상
- 태그 사용률: 60% 이상

### 8.2 시스템 성능
- 페이지 로딩 시간: 3초 이내
- API 응답 시간: 1초 이내
- 시스템 가용성: 99.9% 이상

### 8.3 사용자 만족도
- 사용자 만족도: 4.5/5.0 이상
- 기능 사용률: 70% 이상
- 재방문률: 80% 이상

---

## 📝 9. 결론

이 계획서는 멍토리 플랫폼의 사용자 경험을 크게 향상시킬 종합적인 기능 개발 로드맵입니다. 입양동물의 생애주기 전반을 관리할 수 있는 시스템을 구축하여, 사용자들이 반려동물과 더욱 깊고 의미 있는 관계를 형성할 수 있도록 지원할 것입니다.

각 기능은 모듈화되어 단계적으로 구현 가능하며, 사용자 피드백을 반영하여 지속적으로 개선해 나갈 예정입니다. 
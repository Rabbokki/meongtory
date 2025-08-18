// 다이어리 관련 타입들

export interface DiaryEntry {
  diaryId: number  // id -> diaryId로 변경
  user: {  // userId -> user 관계로 변경
    id: number
    name: string
    email: string
  }
  title: string
  text: string  // content -> text로 변경
  audioUrl?: string
  imageUrl?: string  // images[] -> imageUrl로 변경
  isDeleted: boolean  // 추가
  createdAt: string  // LocalDateTime을 string으로 표현
  updatedAt: string  // LocalDateTime을 string으로 표현
}

// 다이어리 페이지 Props
export interface GrowthDiaryPageProps {
  entries: DiaryEntry[]
  onViewEntry: (entry: DiaryEntry) => void
  onClose: () => void
  onAddEntry: (entryData: Omit<DiaryEntry, "diaryId" | "createdAt" | "updatedAt">) => void
  isLoggedIn: boolean
  currentUserId?: string
  onNavigateToWrite: () => void
}

export interface DiaryEntryDetailProps {
  entry: DiaryEntry
  onBack: () => void
  onEdit: (entryId: number) => void
  onDelete: (entryId: number) => void
  isLoggedIn: boolean
  currentUserId?: string
}

export interface GrowthDiaryWritePageProps {
  onClose: () => void
  onSave: (entry: Omit<DiaryEntry, "diaryId" | "createdAt" | "updatedAt">) => void
  isLoggedIn: boolean
  currentUserId?: string
}

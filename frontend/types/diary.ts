// 다이어리 관련 타입들

export interface DiaryEntry {
  id: number
  petName: string
  date: string
  title: string
  content: string
  images: string[]
  audioUrl?: string
  userId?: number
  createdAt?: string
  updatedAt?: string
}

// 다이어리 페이지 Props
export interface GrowthDiaryPageProps {
  entries: DiaryEntry[]
  onViewEntry: (entry: DiaryEntry) => void
  onClose: () => void
  onAddEntry: (entryData: Omit<DiaryEntry, "id" | "createdAt" | "updatedAt">) => void
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
  onSave: (entry: Omit<DiaryEntry, "id" | "createdAt" | "updatedAt">) => void
  isLoggedIn: boolean
  currentUserId?: string
}

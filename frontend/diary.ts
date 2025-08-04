export interface DiaryEntry {
  diaryId: number;
  userId: number;
  title?: string;
  text: string;
  images?: string[];
  audioUrl?: string;
  createdAt: string;
  updatedAt: string;
}

//타입 정의


export interface DiaryEntry {
  diaryId: number;
  userId: number | null;
  title: string;  
  text: string;
  imageUrl?: string | null;
  audioUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Mic } from "lucide-react"
import { fetchDiaries } from "@/lib/api/diary"
import GrowthDiaryWritePage from "./growth-diary-write-page"


interface DiaryEntry {
  diaryId: number;
  userId: number;
  text: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GrowthDiaryPageProps {
  entries: DiaryEntry[]
  onViewEntry: (entry: DiaryEntry) => void
  onClose: () => void
  onAddEntry: (entryData: Omit<DiaryEntry, "diaryId" | "createdAt" | "updatedAt">) => void
  isLoggedIn: boolean
  currentUserId?: string
  onNavigateToWrite: () => void
}

export default function GrowthDiaryPage({
  entries,
  onViewEntry,
  onClose,
  onAddEntry,
  isLoggedIn,
  currentUserId,
  onNavigateToWrite,
}: GrowthDiaryPageProps) {
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [isWriteMode, setIsWriteMode] = useState(false);

const refetchDiaries = () => {
  fetchDiaries(currentUserId ? Number(currentUserId) : undefined)
    .then((data) => setDiaryEntries(data as DiaryEntry[]))
    .catch((err) => console.error("일기 목록 불러오기 실패:", err));
};

  useEffect(() => {
    refetchDiaries();
  }, [currentUserId]);

  const userEntries = currentUserId
    ? diaryEntries.filter((entry) => entry.userId === Number(currentUserId))
    : diaryEntries;

  // 글쓰기 페이지 렌더링 분기
 if (isWriteMode) {
  return (
    <GrowthDiaryWritePage
      onBack={() => {
        setIsWriteMode(false);
        refetchDiaries();  // 글 작성 후 목록 다시 불러오기
      }}
      currentUserId={Number(currentUserId)}
    />
  );
}

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">성장일기</h1>
          {isLoggedIn && (
            <Button
              onClick={() => setIsWriteMode(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black"
            >
              <Plus className="h-4 w-4 mr-2" />글쓰기
            </Button>
          )}
        </div>

        {/* Diary Entries List */}
        <div className="grid gap-6">
          {userEntries.length > 0 ? (
            userEntries.map((entry) => (
              <Card key={entry.diaryId} className="hover:shadow-md transition-shadow">
               <CardContent className="p-6">
  <div className="flex flex-col md:flex-row gap-4">
    <div className="flex-1">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold text-gray-900">{entry.text || "(내용 없음)"}</h2>
        <Button size="sm" variant="ghost" onClick={() => onViewEntry(entry)}>
          <Edit className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-gray-500 mb-3">{entry.createdAt}</p>
      {entry.audioUrl && (
        <div className="flex items-center gap-2 mb-2">
          <Mic className="h-4 w-4" />
          <audio controls>
            <source src={entry.audioUrl} />
          </audio>
        </div>
      )}
    </div>
    {entry.imageUrl && (
      <div className="flex-shrink-0 w-full md:w-1/3 lg:w-1/4 relative">
        <img
          src={entry.imageUrl}
          alt="diary image"
          className="rounded-md object-cover w-full h-auto"
        />
      </div>
    )}
  </div>
</CardContent>

              </Card>
            ))
          ) : (
            <Card className="p-6 text-center text-gray-500">
              <p>{isLoggedIn ? "작성된 성장일기가 없습니다." : "로그인 후 사용해주세요."}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Mic, Trash2 } from "lucide-react"
import { fetchDiaries, deleteDiary } from "@/lib/api/diary"
import GrowthDiaryWritePage from "./growth-diary-write-page"

interface DiaryEntry {
  diaryId: number;
  userId: number | null;
  title: string | null;
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
    console.log("Fetching diaries for userId:", currentUserId);
    fetchDiaries(currentUserId ? Number(currentUserId) : undefined)
      .then((data) => {
        console.log("Setting diary entries:", data);
        setDiaryEntries(data as DiaryEntry[]);
      })
      .catch((err) => console.error("일기 목록 불러오기 실패:", err));
  };

  const handleDelete = async (diaryId: number) => {
    try {
      await deleteDiary(diaryId);
      console.log(`Diary ${diaryId} deleted successfully`);
      refetchDiaries();
    } catch (err) {
      console.error("일기 삭제 실패:", err);
      // TODO: 사용자에게 에러 알림 표시 (예: 토스트 메시지)
    }
  };

  useEffect(() => {
    console.log("Current userId:", currentUserId, "isLoggedIn:", isLoggedIn);
    refetchDiaries();
  }, [currentUserId]);

  const userEntries = diaryEntries.filter((entry) => {
    console.log("Filtering entry:", entry);
    if (!isLoggedIn || !currentUserId) {
      return true; // 로그인하지 않았거나 userId 없으면 전체 일기 표시
    }
    return entry.userId === Number(currentUserId) || entry.userId === null; // 자신의 일기 또는 userId가 null인 일기
  });

  console.log("userEntries length:", userEntries.length);

  if (isWriteMode) {
    return (
      <GrowthDiaryWritePage
        onBack={() => {
          setIsWriteMode(false);
          refetchDiaries();
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
                        <h2 className="text-xl font-bold text-gray-900">
                          {entry.title || "(제목 없음)"}
                        </h2>
                        <div className="flex gap-2">
                          {isLoggedIn && (entry.userId === Number(currentUserId) || entry.userId === null) && (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => onViewEntry(entry)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDelete(entry.diaryId)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <p className="text-base text-gray-700 mb-2">{entry.text || "(내용 없음)"}</p>
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
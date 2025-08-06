"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Mic, Trash2 } from "lucide-react"
import { fetchDiaries, deleteDiary } from "@/lib/api/diary"
import { useToast } from "@/components/ui/use-toast"
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
  const router = useRouter();
  const { toast } = useToast();

  const refetchDiaries = () => {
    console.log("Fetching diaries for currentUserId:", currentUserId);
    
    // currentUserId가 이메일인 경우, localStorage에서 실제 userId를 가져옴
    const userId = localStorage.getItem("userId");
    console.log("Using userId from localStorage:", userId);
    
    if (!userId) {
      console.log("No userId found, fetching all diaries");
      fetchDiaries()
        .then((data) => {
          console.log("Setting diary entries:", data);
          console.log("Number of entries fetched:", data.length);
          setDiaryEntries(data as DiaryEntry[]);
        })
        .catch((err) => {
          console.error("일기 목록 불러오기 실패:", err);
          console.error("Error details:", err.message);
        });
    } else {
      fetchDiaries(Number(userId))
        .then((data) => {
          console.log("Setting diary entries:", data);
          console.log("Number of entries fetched:", data.length);
          setDiaryEntries(data as DiaryEntry[]);
        })
        .catch((err) => {
          console.error("일기 목록 불러오기 실패:", err);
          console.error("Error details:", err.message);
        });
    }
  };

  const handleEdit = (diaryId: number) => {
    router.push(`/diary/edit/${diaryId}`);
  };

  const handleDelete = async (diaryId: number) => {
    try {
      await deleteDiary(diaryId);
      console.log(`Diary ${diaryId} deleted successfully`);
      toast({
        title: "삭제 완료",
        description: "삭제가 완료되었습니다.",
      });
      refetchDiaries();
    } catch (err) {
      console.error("일기 삭제 실패:", err);
      toast({
        title: "삭제 실패",
        description: "삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    console.log("Current userId:", currentUserId, "isLoggedIn:", isLoggedIn);
    refetchDiaries();
  }, [currentUserId, isLoggedIn]);

  // URL 파라미터 변경 시에도 데이터 새로고침
  useEffect(() => {
    const handleUrlChange = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const page = urlParams.get("page");
      console.log("URL changed, page:", page);
      if (page === "diary") {
        console.log("Diary page detected, refetching data");
        refetchDiaries();
      }
    };

    // 초기 로드 시 체크
    handleUrlChange();

    // URL 변경 감지
    const handlePopState = () => {
      handleUrlChange();
    };

    // 페이지 포커스 시에도 데이터 새로고침
    const handleFocus = () => {
      handleUrlChange();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const userEntries = diaryEntries.filter((entry) => {
    console.log("Filtering entry:", entry);
    console.log("Entry userId:", entry.userId, "Entry title:", entry.title);
    
    // 모든 일기를 표시 (필터링 제거)
    return true;
  });

  console.log("userEntries length:", userEntries.length);
  console.log("userEntries:", userEntries);

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
                          {isLoggedIn && (
                            <>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(entry.diaryId);
                                }}
                                className="hover:bg-gray-100"
                                title="수정"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(entry.diaryId);
                                }}
                                className="hover:bg-red-50 text-red-500 hover:text-red-700"
                                title="삭제"
                              >
                                <Trash2 className="h-4 w-4" />
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
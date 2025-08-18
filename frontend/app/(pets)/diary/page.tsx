"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Mic, Trash2 } from "lucide-react"
import { fetchDiaries, deleteDiary } from "@/lib/api/diary"
import { useToast } from "@/components/ui/use-toast"
import GrowthDiaryWritePage from "./write/page"

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [diaryToDelete, setDiaryToDelete] = useState<number | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const refetchDiaries = () => {
    console.log("=== refetchDiaries called ===");
    console.log("Fetching diaries for current user");
    
    fetchDiaries()
      .then((data) => {
        console.log("=== fetchDiaries success ===");
        console.log("Raw data received:", data);
        console.log("Data type:", typeof data);
        console.log("Is array:", Array.isArray(data));
        console.log("Number of entries fetched:", data.length);
        console.log("Setting diary entries:", data);
        setDiaryEntries(data as DiaryEntry[]);
      })
      .catch((err: any) => {
        console.error("=== fetchDiaries error ===");
        console.error("일기 목록 불러오기 실패:", err);
        console.error("Error details:", err.message);
        
        // 인증 관련 에러 처리
        if (err.message.includes("로그인이 필요합니다") || err.message.includes("세션이 만료")) {
          toast({
            title: "로그인 필요",
            description: "로그인이 필요합니다. 다시 로그인해주세요.",
            variant: "destructive",
          });
          // 로그인 페이지로 이동
          // 로그인 모달 표시 대신 홈으로 이동
          window.location.href = "/";
          return;
        }
      });
  };

  const handleEdit = (diaryId: number) => {
    console.log("=== handleEdit called ===");
    console.log("Diary ID:", diaryId);
    console.log("Current URL:", window.location.href);
    
    // 항상 직접 수정 페이지로 이동
    console.log("Redirecting to diary edit page");
    window.location.href = `/diary/edit/${diaryId}`;
  };

  const handleDelete = async (diaryId: number) => {
    // 삭제할 일기 ID를 설정하고 확인 모달 표시
    setDiaryToDelete(diaryId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!diaryToDelete) return;

    try {
      await deleteDiary(diaryToDelete);
      console.log(`Diary ${diaryToDelete} deleted successfully`);
      toast({
        title: "삭제 완료",
        description: "삭제가 완료되었습니다.",
      });
      refetchDiaries();
    } catch (err: any) {
      console.error("일기 삭제 실패:", err);
      
      // 인증 관련 에러 처리
      if (err.message.includes("로그인이 필요합니다") || err.message.includes("세션이 만료")) {
        toast({
          title: "로그인 필요",
          description: "로그인이 필요합니다. 다시 로그인해주세요.",
          variant: "destructive",
        });
        // 로그인 페이지로 이동
                  // 로그인 모달 표시 대신 홈으로 이동
          window.location.href = "/";
        return;
      }
      
      toast({
        title: "삭제 실패",
        description: "삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteConfirm(false);
      setDiaryToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDiaryToDelete(null);
  };

  useEffect(() => {
    console.log("=== useEffect triggered ===");
    console.log("Current userId:", currentUserId, "isLoggedIn:", isLoggedIn);
    console.log("Calling refetchDiaries from useEffect");
    refetchDiaries();
  }, [currentUserId, isLoggedIn]);

  // isLoggedIn 상태 변경 시 로그
  useEffect(() => {
    console.log("=== isLoggedIn changed ===");
    console.log("isLoggedIn:", isLoggedIn);
  }, [isLoggedIn]);

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
          console.log("=== onBack callback executed ===");
          console.log("Setting isWriteMode to false");
          setIsWriteMode(false);
          console.log("Calling refetchDiaries");
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">성장일기</h1>
            {isLoggedIn && (
              <p className="text-sm text-gray-600 mt-1">
                {localStorage.getItem("userRole") === "ADMIN" ? "관리자 모드 - 모든 사용자의 일기를 볼 수 있습니다" : "내 일기 목록"}
              </p>
            )}
          </div>
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
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            {entry.title || "(제목 없음)"}
                          </h2>
                          {localStorage.getItem("userRole") === "ADMIN" && (
                            <p className="text-sm text-gray-500">
                              작성자 ID: {entry.userId}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {isLoggedIn && (
                            <>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={(e) => {
                                  console.log("=== Edit button clicked ===");
                                  console.log("Entry diaryId:", entry.diaryId);
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

        {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">일기 삭제</h3>
                <p className="text-gray-600 mb-6">정말로 이 일기를 삭제하시겠습니까?<br />⚠️ 삭제된 일기는 복구할 수 없습니다.</p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={cancelDelete}>취소</Button>
                  <Button onClick={confirmDelete} className="bg-red-600 text-white hover:bg-red-700">삭제</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
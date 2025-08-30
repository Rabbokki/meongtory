"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Mic, Trash2, ChevronLeft, ChevronRight, Calendar, Clock, ChevronDown } from "lucide-react"
import { fetchDiaries, deleteDiary, DiaryPageResponse } from "@/lib/diary"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/navigation"
import GrowthDiaryWritePage from "./write/page"

import { DiaryEntry } from "@/lib/diary"

interface GrowthDiaryPageProps {
  entries: DiaryEntry[]
  onViewEntry: (entry: DiaryEntry) => void
  onClose: () => void
  onAddEntry: (entryData: Omit<DiaryEntry, "diaryId" | "createdAt" | "updatedAt">) => void
  isLoggedIn?: boolean // prop을 optional로 변경
  currentUserId?: string
  onNavigateToWrite: () => void
}

export default function GrowthDiaryPage({
  entries,
  onViewEntry,
  onClose,
  onAddEntry,
  isLoggedIn: propIsLoggedIn,
  currentUserId,
  onNavigateToWrite,
}: GrowthDiaryPageProps) {
  const { isLoggedIn, currentUser, checkLoginStatus } = useAuth();
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [isWriteMode, setIsWriteMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [diaryToDelete, setDiaryToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("전체");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [sortOption, setSortOption] = useState<string>("latest");
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();

  const refetchDiaries = async (category?: string, page: number = 0, date?: string, sort?: string) => {
    console.log("=== refetchDiaries called ===");
    console.log("Fetching diaries for current user, isLoggedIn:", isLoggedIn);
    console.log("Category filter:", category);
    console.log("Page:", page);
    console.log("Date filter:", date);
    console.log("Sort option:", sort || sortOption);
    
    try {
      const data: DiaryPageResponse = await fetchDiaries(category, page, 7, sort || sortOption, date);
      console.log("=== fetchDiaries success ===");
      console.log("Raw data received:", data);
      console.log("Data type:", typeof data);
      console.log("Content length:", data.content.length);
      console.log("Total pages:", data.totalPages);
      console.log("Total elements:", data.totalElements);
      
      setDiaryEntries(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setCurrentPage(data.number);
    } catch (err: any) {
      console.error("=== fetchDiaries error ===");
      console.error("일기 목록 불러오기 실패:", err);
      console.error("Error details:", err.message);
      
      if (err.message.includes("로그인이 필요합니다") || err.message.includes("세션이 만료")) {
        toast({
          title: "로그인 필요",
          description: "로그인이 필요합니다. 다시 로그인해주세요.",
          variant: "destructive",
        });
        window.location.href = "/";
        return;
      }
    }
  };

  const handleEdit = (diaryId: number) => {
    console.log("=== handleEdit called ===");
    console.log("Diary ID:", diaryId);
    console.log("Current URL:", window.location.href);
    window.location.href = `/diary/edit/${diaryId}`;
  };

  const handleViewEntry = (diaryId: number) => {
    console.log("=== handleViewEntry called ===");
    console.log("Diary ID:", diaryId);
    router.push(`/diary/${diaryId}`);
  };

  const handleDelete = async (diaryId: number) => {
    setDiaryToDelete(diaryId);
    setShowDeleteConfirm(true);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(0); // 탭 변경 시 첫 페이지로 이동
    setSelectedDate(""); // 탭 변경 시 날짜 선택 초기화
    const category = tab === "전체" ? undefined : tab;
    // 탭 변경 시에도 현재 정렬 옵션 유지
    refetchDiaries(category, 0, undefined, sortOption);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const category = activeTab === "전체" ? undefined : activeTab;
    refetchDiaries(category, page, selectedDate, sortOption);
  };

  const handleSortChange = (sort: string) => {
    setSortOption(sort);
    setShowSortDropdown(false);
    setCurrentPage(0);
    const category = activeTab === "전체" ? undefined : activeTab;
    // 정렬 변경 시에도 현재 날짜 필터 유지
    refetchDiaries(category, 0, selectedDate, sort);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setCurrentPage(0);
    const category = activeTab === "전체" ? undefined : activeTab;
    // 날짜 필터링 시에도 현재 정렬 옵션 유지
    refetchDiaries(category, 0, date, sortOption);
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
      refetchDiaries(activeTab === "전체" ? undefined : activeTab, currentPage, selectedDate, sortOption);
    } catch (err: any) {
      console.error("일기 삭제 실패:", err);
      if (err.message.includes("로그인이 필요합니다") || err.message.includes("세션이 만료")) {
        toast({
          title: "로그인 필요",
          description: "로그인이 필요합니다. 다시 로그인해주세요.",
          variant: "destructive",
        });
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
    console.log("Current userId:", currentUser?.id, "isLoggedIn:", isLoggedIn);
    
    const initialize = async () => {
      setIsLoading(true);
      await checkLoginStatus();
      if (isLoggedIn) {
        await refetchDiaries(activeTab === "전체" ? undefined : activeTab, 0, selectedDate, sortOption);
      }
      setIsLoading(false);
    };

    initialize();
  }, [isLoggedIn, currentUser, checkLoginStatus]);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.sort-dropdown')) {
        setShowSortDropdown(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSortDropdown(false);
      }
    };

    if (showSortDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showSortDropdown]);

  const userEntries = diaryEntries.filter((entry) => {
    console.log("Filtering entry:", entry);
    console.log("Entry userId:", entry.userId, "Entry title:", entry.title);
    return true; // 모든 일기 표시
  });

  console.log("userEntries length:", userEntries.length);
  console.log("userEntries:", userEntries);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (isWriteMode) {
    return (
      <GrowthDiaryWritePage
        onBack={() => {
          console.log("=== onBack callback executed ===");
          console.log("Setting isWriteMode to false");
          setIsWriteMode(false);
          console.log("Calling refetchDiaries");
          refetchDiaries(activeTab === "전체" ? undefined : activeTab, currentPage, selectedDate, sortOption);
        }}
        currentUserId={Number(currentUser?.id) || Number(currentUserId)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">성장일기</h1>
                          <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-gray-600">
                  총 {totalElements}개의 일기 • {currentPage + 1} / {totalPages} 페이지
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>
                    {sortOption === "latest" ? "최신순" : "오래된순"}
                    {selectedDate && ` • ${selectedDate}`}
                  </span>
                  {activeTab !== "전체" && (
                    <span className="text-blue-600">• {activeTab}</span>
                  )}
                </div>
              </div>
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

        {/* 카테고리 탭 UI */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {["전체", "일상", "건강"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? "bg-yellow-400 text-black shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 정렬 및 날짜 선택 UI */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* 정렬 드롭다운 */}
          <div className="relative sort-dropdown">
            <Button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              variant="outline"
              className="flex items-center gap-2 min-w-[160px] justify-between hover:bg-gray-50 group"
              aria-haspopup="listbox"
              aria-expanded={showSortDropdown}
              aria-label={`정렬 기준: ${sortOption === "latest" ? "최신순" : "오래된순"}`}
              title={`현재 정렬: ${sortOption === "latest" ? "최신순 (최근 작성된 순)" : "오래된순 (과거 작성된 순)"}`}
            >
              <Clock className="h-4 w-4 text-gray-600 group-hover:text-yellow-600 transition-colors" />
              <span className="text-sm font-medium">
                {sortOption === "latest" ? "최신순" : "오래된순"}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
            </Button>
            
            {showSortDropdown && (
              <div 
                className="absolute top-full left-0 mt-1 w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden animate-in fade-in-0 zoom-in-95"
                role="listbox"
                aria-label="정렬 옵션"
              >
                <button
                  onClick={() => handleSortChange("latest")}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSortChange("latest");
                    }
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 focus:outline-none focus:bg-gray-50 ${
                    sortOption === "latest" ? "bg-yellow-50 text-yellow-700 border-r-2 border-yellow-400" : "text-gray-700"
                  }`}
                  role="option"
                  aria-selected={sortOption === "latest"}
                  title="최근에 작성된 일기부터 표시"
                >
                  <Clock className="h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">최신순</span>
                    <span className="text-xs text-gray-500">최근 작성된 순</span>
                  </div>
                  {sortOption === "latest" && (
                    <span className="ml-auto text-yellow-600" aria-hidden="true">✓</span>
                  )}
                </button>
                <button
                  onClick={() => handleSortChange("oldest")}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSortChange("oldest");
                    }
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2 focus:outline-none focus:bg-gray-50 ${
                    sortOption === "oldest" ? "bg-yellow-50 text-yellow-700 border-r-2 border-yellow-400" : "text-gray-700"
                  }`}
                  role="option"
                  aria-selected={sortOption === "oldest"}
                  title="과거에 작성된 일기부터 표시"
                >
                  <Clock className="h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span className="font-medium">오래된순</span>
                    <span className="text-xs text-gray-500">과거 작성된 순</span>
                  </div>
                  {sortOption === "oldest" && (
                    <span className="ml-auto text-yellow-600" aria-hidden="true">✓</span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* 날짜 선택 */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-48 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
              placeholder="날짜 선택"
            />
            {selectedDate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDateChange("")}
                className="text-gray-500 hover:text-gray-700"
                title="날짜 필터 초기화"
              >
                ✕
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          {userEntries.length > 0 ? (
            userEntries.map((entry) => (
              <Card 
                key={entry.diaryId} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewEntry(entry.diaryId)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">
                            {entry.title || "(제목 없음)"}
                          </h2>
                          {entry.petName && (
                            <p className="text-sm text-blue-600 font-medium">
                              🐾 {entry.petName}
                            </p>
                          )}
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
                      {entry.categories && entry.categories.length > 0 && (
                        <div className="flex gap-1 mb-2">
                          {entry.categories.map((category: string, index: number) => (
                            <span
                              key={index}
                              className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      )}
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
                      <div className="ml-4 flex-shrink-0">
                        <img
                          src={entry.imageUrl}
                          alt="diary image"
                          className="w-24 h-24 object-cover rounded-md"
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

        {/* 페이지네이션 UI */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center mt-8 gap-2">
            {/* 이전 페이지 버튼 */}
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 0))}
              disabled={currentPage === 0}
              className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* 페이지 번호 버튼들 */}
            {(() => {
              const pages = [];
              const maxVisiblePages = 5;
              let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
              let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);
              
              // 시작 페이지 조정
              if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(0, endPage - maxVisiblePages + 1);
              }

              // 첫 페이지
              if (startPage > 0) {
                pages.push(
                  <button
                    key="first"
                    onClick={() => handlePageChange(0)}
                    className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    1
                  </button>
                );
                if (startPage > 1) {
                  pages.push(
                    <span key="dots1" className="flex items-center justify-center w-10 h-10 text-gray-500">
                      ...
                    </span>
                  );
                }
              }

              // 페이지 번호들
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-colors ${
                      i === currentPage
                        ? "bg-yellow-400 text-white border-yellow-400"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              }

              // 마지막 페이지
              if (endPage < totalPages - 1) {
                if (endPage < totalPages - 2) {
                  pages.push(
                    <span key="dots2" className="flex items-center justify-center w-10 h-10 text-gray-500">
                      ...
                    </span>
                  );
                }
                pages.push(
                  <button
                    key="last"
                    onClick={() => handlePageChange(totalPages - 1)}
                    className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {totalPages}
                  </button>
                );
              }

              return pages;
            })()}

            {/* 다음 페이지 버튼 */}
            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages - 1))}
              disabled={currentPage === totalPages - 1}
              className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

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
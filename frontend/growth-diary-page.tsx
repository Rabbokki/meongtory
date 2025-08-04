"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface DiaryEntry {
  id: number
  petName: string
  date: string
  title: string
  content: string
  images: string[]
  milestones: string[]
  weight?: number
  height?: number
  mood: string
  activities: string[]
  ownerEmail?: string // Added ownerEmail to the interface
}

interface GrowthDiaryPageProps {
  entries: DiaryEntry[]
  onViewEntry: (entry: DiaryEntry) => void
  onClose: () => void
  onAddEntry: (entryData: Omit<DiaryEntry, "id" | "date">) => void
  isLoggedIn: boolean
  currentUserId?: string // Assuming a user ID for filtering
  onNavigateToWrite: () => void // New prop for navigating to write page
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
  // const [showAddEntryForm, setShowAddEntryForm] = useState(false) // Removed
  const [newEntryTitle, setNewEntryTitle] = useState("")
  const [newEntryContent, setNewEntryContent] = useState("")
  const [newEntryPetName, setNewEntryPetName] = useState("")
  const [newEntryImages, setNewEntryImages] = useState<string[]>([])
  const [newEntryMilestones, setNewEntryMilestones] = useState<string>("")
  const [newEntryMood, setNewEntryMood] = useState("")
  const [newEntryActivities, setNewEntryActivities] = useState<string>("")

  // handleAddEntry function will be moved to the new page, but keeping it for reference for now
  const handleAddEntry = () => {
    if (!newEntryTitle || !newEntryContent || !newEntryPetName) {
      alert("모든 필드를 채워주세요.")
      return
    }

    onAddEntry({
      petName: newEntryPetName,
      title: newEntryTitle,
      content: newEntryContent,
      images: newEntryImages,
      milestones: newEntryMilestones
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      mood: newEntryMood,
      activities: newEntryActivities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    })

    // Reset form
    setNewEntryTitle("")
    setNewEntryContent("")
    setNewEntryPetName("")
    setNewEntryImages([])
    setNewEntryMilestones("")
    setNewEntryMood("")
    setNewEntryActivities("")
    // setShowAddEntryForm(false) // This will be removed or changed later
  }

  // Filter entries by current user if available
  const userEntries = currentUserId ? entries.filter((entry) => entry.ownerEmail === currentUserId) : entries; // Filter by ownerEmail if currentUserId is provided

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">성장일기</h1>
          <div className="flex space-x-2">
            {/* Removed "홈으로 돌아가기" button */}
            {isLoggedIn && (
              <Button onClick={onNavigateToWrite} className="bg-yellow-400 hover:bg-yellow-500 text-black">
                <Plus className="h-4 w-4 mr-2" />글쓰기
              </Button>
            )}
          </div>
        </div>

        {/* Add New Entry Form - Removed */}
        {/* {showAddEntryForm && (
          <Card className="mb-8 p-6">
            <CardContent className="space-y-4">
              <h2 className="text-xl font-bold">새 일기 작성</h2>
              <div>
                <label htmlFor="petName" className="block text-sm font-medium text-gray-700">
                  펫 이름
                </label>
                <input
                  type="text"
                  id="petName"
                  value={newEntryPetName}
                  onChange={(e) => setNewEntryPetName(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  placeholder="일기를 작성할 펫의 이름을 입력하세요"
                />
              </div>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  제목
                </label>
                <input
                  type="text"
                  id="title"
                  value={newEntryTitle}
                  onChange={(e) => setNewEntryTitle(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  placeholder="일기 제목을 입력하세요"
                />
              </div>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                  내용
                </label>
                <textarea
                  id="content"
                  value={newEntryContent}
                  onChange={(e) => setNewEntryContent(e.target.value)}
                  rows={5}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  placeholder="오늘의 일기를 작성하세요"
                ></textarea>
              </div>
              <div>
                <label htmlFor="images" className="block text-sm font-medium text-gray-700">
                  이미지 URL (쉼표로 구분)
                </label>
                <input
                  type="text"
                  id="images"
                  value={newEntryImages.join(",")}
                  onChange={(e) => setNewEntryImages(e.target.value.split(",").map((url) => url.trim()))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  placeholder="이미지 URL을 입력하세요 (예: /image1.jpg, /image2.png)"
                />
              </div>
              <div>
                <label htmlFor="milestones" className="block text-sm font-medium text-gray-700">
                  기념일/이정표 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  id="milestones"
                  value={newEntryMilestones}
                  onChange={(e) => setNewEntryMilestones(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  placeholder="예: 첫 산책, 예방접종 완료"
                />
              </div>
              <div>
                <label htmlFor="mood" className="block text-sm font-medium text-gray-700">
                  오늘의 기분
                </label>
                <input
                  type="text"
                  id="mood"
                  value={newEntryMood}
                  onChange={(e) => setNewEntryMood(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  placeholder="예: 행복함, 피곤함"
                />
              </div>
              <div>
                <label htmlFor="activities" className="block text-sm font-medium text-gray-700">
                  오늘의 활동 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  id="activities"
                  value={newEntryActivities}
                  onChange={(e) => setNewEntryActivities(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  placeholder="예: 산책, 낮잠, 간식 먹기"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddEntryForm(false)}>
                  취소
                </Button>
                <Button onClick={handleAddEntry}>일기 추가</Button>
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* Diary Entries List */}
        <div className="grid gap-6">
          {userEntries.length > 0 ? (
            userEntries.map((entry) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-bold text-gray-900">{entry.title}</h2>
                        <Button size="sm" variant="ghost" onClick={() => onViewEntry(entry)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{entry.date}</p>
                      <p className="text-gray-700 mb-4 line-clamp-3">{entry.content}</p>
                      <div className="flex flex-wrap gap-2">
                        {entry.milestones?.map((milestone, index) => (
                          <Badge key={index} variant="secondary">
                            {milestone}
                          </Badge>
                        ))}
                        {entry.mood && <Badge variant="outline">기분: {entry.mood}</Badge>}
                        {entry.activities?.map((activity, index) => (
                          <Badge key={index} variant="outline">
                            {activity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {entry.images && entry.images.length > 0 && (
                      <div className="flex-shrink-0 w-full md:w-1/3 lg:w-1/4 relative">
                        <Image
                          src={entry.images?.[0] || "/placeholder.svg"}
                          alt={entry.title}
                          width={300}
                          height={200}
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
  )
}

"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Edit, Mic } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { fetchDiaries } from "@/lib/api/diary"

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
  userId: number
  audioUrl?: string 
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

  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([])

  useEffect(() => {
    if (currentUserId) {
      fetchDiaries(Number(currentUserId))
        .then(setDiaryEntries)
        .catch((err) => {
          console.error("일기 목록 불러오기 실패:", err)
        })
    } else {
      fetchDiaries()
        .then(setDiaryEntries)
        .catch((err) => {
          console.error("일기 목록 불러오기 실패:", err)
        })
    }
  }, [currentUserId])




  const userEntries = currentUserId
  ? diaryEntries.filter((entry) => entry.userId === Number(currentUserId))
  : diaryEntries


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
                        {entry.audioUrl && (
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Mic className="h-3 w-3" />
                            음성일기
                          </Badge>
                        )}
                      </div>
                    </div>
                    {entry.images && entry.images.length > 0 && (
                      <div className="flex-shrink-0 w-full md:w-1/3 lg:w-1/4 relative">
                        <Image
                          src={entry.images[0] || "/placeholder.svg"}
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

"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ImageIcon, X } from "lucide-react"

interface CommunityWritePageProps {
  onBack: () => void
  onSubmit: (postData: { title: string; content: string; type: "Q&A" | "자유게시판"; images: string[] }) => void
}

export default function CommunityWritePage({ onBack, onSubmit }: CommunityWritePageProps) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  // 게시판 종류는 이제 기본값으로 "자유게시판"을 사용합니다.
  const boardType: "Q&A" | "자유게시판" = "자유게시판"
  const [images, setImages] = useState<string[]>([]) // State to store image URLs
  const [imageFiles, setImageFiles] = useState<File[]>([]) // State to store actual image files
  const [error, setError] = useState("")

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files)
      setImageFiles((prev) => [...prev, ...filesArray])

      // Create URLs for preview
      const newImageUrls = filesArray.map((file) => URL.createObjectURL(file))
      setImages((prev) => [...prev, ...newImageUrls])
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove))
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.")
      return
    }

    // In a real application, you would upload imageFiles to a storage service
    // and get their public URLs before submitting the post data.
    // For this example, we'll just use the preview URLs or placeholder.
    onSubmit({ title, content, type: boardType, images: images })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={onBack} variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">새 게시글 작성</h1>
          <div className="w-24" /> {/* Placeholder for alignment */}
        </div>

        <Card className="p-6">
          <CardContent className="space-y-6">
            {/* 게시판 종류 선택 필드 제거됨 */}

            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                placeholder="내용을 입력하세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                required
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="image-upload">사진 첨부 (선택 사항)</Label>
              <Input id="image-upload" type="file" multiple accept="image/*" onChange={handleImageUpload} />
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((imageSrc, index) => (
                  <div key={index} className="relative w-full h-32 rounded-md overflow-hidden group">
                    <img
                      src={imageSrc || "/placeholder.svg"}
                      alt={`Uploaded preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {images.length === 0 && (
                  <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400">
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
              </div>
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <Button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black" onClick={handleSubmit}>
              작성 완료
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

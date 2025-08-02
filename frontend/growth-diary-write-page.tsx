import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label"; // Label 컴포넌트 추가
import { Card, CardContent } from "@/components/ui/card"; // Card 컴포넌트 추가
import Image from "next/image";
import { ChevronLeft, ImageIcon, X } from "lucide-react"; // ImageIcon, X 아이콘 추가

interface GrowthDiaryWritePageProps {
  onBack: () => void;
  onSubmit: (data: { title: string; content: string; images: string[]; milestones: string[]; activities: string[]; tags: string[] }) => void;
}

export default function GrowthDiaryWritePage({
  onBack,
  onSubmit,
}: GrowthDiaryWritePageProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]); // State to store image URLs
  const [imageFiles, setImageFiles] = useState<File[]>([]); // State to store actual image files
  const [milestones, setMilestones] = useState<string>(""); // 마일스톤 상태 추가
  const [error, setError] = useState(""); // Error state 추가
  const [activities, setActivities] = useState<string>(""); // 활동 상태 추가
  const [tags, setTags] = useState<string>(""); // 태그 상태 추가

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles((prev) => [...prev, ...filesArray]);

      // Create URLs for preview
      const newImageUrls = filesArray.map((file) => URL.createObjectURL(file));
      setImages((prev) => [...prev, ...newImageUrls]);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Form의 기본 제출 동작 방지
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }
    onSubmit({
      title,
      content,
      images,
      milestones: milestones.split(',').map(m => m.trim()).filter(m => m.length > 0),
      activities: activities.split(',').map(a => a.trim()).filter(a => a.length > 0),
      tags: tags.split(',').map(t => t.trim()).filter(t => t.length > 0), // 태그 추가
    });
  };

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

            <Button
              type="submit"
              onClick={handleSubmit}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-md transition-colors duration-200 text-lg"
            >
              작성 완료
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

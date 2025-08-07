//글쓰기 

"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label"; // Label 컴포넌트 추가
import { Card, CardContent } from "@/components/ui/card"; // Card 컴포넌트 추가
import Image from "next/image";
import { ChevronLeft, ImageIcon, X, Mic, MicOff, Play, Pause } from "lucide-react"; // 음성 관련 아이콘 추가
import { createDiary, uploadImageToS3 } from "@/lib/api/diary"
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface GrowthDiaryWritePageProps {
  onBack: () => void;
  currentUserId: number;
}

export default function GrowthDiaryWritePage({
  onBack,
  currentUserId
}: GrowthDiaryWritePageProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]); // State to store image URLs
  const [imageFiles, setImageFiles] = useState<File[]>([]); // State to store actual image files
  const [milestones, setMilestones] = useState<string>(""); // 마일스톤 상태 추가
  const [error, setError] = useState(""); // Error state 추가
  const [activities, setActivities] = useState<string>(""); // 활동 상태 추가
  const [tags, setTags] = useState<string>(""); // 태그 상태 추가
  const [isUploading, setIsUploading] = useState(false); // 이미지 업로드 상태

  // 음성 녹음 관련 상태
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      toast({
        title: "입력 오류",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    // 현재 로그인된 사용자의 실제 ID 가져오기
    const userId = localStorage.getItem("userId");
    if (!userId) {
      toast({
        title: "로그인 필요",
        description: "로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 이미지 파일들을 S3에 업로드
      let uploadedImageUrls: string[] = [];
      if (imageFiles.length > 0) {
        setIsUploading(true);
        toast({
          title: "이미지 업로드 중",
          description: "이미지를 업로드하고 있습니다...",
        });

        for (const file of imageFiles) {
          try {
            const uploadedUrl = await uploadImageToS3(file);
            uploadedImageUrls.push(uploadedUrl);
          } catch (error) {
            console.error("이미지 업로드 실패:", error);
            toast({
              title: "이미지 업로드 실패",
              description: "이미지 업로드 중 오류가 발생했습니다.",
              variant: "destructive",
            });
            return;
          }
        }
        setIsUploading(false);
      }

      console.log("Creating diary with data:", {
        userId: Number(userId),
        title,
        text: content,
        imageUrl: uploadedImageUrls[0] || null,
        audioUrl: audioUrl || null,
      });

      const result = await createDiary({
        userId: Number(userId),
        title: title,  
        text: content,
        imageUrl: uploadedImageUrls[0] || null,
        audioUrl: audioUrl || null,
      });

      console.log("Diary created successfully:", result);

      // 성공 토스트 메시지 표시
      toast({
        title: "작성 완료",
        description: "작성이 완료되었습니다!",
      });
      
      // 약간의 지연 후 뒤로가기 (토스트 메시지가 보이도록)
      setTimeout(() => {
        onBack();
      }, 1000);
    } catch (err: any) {
      console.error("작성 실패:", err);
      
      // 인증 관련 에러 처리
      if (err.message.includes("로그인이 필요합니다") || err.message.includes("세션이 만료")) {
        toast({
          title: "로그인 필요",
          description: "로그인이 필요합니다. 다시 로그인해주세요.",
          variant: "destructive",
        });
        // 로그인 페이지로 이동
        window.location.href = "/login";
        return;
      }
      
      setError("일기 작성 중 오류가 발생했습니다.");
      toast({
        title: "작성 실패",
        description: "일기 작성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

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

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // 음성 녹음 시작
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // 녹음 시간 타이머 시작
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setError("마이크 접근 권한이 필요합니다.");
      toast({
        title: "마이크 접근 오류",
        description: "마이크 접근 권한이 필요합니다.",
        variant: "destructive",
      });
    }
  };

  // 음성 녹음 중지
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // 타이머 정리
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  // 음성 재생/일시정지
  const toggleAudioPlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // 음성 삭제
  const removeAudio = () => {
    setAudioUrl("");
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // 녹음 시간 포맷팅
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleImageClick}
                  disabled={isUploading}
                  className="flex items-center space-x-2"
                >
                  <ImageIcon className="h-4 w-4" />
                  <span>{images.length === 0 ? "선택된 파일 없음" : `${images.length}개 파일 선택됨`}</span>
                </Button>
                <input
                  ref={fileInputRef}
                  id="image-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              {/* Image Preview Grid */}
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
                  <div 
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 hover:text-gray-500 transition-colors"
                    onClick={handleImageClick}
                  >
                    <ImageIcon className="h-8 w-8" />
                  </div>
                )}
              </div>
            </div>

            {/* 음성 녹음 섹션 */}
            <div className="space-y-2">
              <Label>음성 일기 (선택 사항)</Label>
              <div className="flex items-center space-x-4 p-4 border rounded-lg bg-gray-50">
                {!audioUrl ? (
                  <div className="flex items-center space-x-2">
                    {!isRecording ? (
                      <Button
                        type="button"
                        onClick={startRecording}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        <Mic className="h-4 w-4 mr-2" />
                        녹음 시작
                      </Button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Button
                          type="button"
                          onClick={stopRecording}
                          className="bg-gray-500 hover:bg-gray-600 text-white"
                        >
                          <MicOff className="h-4 w-4 mr-2" />
                          녹음 중지
                        </Button>
                        <span className="text-sm text-gray-600">
                          녹음 중... {formatTime(recordingTime)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      onClick={toggleAudioPlayback}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4 mr-2" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      {isPlaying ? "일시정지" : "재생"}
                    </Button>
                    <Button
                      type="button"
                      onClick={removeAudio}
                      variant="outline"
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4 mr-2" />
                      삭제
                    </Button>
                    <span className="text-sm text-gray-600">음성 녹음 완료</span>
                  </div>
                )}
              </div>
              {audioUrl && (
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="w-full"
                />
              )}
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isUploading}
            >
              {isUploading ? "업로드 중..." : "작성 완료"}
            </Button>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
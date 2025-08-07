//수정 상세페이지 

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { updateDiary, fetchDiaries, fetchDiary, uploadImageToS3 } from "@/lib/api/diary";
import { useToast } from "@/components/ui/use-toast";
import type { DiaryEntry } from "@/diary";
import { Mic, MicOff, Play, Pause, X, Camera, ChevronLeft, ImageIcon } from "lucide-react";

export default function DiaryEditPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching entry with params:", params);
        
        const userId = localStorage.getItem("userId");
        const accessToken = localStorage.getItem("accessToken");

        if (!userId || !accessToken) {
          toast({
            title: "로그인 필요",
            description: "로그인이 필요합니다.",
            variant: "destructive",
          });
          router.push("/?page=diary");
          return;
        }

        // params.id가 배열일 수 있으므로 첫 번째 요소를 사용
        const diaryId = Array.isArray(params.id) ? params.id[0] : params.id;
        console.log("Diary ID:", diaryId, "User ID:", userId);

        if (!diaryId) {
          toast({
            title: "잘못된 접근",
            description: "일기 ID가 올바르지 않습니다.",
            variant: "destructive",
          });
          router.push("/?page=diary");
          return;
        }

        // 개별 일기 데이터 가져오기
        const foundEntry = await fetchDiary(Number(diaryId));
        console.log("Found entry:", foundEntry);

        if (foundEntry) {
          setEntry(foundEntry);
          setTitle(foundEntry.title || "");
          setContent(foundEntry.text || "");
          setImageUrl(foundEntry.imageUrl || null);
          setAudioUrl(foundEntry.audioUrl || null);
          console.log("Entry data set:", {
            title: foundEntry.title,
            content: foundEntry.text,
            imageUrl: foundEntry.imageUrl,
            audioUrl: foundEntry.audioUrl
          });
        } else {
          console.log("Entry not found for ID:", diaryId);
          toast({
            title: "일기를 찾을 수 없습니다",
            description: "요청하신 일기를 찾을 수 없습니다.",
            variant: "destructive",
          });
          router.push("/?page=diary");
        }
      } catch (error) {
        console.error("일기 불러오기 실패:", error);
        toast({
          title: "오류 발생",
          description: "일기를 불러오는 중 오류가 발생했습니다.",
          variant: "destructive",
        });
        router.push("/?page=diary");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntry();
  }, [params, router, toast]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

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
      toast({
        title: "마이크 접근 오류",
        description: "마이크 접근 권한이 필요합니다.",
        variant: "destructive",
      });
    }
  };

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

  const removeAudio = () => {
    setAudioUrl(null);
    setIsPlaying(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImageFile(file);
      
      // 미리보기 URL 생성
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setImagePreview(null);
    setImageUrl(null);
  };

  const handleSave = async () => {
    if (!entry) return;

    if (!title.trim() || !content.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      let finalImageUrl = imageUrl;

      // 새로 선택된 이미지가 있으면 S3에 업로드
      if (selectedImageFile) {
        setIsUploading(true);
        toast({
          title: "이미지 업로드 중",
          description: "이미지를 업로드하고 있습니다...",
        });

        try {
          console.log("Uploading image to S3:", selectedImageFile.name);
          const uploadedUrl = await uploadImageToS3(selectedImageFile);
          finalImageUrl = uploadedUrl;
          console.log("Image uploaded successfully:", uploadedUrl);
        } catch (error) {
          console.error("이미지 업로드 실패:", error);
          toast({
            title: "이미지 업로드 실패",
            description: "이미지 업로드 중 오류가 발생했습니다.",
            variant: "destructive",
          });
          return;
        } finally {
          setIsUploading(false);
        }
      }

      const updateData = {
        title,
        text: content,
        imageUrl: finalImageUrl || null,
        audioUrl: audioUrl || null,
      };

      console.log("Saving entry:", {
        diaryId: entry.diaryId,
        updateData
      });

      const result = await updateDiary(entry.diaryId, updateData);

      console.log("Diary updated successfully:", result);
      
      toast({
        title: "수정 완료",
        description: "수정이 완료되었습니다.",
      });
      
      // 메인 페이지로 이동하면서 성장일기 탭 활성화
      router.push("/?page=diary");
    } catch (err: any) {
      console.error("수정 실패:", err);
      
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
      
      toast({
        title: "수정 실패",
        description: "수정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    // 메인 페이지로 이동하면서 성장일기 탭 활성화
    router.push("/?page=diary");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">일기를 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button onClick={handleCancel} variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">일기 수정</h1>
          <div className="w-24" /> {/* Placeholder for alignment */}
        </div>

        <Card className="p-6">
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">제목</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력하세요"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">내용</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                placeholder="내용을 입력하세요"
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
                  <span>이미지 선택</span>
                </Button>
                <input
                  ref={fileInputRef}
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {(imagePreview || imageUrl) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveImage}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    이미지 제거
                  </Button>
                )}
              </div>
              
              {/* Image Preview */}
              {(imagePreview || imageUrl) && (
                <div className="mt-4">
                  <img
                    src={imagePreview || imageUrl || ""}
                    alt="이미지 미리보기"
                    className="w-full h-32 object-cover rounded-md"
                  />
                </div>
              )}
              
              {!imagePreview && !imageUrl && (
                <div 
                  className="w-full h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400 cursor-pointer hover:border-gray-400 hover:text-gray-500 transition-colors"
                  onClick={handleImageClick}
                >
                  <Camera className="h-8 w-8" />
                  <span className="ml-2">이미지를 선택하세요</span>
                </div>
              )}
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

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                취소
              </Button>
              <Button onClick={handleSave} disabled={isUploading}>
                {isUploading ? "업로드 중..." : "수정 완료"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
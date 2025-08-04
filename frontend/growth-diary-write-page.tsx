import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label"; // Label 컴포넌트 추가
import { Card, CardContent } from "@/components/ui/card"; // Card 컴포넌트 추가
import Image from "next/image";
import { ChevronLeft, ImageIcon, X, Mic, MicOff, Play, Pause } from "lucide-react"; // 음성 관련 아이콘 추가
import { createDiary } from "@/lib/api/diary"

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

  // 음성 녹음 관련 상태
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }
  
    try {
     await createDiary({
  userId: currentUserId,
  text: content,  // 프론트는 content, 백엔드는 text
  imageUrl: images[0],  // 첫 번째 이미지만 보내기
  audioUrl: audioUrl || undefined,
});


      alert("작성 완료!");
      onBack();
    } catch (err) {
      console.error("작성 실패:", err);
      setError("일기 작성 중 오류가 발생했습니다.");
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
            >
              작성 완료
            </Button>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}

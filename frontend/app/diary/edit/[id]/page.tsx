//수정 상세페이지 

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateDiary, fetchDiaries } from "@/lib/api/diary";
import type { DiaryEntry } from "@/diary";
import { Mic, MicOff, Play, Pause, X, Camera } from "lucide-react";

export default function DiaryEditPage() {
  const router = useRouter();
  const { id } = useParams();
  const [entry, setEntry] = useState<DiaryEntry | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const accessToken = localStorage.getItem("accessToken");

    if (!userId || !accessToken) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    const fetchEntry = async () => {
      const allEntries = await fetchDiaries(Number(userId));  // userId를 넘겨줌!
      const foundEntry = allEntries.find((e: DiaryEntry) => e.diaryId === Number(id));
      if (foundEntry) {
        setEntry(foundEntry);
        setTitle(foundEntry.title || "");
        setContent(foundEntry.text || "");
        setImageUrl(foundEntry.imageUrl || null);
        setAudioUrl(foundEntry.audioUrl || null);
      }
    };

    fetchEntry();
  }, [id, router]);


  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    const chunks: BlobPart[] = [];
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/wav" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
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

  const handleSave = async () => {
    if (!entry) return;

    try {
      await updateDiary(entry.diaryId, {
        title,
        text: content,
        imageUrl,
        audioUrl,
      });
      alert("수정이 완료되었습니다.");
      router.push("/diary");
      router.refresh();  // 목록 리페치 (캐시 강제 갱신)
    } catch (err) {
      console.error("수정 실패:", err);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  if (!entry) {
    return <div className="p-10 text-center">데이터를 불러오는 중...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">일기 수정</h1>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">제목</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">내용</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="내용을 입력하세요"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">사진 첨부 (기능 미구현)</label>
          <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400">
            <Camera className="h-8 w-8" />
            <span className="ml-2">사진 첨부는 추후 구현 예정</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">음성 일기</label>
          <div className="flex items-center gap-2">
            {!isRecording ? (
              <Button variant="outline" onClick={startRecording}>
                <Mic className="w-4 h-4 mr-2" /> 녹음 시작
              </Button>
            ) : (
              <Button variant="destructive" onClick={stopRecording}>
                <MicOff className="w-4 h-4 mr-2" /> 녹음 중지
              </Button>
            )}
            {audioUrl && (
              <>
                <Button variant="secondary" onClick={toggleAudioPlayback}>
                  {isPlaying ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlaying ? "일시정지" : "재생"}
                </Button>
                <Button variant="ghost" onClick={removeAudio}>
                  <X className="w-4 h-4" /> 삭제
                </Button>
              </>
            )}
          </div>
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onEnded={() => setIsPlaying(false)}
              className="w-full mt-2"
            />
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => router.back()}>
            취소
          </Button>
          <Button onClick={handleSave}>
            저장
          </Button>
        </div>
      </div>
    </div>
  );
} 
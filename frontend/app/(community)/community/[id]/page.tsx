"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getApiBaseUrl } from "@/lib/utils/apiBaseUrl";
import { Edit, Trash2, X, ChevronLeft, Check } from "lucide-react";

interface CommunityPost {
  id: number;
  title: string;
  content: string;
  author: string;
  date: string;
  category: string;
  boardType: "Q&A" | "자유게시판";
  views: number;
  likes: number;
  comments: number;
  tags: string[];
  images?: string[];
  ownerEmail?: string;
}

interface CommunityDetailPageProps {
  post: CommunityPost;
  onBack: () => void;
  isLoggedIn: boolean;
  onShowLogin: () => void;
  onUpdatePost: (updatedPost: CommunityPost) => void;
  onDeletePost: (postId: number) => void;
  currentUserEmail?: string;
  currentUserRole?: string;
}

export default function CommunityDetailPage({
  post,
  onBack,
  isLoggedIn,
  onShowLogin,
  onUpdatePost,
  onDeletePost,
  currentUserEmail,
  currentUserRole,
}: CommunityDetailPageProps) {
  const API_BASE_URL = getApiBaseUrl();

  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [editedImages, setEditedImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // post 값이 변경되면 폼에 채움
  useEffect(() => {
    if (post) {
      setEditedTitle(post.title);
      setEditedContent(post.content);
      setPreviewImages(post.images || []);
    }
  }, [post]);

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem("accessToken");
    return token ? { Access_Token: token } : {};
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setEditedImages((prev) => [...prev, ...filesArray]);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setPreviewImages((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const removedImage = previewImages[index];
    if (removedImage.startsWith("http")) {
      // S3 URL → 파일명 추출 로직 필요
      const fileName = removedImage.split("/").pop() || "";
      setImagesToDelete((prev) => [...prev, fileName]);
    }
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    setEditedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEditSave = async () => {
    try {
      const formData = new FormData();
      const dto = {
        title: editedTitle,
        content: editedContent,
        category: post.category,
        boardType: post.boardType,
        tags: post.tags,
        imagesToDelete,
      };
      formData.append("dto", new Blob([JSON.stringify(dto)], { type: "application/json" }));

      editedImages.forEach((file) => {
        formData.append("postImg", file);
      });

      const res = await fetch(`${API_BASE_URL}/api/community/posts/${post.id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!res.ok) throw new Error(`게시글 수정 실패 (${res.status})`);

      onUpdatePost({
        ...post,
        title: editedTitle,
        content: editedContent,
        images: previewImages,
      });
      setIsEditing(false);
      setImagesToDelete([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/community/posts/${post.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error(`게시글 삭제 실패 (${res.status})`);

      onDeletePost(post.id);
      onBack();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" /> 뒤로가기
        </Button>

        {(currentUserEmail === post.ownerEmail || currentUserRole === "ADMIN") && (
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="icon" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* 수정 모드 */}
      {isEditing ? (
        <div className="space-y-4">
          <Input value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} />
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            rows={6}
          />
          <Input type="file" multiple accept="image/*" onChange={handleImageUpload} />
          <div className="flex flex-wrap gap-2 mt-2">
            {previewImages.map((src, idx) => (
              <div key={idx} className="relative w-24 h-24">
                <Image src={src} alt={`preview-${idx}`} fill className="object-cover rounded" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-1 right-1"
                  onClick={() => handleRemoveImage(idx)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleEditSave} className="bg-green-500 text-white">
              <Check className="h-4 w-4 mr-1" /> 저장
            </Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              취소
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold">{post.title}</h1>
          <p className="mt-2">{post.content}</p>
          {post.images && post.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.images.map((src, idx) => (
                <Image key={idx} src={src} alt={`post-img-${idx}`} width={200} height={150} className="rounded" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div className="mt-4 p-4 border rounded bg-red-50">
          <p>정말로 삭제하시겠습니까?</p>
          <div className="flex gap-2 mt-2">
            <Button variant="destructive" onClick={handleDelete}>
              삭제
            </Button>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              취소
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

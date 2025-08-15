"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Heart, Eye, Plus, Search, Pencil, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getApiBaseUrl } from "@/lib/utils/apiBaseUrl";

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
}

export default function CommunityPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [currentUser, setCurrentUser] = useState("");
  const API_BASE_URL = getApiBaseUrl();

  // 로그인한 사용자 닉네임 가져오기
  useEffect(() => {
    if (typeof window !== "undefined") {
      const nickname = localStorage.getItem("nickname");
      if (nickname) setCurrentUser(nickname);
    }
  }, []);

  // API에서 게시글 목록 가져오기
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/community/posts`);
        if (!res.ok) throw new Error("게시글 불러오기 실패");
        const data = await res.json();
        setCommunityPosts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchPosts();
  }, [API_BASE_URL]);

  const filteredPosts = communityPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const sortedPosts = [...filteredPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const popularPosts = [...communityPosts].sort((a, b) => b.views - a.views).slice(0, 5);

  const handleLike = (postId: number) => {
    setCommunityPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const handleDelete = async (postId: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_BASE_URL}/api/community/posts/${postId}`, {
        method: "DELETE",
        headers: { Access_Token: token || "" },
      });
      if (!res.ok) throw new Error("삭제 실패");
      setCommunityPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error(err);
      alert("게시글 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">커뮤니티</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search + Write Button */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Input
                type="text"
                placeholder="게시글 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow"
              />
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black">
                <Search className="h-4 w-4 mr-2" />
                검색
              </Button>
              <Button
                onClick={() => router.push("/community/write")}
                className="bg-yellow-400 hover:bg-yellow-500 text-black"
              >
                <Plus className="h-4 w-4 mr-2" />
                글쓰기
              </Button>
            </div>

            {/* Post List */}
            {sortedPosts.length > 0 ? (
              sortedPosts.map((post) => (
                <Card
                  key={post.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/community/detail?id=${post.id}`)}
                >
                  <CardContent className="p-6 relative">
                    {/* 수정/삭제 버튼 (작성자만 표시) */}
                    {currentUser === post.author && (
                      <div className="absolute top-4 right-4 flex space-x-2 z-10">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/community/edit?id=${post.id}`);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(post.id);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge
                            variant={
                              post.boardType === "Q&A" ? "default" : "secondary"
                            }
                          >
                            {post.boardType}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {post.author}
                          </span>
                          <span className="text-sm text-gray-500">
                            {post.date}
                          </span>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">
                          {post.title}
                        </h2>
                        <p className="text-gray-700 line-clamp-2 mb-4">
                          {post.content}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {post.views}
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            {post.comments}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(post.id);
                            }}
                            className="flex items-center hover:text-red-500 transition-colors"
                          >
                            <Heart className="h-4 w-4 mr-1" />
                            {post.likes}
                          </button>
                        </div>
                      </div>
                      {post.images && post.images.length > 0 && (
                        <div className="ml-4 flex-shrink-0">
                          <Image
                            src={post.images?.[0] || "/placeholder.svg"}
                            alt={post.title}
                            width={120}
                            height={90}
                            className="rounded-md object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-6 text-center text-gray-500">
                <p>게시글이 없습니다.</p>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">인기 게시글</h3>
                <ul className="space-y-3">
                  {popularPosts.map((post) => (
                    <li
                      key={post.id}
                      className="border-b pb-3 last:border-b-0 last:pb-0"
                    >
                      <button
                        onClick={() => router.push(`/community/detail?id=${post.id}`)}
                        className="text-left w-full"
                      >
                        <p className="text-sm font-medium text-gray-800 hover:text-blue-600 line-clamp-2">
                          {post.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {post.author} • 조회 {post.views}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

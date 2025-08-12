"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Heart, Eye, ChevronLeft, Edit, Trash2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

interface CommunityPost {
  id: number
  title: string
  content: string
  author: string
  date: string
  category: string
  boardType: "Q&A" | "자유게시판"
  views: number
  likes: number
  comments: number
  tags: string[]
  images?: string[] // Optional array of image URLs
  ownerEmail?: string; // Add ownerEmail to CommunityPost
}

interface Comment {
  id: number
  postId: number
  author: string
  content: string
  date: string
}

interface CommunityDetailPageProps {
  post: CommunityPost
  onBack: () => void
  isLoggedIn: boolean
  onShowLogin: () => void
  onUpdatePost: (updatedPost: CommunityPost) => void
  onDeletePost: (postId: number) => void; // Added onDeletePost prop
  currentUserEmail?: string; // Add currentUserEmail prop
}

export default function CommunityDetailPage({
  post,
  onBack,
  isLoggedIn,
  onShowLogin,
  onUpdatePost,
  onDeletePost,
  currentUserEmail,
}: CommunityDetailPageProps) {
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      postId: post.id,
      author: "댓글러1",
      content: "좋은 정보 감사합니다!",
      date: "2024-01-21",
    },
    {
      id: 2,
      postId: post.id,
      author: "댓글러2",
      content: "저도 같은 고민이었는데 도움이 됐어요.",
      date: "2024-01-22",
    },
  ])
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(post.title)
  const [editedContent, setEditedContent] = useState(post.content)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // State for delete confirmation

  const handleAddComment = () => {
    if (!isLoggedIn) {
      onShowLogin()
      return
    }
    if (newComment.trim()) {
      const commentToAdd: Comment = {
        id: comments.length + 1,
        postId: post.id,
        author: "현재사용자", // Replace with actual logged-in user
        content: newComment.trim(),
        date: new Date().toISOString().split("T")[0],
      }
      setComments([...comments, commentToAdd])
      setNewComment("")
      onUpdatePost({ ...post, comments: post.comments + 1 }) // Update comment count in parent
    }
  }

  const handleEditSave = () => {
    onUpdatePost({ ...post, title: editedTitle, content: editedContent })
    setIsEditing(false)
  }

  const handleDelete = () => {
    onDeletePost(post.id);
    onBack(); // Go back to community list after deletion
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button onClick={onBack} variant="outline" className="mb-6 bg-transparent">
          <ChevronLeft className="h-4 w-4 mr-2" />
          목록으로
        </Button>

        {/* Post Detail Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Badge variant={post.boardType === "Q&A" ? "default" : "secondary"}>{post.boardType}</Badge>
                <span className="text-sm text-gray-500">{post.author}</span>
                <span className="text-sm text-gray-500">{post.date}</span>
              </div>
              {/* Edit/Delete Buttons (Example: only for author or admin) */}
              {isLoggedIn && currentUserEmail === post.ownerEmail && ( // Only show edit/delete if current user is the owner
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(!isEditing)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600 bg-transparent"
                    onClick={() => setShowDeleteConfirm(true)} // Show confirmation on click
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            {isEditing ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="text-2xl font-bold"
              />
            ) : (
              <CardTitle className="text-2xl font-bold">{post.title}</CardTitle>
            )}
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} rows={10} />
            ) : (
              <p className="text-gray-800 leading-relaxed mb-6">{post.content}</p>
            )}

            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {post.images.map((image, index) => (
                  <div key={index} className="relative w-full h-48 rounded-md overflow-hidden">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Post image ${index + 1}`}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {isEditing && (
              <Button onClick={handleEditSave} className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black">
                수정 완료
              </Button>
            )}

            <div className="flex items-center space-x-6 text-sm text-gray-500 mt-4 pt-4 border-t">
              <span className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {post.views}
              </span>
              <span className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                {post.comments}
              </span>
              <span className="flex items-center">
                <Heart className="h-4 w-4 mr-1" />
                {post.likes}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Comments Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">댓글 ({comments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              {comments.map((comment) => (
                <div key={comment.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-gray-800">{comment.author}</span>
                    <span className="text-xs text-gray-500">{comment.date}</span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>

            {/* Comment Input */}
            <div className="space-y-2">
              <Textarea
                placeholder={isLoggedIn ? "댓글을 입력하세요..." : "로그인 후 댓글을 작성할 수 있습니다."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={!isLoggedIn}
                rows={3}
              />
              <Button onClick={handleAddComment} disabled={!isLoggedIn || !newComment.trim()} className="bg-yellow-400 hover:bg-yellow-500 text-black">
                댓글 작성
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">게시글 삭제</h3>
                <p className="text-gray-600 mb-6">
                  정말로 이 게시글을 삭제하시겠습니까?
                  <br />
                  삭제된 게시글은 복구할 수 없습니다.
                </p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                    취소
                  </Button>
                  <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
                    삭제
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

    </div>
  )
}

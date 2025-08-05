"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { adoptionRequestApi } from "./lib/api"
import { Edit, X } from "lucide-react"

interface User {
  email: string
  name: string
}

interface Pet {
  id: number
  name: string
  breed: string
  age: string
  gender: string
  size: string
  personality: string[]
  healthStatus: string
  description: string
  images: string[]
  location: string
  contact: string
  adoptionFee: number
  isNeutered: boolean
  isVaccinated: boolean
  specialNeeds?: string
  dateRegistered: string
  adoptionStatus: "available" | "pending" | "adopted"
  ownerEmail?: string
}

interface AdoptionInquiry {
  id: number
  petId: number
  petName: string
  inquirerName: string
  phone: string
  email: string
  message: string
  status: "대기중" | "연락완료" | "승인" | "거절"
  date: string
}

interface AdoptionRequest {
  id: number
  petId: number
  petName: string
  petBreed: string
  userId: number
  userName: string
  applicantName: string
  contactNumber: string
  email: string
  message: string
  status: "PENDING" | "CONTACTED" | "APPROVED" | "REJECTED"
  createdAt: string
  updatedAt: string
}

interface OrderItem {
  id: number
  productId: number
  productName: string
  price: number
  quantity: number
  orderDate: string
  status: "completed" | "pending" | "cancelled"
  ImageUrl: string
}

interface MyPageProps {
  currentUser: User | null
  userPets: Pet[]
  userAdoptionInquiries: AdoptionInquiry[]
  userOrders: OrderItem[]
  onClose: () => void
}

export default function MyPage({ currentUser, userPets, userAdoptionInquiries, userOrders, onClose }: MyPageProps) {
  const [activeTab, setActiveTab] = useState("userInfo")
  const [isEditingUserInfo, setIsEditingUserInfo] = useState(false)
  const [editedName, setEditedName] = useState(currentUser?.name || "")
  const [editedEmail, setEditedEmail] = useState(currentUser?.email || "")
  const [adoptionRequests, setAdoptionRequests] = useState<AdoptionRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<AdoptionRequest | null>(null)
  const [editForm, setEditForm] = useState({
    applicantName: "",
    contactNumber: "",
    email: "",
    message: ""
  })

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <h2 className="text-2xl font-bold text-red-600 mb-4">로그인이 필요합니다</h2>
            <p className="text-gray-600 mb-4">마이페이지를 이용하려면 로그인해주세요.</p>
            <Button onClick={onClose}>홈으로 돌아가기</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleUserInfoSave = () => {
    // Here you would typically send the updated info to a backend
    console.log("Updated User Info:", { name: editedName, email: editedEmail })
    // In a real app, you'd update the currentUser state in the parent component (PetServiceWebsite)
    setIsEditingUserInfo(false)
  }

  // 입양신청 데이터 가져오기
  const fetchAdoptionRequests = async () => {
    setLoading(true)
    try {
      const response = await adoptionRequestApi.getUserAdoptionRequests()
      setAdoptionRequests(response)
    } catch (error) {
      console.error("입양신청 데이터를 가져오는데 실패했습니다:", error)
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    if (currentUser) {
      fetchAdoptionRequests()
    }
  }, [currentUser])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "CONTACTED":
        return "bg-blue-100 text-blue-800"
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "대기중"
      case "CONTACTED":
        return "연락완료"
      case "APPROVED":
        return "승인"
      case "REJECTED":
        return "거절"
      default:
        return status
    }
  }

  // 수정 모달 열기
  const handleEditRequest = (request: AdoptionRequest) => {
    setSelectedRequest(request)
    setEditForm({
      applicantName: request.applicantName,
      contactNumber: request.contactNumber,
      email: request.email,
      message: request.message
    })
    setShowEditModal(true)
  }

  // 수정 모달 닫기
  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setSelectedRequest(null)
    setEditForm({
      applicantName: "",
      contactNumber: "",
      email: "",
      message: ""
    })
  }

  // 입양신청 수정
  const handleUpdateRequest = async () => {
    if (!selectedRequest) return

    try {
      await adoptionRequestApi.updateAdoptionRequest(selectedRequest.id, editForm)
      
      // 로컬 상태 업데이트
      setAdoptionRequests(prev => prev.map(request => 
        request.id === selectedRequest.id 
          ? { ...request, ...editForm }
          : request
      ))
      
      alert("입양신청이 성공적으로 수정되었습니다.")
      handleCloseEditModal()
    } catch (error) {
      console.error('입양신청 수정 오류:', error)
      alert('입양신청 수정에 실패했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">마이페이지</h1>
            <p className="text-gray-600 mt-2">{currentUser.name}님의 정보</p>
          </div>
          <Button onClick={onClose} variant="outline">
            홈으로 돌아가기
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="userInfo">사용자 정보</TabsTrigger>
            <TabsTrigger value="petInfo">펫 정보</TabsTrigger>
            <TabsTrigger value="orders">주문 내역</TabsTrigger>
            <TabsTrigger value="adoptionHistory">입양 내역</TabsTrigger>
          </TabsList>

          {/* 사용자 정보 Tab */}
          <TabsContent value="userInfo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>사용자 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">이름</Label>
                  {isEditingUserInfo ? (
                    <Input id="name" value={editedName} onChange={(e) => setEditedName(e.target.value)} />
                  ) : (
                    <p className="text-gray-700 font-medium">{currentUser.name}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">이메일</Label>
                  {isEditingUserInfo ? (
                    <Input id="email" value={editedEmail} onChange={(e) => setEditedEmail(e.target.value)} disabled />
                  ) : (
                    <p className="text-gray-700 font-medium">{currentUser.email}</p>
                  )}
                </div>
                <div className="flex justify-end">
                  {isEditingUserInfo ? (
                    <Button onClick={handleUserInfoSave}>저장</Button>
                  ) : (
                    <Button onClick={() => setIsEditingUserInfo(true)} variant="outline">
                      정보 수정
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 펫 정보 Tab */}
          <TabsContent value="petInfo" className="space-y-6">
            <h2 className="text-2xl font-bold">나의 펫 정보</h2>
            {userPets.length > 0 ? (
              <div className="grid gap-4">
                {userPets.map((pet) => (
                  <Card key={pet.id}>
                    <CardContent className="p-6 flex items-center space-x-4">
                      <Image
                        src={pet.images?.[0] || "/placeholder.svg?height=100&width=100"}
                        alt={pet.name}
                        width={100}
                        height={100}
                        className="rounded-md object-cover"
                      />
                      <div>
                        <h3 className="text-lg font-semibold">{pet.name}</h3>
                        <p className="text-sm text-gray-600">
                          {pet.breed} • {pet.age} • {pet.gender}
                        </p>
                        <p className="text-sm text-gray-500">건강 상태: {pet.healthStatus}</p>
                        <p className="text-sm text-gray-500">성격: {pet.personality.join(", ")}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center text-gray-500">
                <p>등록된 펫 정보가 없습니다.</p>
              </Card>
            )}
          </TabsContent>

          {/* 주문 내역 Tab */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-bold">주문 내역</h2>
            {userOrders.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">상품</TableHead>
                        <TableHead>상품명</TableHead>
                        <TableHead>상품ID</TableHead>
                        <TableHead>수량</TableHead>
                        <TableHead>가격</TableHead>
                        <TableHead>주문일</TableHead>
                        <TableHead className="text-right">상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userOrders.map((order, index) => (
                        <TableRow key={`${order.productId}-${order.orderDate}-${index}`}>
                          <TableCell>
                            <Image
                              src={order.ImageUrl || "/placeholder.svg"}
                              alt={order.productName}
                              width={60}
                              height={60}
                              className="rounded-md object-cover"
                            />
                          </TableCell>
                          <TableCell className="font-medium">{order.productName}</TableCell>
                          <TableCell>{order.productId || "N/A"}</TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>{(order.price || 0).toLocaleString()}원</TableCell>
                          <TableCell>
                            {order.orderDate ? 
                              (() => {
                                try {
                                  return format(new Date(order.orderDate), "yyyy-MM-dd")
                                } catch {
                                  return "날짜 없음"
                                }
                              })() 
                              : "날짜 없음"
                            }
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              className={
                                order.status === "completed"
                                  ? "bg-green-100 text-green-800"
                                  : order.status === "pending"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {order.status === "completed" ? "완료" : order.status === "pending" ? "대기중" : "취소됨"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-6 text-center text-gray-500">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">주문한 내역이 없습니다</h3>
                    <p className="text-gray-500">아직 주문한 상품이 없습니다. 스토어에서 상품을 구매해보세요!</p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* 입양 내역 Tab */}
          <TabsContent value="adoptionHistory" className="space-y-6">
            <h2 className="text-2xl font-bold">입양 내역</h2>
            
            {/* 통계 카드 */}
            {adoptionRequests.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-blue-600">
                      {adoptionRequests.length}
                    </div>
                    <p className="text-xs text-gray-600">총 신청 건수</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-yellow-600">
                      {adoptionRequests.filter(r => r.status === "PENDING").length}
                    </div>
                    <p className="text-xs text-gray-600">대기중</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {adoptionRequests.filter(r => r.status === "APPROVED").length}
                    </div>
                    <p className="text-xs text-gray-600">승인</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-red-600">
                      {adoptionRequests.filter(r => r.status === "REJECTED").length}
                    </div>
                    <p className="text-xs text-gray-600">거절</p>
                  </CardContent>
                </Card>
              </div>
            )}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                <p className="text-gray-600">입양 내역을 불러오는 중...</p>
              </div>
            ) : adoptionRequests.length > 0 ? (
              <div className="grid gap-4">
                {adoptionRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-3">
                            <h3 className="font-semibold">{request.petName} ({request.petBreed}) 입양신청</h3>
                            <Badge className={getStatusColor(request.status)}>
                              {getStatusText(request.status)}
                            </Badge>
                          </div>
                          <div className="space-y-2 mb-4">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">신청자:</span> {request.applicantName}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">연락처:</span> {request.contactNumber}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">이메일:</span> {request.email}
                            </p>
                          </div>
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">입양 동기 및 메시지:</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                              {request.message}
                            </p>
                          </div>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>신청일: {new Date(request.createdAt).toLocaleDateString()}</span>
                            <span>수정일: {new Date(request.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditRequest(request)}
                            disabled={request.status !== "PENDING"}
                            title={request.status !== "PENDING" ? "대기중인 신청만 수정할 수 있습니다" : "수정하기"}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center text-gray-500">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">입양 신청 내역이 없습니다</h3>
                    <p className="text-gray-500">아직 입양 신청을 하지 않으셨습니다. 입양 페이지에서 마음에 드는 동물을 찾아보세요!</p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* 입양신청 수정 모달 */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>입양신청 수정</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseEditModal}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="applicantName">신청자명</Label>
              <Input
                id="applicantName"
                value={editForm.applicantName}
                onChange={(e) => setEditForm(prev => ({ ...prev, applicantName: e.target.value }))}
                placeholder="신청자명을 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="contactNumber">연락처</Label>
              <Input
                id="contactNumber"
                value={editForm.contactNumber}
                onChange={(e) => setEditForm(prev => ({ ...prev, contactNumber: e.target.value }))}
                placeholder="연락처를 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="이메일을 입력하세요"
              />
            </div>
            <div>
              <Label htmlFor="message">입양 동기 및 메시지</Label>
              <Textarea
                id="message"
                value={editForm.message}
                onChange={(e) => setEditForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="입양 동기와 메시지를 입력하세요"
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={handleCloseEditModal}>
                취소
              </Button>
              <Button onClick={handleUpdateRequest}>
                수정 완료
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

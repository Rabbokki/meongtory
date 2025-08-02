"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "대기중":
        return "bg-yellow-100 text-yellow-800"
      case "연락완료":
        return "bg-blue-100 text-blue-800"
      case "승인":
        return "bg-green-100 text-green-800"
      case "거절":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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
                        src={pet.images[0] || "/placeholder.svg?height=100&width=100"}
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
            {userAdoptionInquiries.length > 0 ? (
              <div className="grid gap-4">
                {userAdoptionInquiries.map((inquiry) => (
                  <Card key={inquiry.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-3">
                            <h3 className="font-semibold">{inquiry.petName} 입양 문의</h3>
                            <Badge className={getStatusColor(inquiry.status)}>{inquiry.status}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">문의자: {inquiry.inquirerName}</p>
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{inquiry.message}</p>
                          <p className="text-xs text-gray-500">문의일: {inquiry.date}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-6 text-center text-gray-500">
                <p>입양 문의 내역이 없습니다.</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

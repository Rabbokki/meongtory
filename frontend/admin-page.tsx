"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Package,
  Heart,
  MessageSquare,
  Users,
  Plus,
  Edit,
  Trash2,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Eye,
  User,
} from "lucide-react"
import AnimalEditModal from "./animal-edit-modal"
import { petApi, handleApiError, s3Api, adoptionRequestApi } from "./lib/api"

interface Product {
  id: number
  name: string
  price: number
  image: string
  category: string
  description: string
  tags: string[]
  stock: number
  registrationDate: string
  registeredBy: string
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
}

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

interface Comment {
  id: number
  postId: number
  postTitle: string
  author: string
  content: string
  date: string
  isReported: boolean
}

interface Order {
  orderId: number
  userId: number
  totalPrice: number
  paymentStatus: "PENDING" | "COMPLETED" | "CANCELLED"
  orderedAt: string
  orderItems?: OrderItem[]
}

interface OrderItem {
  id: number
  productId: number
  productName: string
  price: number
  quantity: number
  ImageUrl: string
}

interface AdminPageProps {
  onClose: () => void // This prop is now used for navigating back to home, but not for logout
  products: Product[]
  pets: Pet[]
  communityPosts: CommunityPost[]
  adoptionInquiries: AdoptionInquiry[]
  comments: Comment[]
  onNavigateToStoreRegistration: () => void
  onNavigateToAnimalRegistration: () => void
  onNavigateToCommunity: () => void
  onUpdateInquiryStatus: (id: number, status: "대기중" | "연락완료" | "승인" | "거절") => void
  onDeleteComment: (id: number) => void
  onDeletePost: (id: number) => void
  onUpdatePet: (pet: Pet) => void
  onEditProduct: (product: Product) => void
  onDeleteProduct: (productId: number) => void
  onUpdateOrderStatus: (orderId: number, status: "PENDING" | "COMPLETED" | "CANCELLED") => void
  isAdmin: boolean
  onAdminLogout: () => void // New prop for admin logout
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

export default function AdminPage({
  onClose,

  pets: initialPets,
  products: initialProducts,

  communityPosts,
  adoptionInquiries: initialAdoptionInquiries,
  comments,
  onNavigateToStoreRegistration,
  onNavigateToAnimalRegistration,
  onNavigateToCommunity,
  onUpdateInquiryStatus,
  onDeleteComment,
  onDeletePost,
  onUpdatePet,
  onEditProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  isAdmin,
  onAdminLogout, // Destructure new prop
}: AdminPageProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPetForEdit, setSelectedPetForEdit] = useState<Pet | null>(null)
  const [pets, setPets] = useState<Pet[]>(initialPets || [])
  const [loading, setLoading] = useState(false)
  const [adoptionInquiries, setAdoptionInquiries] = useState<AdoptionInquiry[]>(initialAdoptionInquiries || [])
  const [inquiriesLoading, setInquiriesLoading] = useState(false)
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [adoptionRequests, setAdoptionRequests] = useState<AdoptionRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<AdoptionRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // 상품 목록을 백엔드에서 가져오기
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('상품 데이터를 가져오는 데 실패했습니다.');
        }
        const data: Product[] = await response.json();
        
        // 최신순으로 정렬 (registrationDate 기준 내림차순)
        const sortedProducts = data.sort((a, b) => {
          const dateA = new Date(a.registrationDate).getTime();
          const dateB = new Date(b.registrationDate).getTime();
          return dateB - dateA; // 내림차순 (최신순)
        });
        
        setProducts(sortedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // 주문 목록을 백엔드에서 가져오기
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log('주문 데이터 가져오기 시작...');
        const response = await fetch('/api/orders');
        console.log('주문 API 응답:', response);
        
        if (!response.ok) {
          throw new Error('주문 데이터를 가져오는 데 실패했습니다.');
        }
        
        const data: any[] = await response.json();
        console.log('받은 주문 데이터:', data);
        
        // 데이터를 Order 형태로 변환
        const orders: Order[] = data.map((order: any) => {
          console.log('처리 중인 주문:', order);
          console.log('주문의 orderItems:', order.orderItems);
          
          return {
            orderId: order.orderId,
            userId: order.userId,
            totalPrice: order.totalPrice,
            paymentStatus: order.paymentStatus,
            orderedAt: order.orderedAt,
            orderItems: order.orderItems || []
          };
        });
        
        // 최신순으로 정렬 (orderedAt 기준 내림차순)
        const sortedOrders = orders.sort((a, b) => {
          const dateA = new Date(a.orderedAt).getTime();
          const dateB = new Date(b.orderedAt).getTime();
          return dateB - dateA; // 내림차순 (최신순)
        });
        
        console.log('변환된 주문 데이터:', sortedOrders);
        setOrders(sortedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, []);

  // 입양 신청 목록을 백엔드에서 가져오기
  useEffect(() => {
    const fetchAdoptionRequests = async () => {
      try {
        const response = await adoptionRequestApi.getAdoptionRequests();
        console.log('입양신청 데이터:', response);
        setAdoptionRequests(response);
      } catch (error) {
        console.error("Error fetching adoption requests:", error);
      }
    };

    fetchAdoptionRequests();
  }, []);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <CardContent>
            <h2 className="text-2xl font-bold text-red-600 mb-4">접근 권한이 없습니다</h2>
            <p className="text-gray-600 mb-4">관리자만 접근할 수 있는 페이지입니다.</p>
            <Button onClick={onClose}>홈으로 돌아가기</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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

  // 긴급 신청 여부 확인 (24시간 이상 대기)
  const isUrgent = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60)
    return diffHours > 24
  }

  // 처리율 계산
  const getProcessingRate = () => {
    if (adoptionRequests.length === 0) return 0
    const processed = adoptionRequests.filter(request => 
      request.status === "APPROVED" || request.status === "REJECTED" || request.status === "CONTACTED"
    ).length
    return Math.round((processed / adoptionRequests.length) * 100)
  }

  // 필터링 및 검색 함수
  const filterRequests = () => {
    let filtered = adoptionRequests

    // 상태별 필터링
    if (statusFilter !== "ALL") {
      filtered = filtered.filter(request => request.status === statusFilter)
    }

    // 검색어 필터링
    if (searchTerm) {
      filtered = filtered.filter(request => 
        request.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.petBreed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.contactNumber.includes(searchTerm) ||
        request.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // 정렬
    filtered.sort((a, b) => {
      if (a.status === "PENDING" && b.status !== "PENDING") return -1
      if (a.status !== "PENDING" && b.status === "PENDING") return 1
      if (a.status === "PENDING" && b.status === "PENDING") {
        const aUrgent = isUrgent(a.createdAt)
        const bUrgent = isUrgent(b.createdAt)
        if (aUrgent && !bUrgent) return -1
        if (!aUrgent && bUrgent) return 1
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    setFilteredRequests(filtered)
  }

  // 필터링 실행
  useEffect(() => {
    filterRequests()
  }, [adoptionRequests, searchTerm, statusFilter])

  // CSV 내보내기 함수
  const exportToCSV = () => {
    const headers = [
      "신청ID", "펫명", "품종", "신청자명", "연락처", "이메일", 
      "상태", "신청일", "메시지", "회원ID"
    ]
    
    const csvData = filteredRequests.map(request => [
      request.id,
      request.petName,
      request.petBreed,
      request.applicantName,
      request.contactNumber,
      request.email,
      request.status === "PENDING" ? "대기중" : 
      request.status === "CONTACTED" ? "연락완료" : 
      request.status === "APPROVED" ? "승인" : "거절",
      new Date(request.createdAt).toLocaleDateString(),
      request.message,
      request.userId
    ])
    
    const csvContent = [
      headers.join(","),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `입양신청_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleEditPet = (pet: Pet) => {
    setSelectedPetForEdit(pet)
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setSelectedPetForEdit(null)
  }

  const handleUpdatePet = (updatedPet: Pet) => {
    onUpdatePet(updatedPet)
    handleCloseEditModal()
  }

  // 펫 입양 상태 수동 변경 함수
  const handleUpdatePetStatus = async (petId: number, newStatus: "available" | "adopted") => {
    try {
      // 백엔드 API 호출
      const adopted = newStatus === "adopted"
      await petApi.updateAdoptionStatus(petId, adopted)
      
      // 프론트엔드 상태 업데이트
      setPets(prev => prev.map(pet => 
        pet.id === petId 
          ? { ...pet, adoptionStatus: newStatus }
          : pet
      ))
      
      alert(`입양 상태가 ${newStatus === 'adopted' ? '입양완료' : '입양가능'}로 변경되었습니다.`)
    } catch (error) {
      console.error('입양 상태 업데이트 오류:', error)
      alert('입양 상태 업데이트에 실패했습니다.')
    }
  }

  const handleDeletePet = async (petId: number, petName: string) => {
    if (confirm(`${petName}을(를) 삭제하시겠습니까?\n\n⚠️ 주의: 관련된 모든 입양신청도 함께 삭제됩니다.`)) {
      try {
        // 삭제할 동물의 정보를 찾아서 S3 이미지들도 함께 삭제
        const petToDelete = pets.find(pet => pet.id === petId)
        if (petToDelete && petToDelete.images) {
          // S3 이미지들 삭제
          for (const imageUrl of petToDelete.images) {
            if (imageUrl && imageUrl.startsWith('https://')) {
              try {
                // URL에서 파일명 추출
                const fileName = imageUrl.split('/').pop()
                if (fileName) {
                  await s3Api.deleteFile(fileName)
                  console.log(`S3에서 이미지 삭제 완료: ${fileName}`)
                }
              } catch (error) {
                console.error("S3 이미지 삭제 실패:", error)
                // 삭제 실패해도 계속 진행
              }
            }
          }
        }

        // 동물 정보 삭제 (백엔드에서 관련 입양신청도 함께 삭제)
        await petApi.deletePet(petId)
        setPets(prev => prev.filter(pet => pet.id !== petId))
        alert(`${petName}이(가) 성공적으로 삭제되었습니다.\n관련된 입양신청도 함께 삭제되었습니다.`)
      } catch (error) {
        console.error("동물 삭제에 실패했습니다:", error)
        alert("동물 삭제에 실패했습니다.")
      }
    }
  }

  // API 데이터를 프론트엔드 형식으로 변환
  const convertApiPetToAdminPet = (apiPet: any): Pet => {
    // 해당 펫의 입양신청 상태 확인
    const petAdoptionRequests = adoptionRequests.filter(request => request.petId === apiPet.petId)
    const hasPendingRequests = petAdoptionRequests.some(request => request.status === "PENDING")
    const hasApprovedRequests = petAdoptionRequests.some(request => request.status === "APPROVED")
    
    // 입양 상태 결정 (수정된 로직)
    let adoptionStatus: "available" | "pending" | "adopted" = "available"
    
    // 백엔드에서 이미 입양완료로 설정된 경우
    if (apiPet.adopted) {
      adoptionStatus = "adopted"
    } 
    // 승인된 입양신청이 있으면 입양대기로 설정 (자동)
    else if (hasApprovedRequests) {
      adoptionStatus = "pending"
    } 
    // 대기중인 입양신청이 있으면 입양대기
    else if (hasPendingRequests) {
      adoptionStatus = "pending"
    }
    // 그 외에는 입양가능 (기본값)
    
    return {
      id: apiPet.petId,
      name: apiPet.name,
      breed: apiPet.breed,
      age: `${apiPet.age}살`,
      gender: apiPet.gender === 'MALE' ? '수컷' : '암컷',
      size: apiPet.weight ? `${apiPet.weight}kg` : '',
      personality: apiPet.personality ? apiPet.personality.split(',').map((p: string) => p.trim()) : [],
      healthStatus: apiPet.medicalHistory || '',
      description: apiPet.description || '',
      images: apiPet.imageUrl ? [apiPet.imageUrl] : [],
      location: apiPet.location || '',
      contact: '',
      adoptionFee: 0,
      isNeutered: apiPet.neutered || false,
      isVaccinated: apiPet.vaccinated || false,
      specialNeeds: apiPet.rescueStory || '',
      dateRegistered: new Date().toISOString().split('T')[0],
      adoptionStatus: adoptionStatus
    }
  }

  // 펫 데이터 가져오기
  const fetchPets = async () => {
    setLoading(true)
    try {
      const apiPets = await petApi.getPets()
      const convertedPets = apiPets.map(convertApiPetToAdminPet)
      setPets(convertedPets)
    } catch (error) {
      console.error("펫 데이터를 가져오는데 실패했습니다:", error)
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 데이터 가져오기
  useEffect(() => {
    fetchPets()
  }, [])

  // 입양신청 데이터가 변경될 때마다 펫 목록 업데이트
  useEffect(() => {
    if (adoptionRequests.length > 0) {
      fetchPets()
    }
  }, [adoptionRequests])

  const handleEditProduct = (product: Product) => {
    // 상품 수정 페이지로 이동
    console.log('상품 수정:', product);
    onEditProduct(product);
  };

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      try {
        console.log('상품 삭제 요청:', productId);
        
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        });

        const result = await response.json();
        console.log('삭제 응답:', result);

        if (!response.ok) {
          throw new Error(result.error || '상품 삭제에 실패했습니다.');
        }

        // 상품 목록에서 제거
        setProducts(prev => prev.filter(p => p.id !== productId));
        alert('상품이 성공적으로 삭제되었습니다.');
      } catch (error) {
        console.error('상품 삭제 오류:', error);
        alert('상품 삭제 중 오류가 발생했습니다: ' + (error as Error).message);
      }
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: "PENDING" | "COMPLETED" | "CANCELLED") => {
    try {
      console.log(`주문 상태 변경 요청: 주문ID ${orderId}, 상태 ${status}`);
      
      const response = await fetch(`/api/orders/${orderId}/status?status=${status}`, {
        method: 'PUT'
      });
      
      console.log('상태 변경 응답:', response);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('상태 변경 오류 응답:', errorText);
        throw new Error('주문 상태 업데이트에 실패했습니다.');
      }
      
      const updatedOrder = await response.json();
      console.log('업데이트된 주문:', updatedOrder);
      
      // 현재 주문 목록에서 해당 주문만 업데이트
      setOrders(prev => prev.map(order => 
        order.orderId === orderId 
          ? { ...order, paymentStatus: status }
          : order
      ));
      
      alert(`주문 상태가 ${status === 'COMPLETED' ? '완료' : status === 'PENDING' ? '대기중' : '취소'}로 변경되었습니다.`);
    } catch (error) {
      console.error('주문 상태 업데이트 오류:', error);
      alert('주문 상태 업데이트에 실패했습니다.');
    }
  };

  const handleUpdateAdoptionRequestStatus = async (requestId: number, status: "PENDING" | "CONTACTED" | "APPROVED" | "REJECTED") => {
    try {
      console.log(`입양 신청 상태 변경 요청: 신청ID ${requestId}, 상태 ${status}`);
      
      const response = await adoptionRequestApi.updateAdoptionRequestStatus(requestId, status);
      console.log('업데이트된 입양 신청:', response);
      
      // 현재 입양 신청 목록에서 해당 신청만 업데이트
      setAdoptionRequests(prev => prev.map(request => 
        request.id === requestId 
          ? { ...request, status: status }
          : request
      ));
      
      // 입양신청 승인 시 해당 펫의 상태도 업데이트
      if (status === "APPROVED") {
        const approvedRequest = adoptionRequests.find(request => request.id === requestId);
        if (approvedRequest) {
          try {
            // 펫의 adopted 상태를 true로 업데이트
            await petApi.updateAdoptionStatus(approvedRequest.petId, true);
            console.log(`펫 ${approvedRequest.petId}의 입양 상태를 완료로 업데이트했습니다.`);
          } catch (error) {
            console.error('펫 상태 업데이트 실패:', error);
          }
        }
      }
      
      // 입양신청 상태 변경 후 펫 목록도 업데이트
      setTimeout(() => {
        fetchPets()
      }, 100)
      
      const statusMessage = status === 'APPROVED' ? '승인 (입양관리에서 상태를 확인하세요)' : 
                           status === 'REJECTED' ? '거절' : 
                           status === 'CONTACTED' ? '연락완료' : '대기중'
      alert(`입양 신청 상태가 ${statusMessage}로 변경되었습니다.`);
    } catch (error) {
      console.error('입양 신청 상태 업데이트 오류:', error);
      alert('입양 신청 상태 업데이트에 실패했습니다.');
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">관리자 페이지</h1>
            <p className="text-gray-600 mt-2">멍토리 서비스 관리 대시보드</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">대시보드</TabsTrigger>
            <TabsTrigger value="products">상품관리</TabsTrigger>
            <TabsTrigger value="pets">입양관리</TabsTrigger>
            <TabsTrigger value="inquiries">입양신청</TabsTrigger>
            <TabsTrigger value="orders">주문내역</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">등록된 상품</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                  <p className="text-xs text-muted-foreground">전체 상품 수</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">입양 대기 동물</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {pets.filter((pet) => pet.adoptionStatus === "available").length}
                  </div>
                  <p className="text-xs text-muted-foreground">입양 가능한 동물</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">커뮤니티 게시글</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{communityPosts.length}</div>
                  <p className="text-xs text-muted-foreground">전체 게시글 수</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">대기중인 입양신청</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {adoptionRequests.filter(request => request.status === "PENDING").length}
                  </div>
                  <p className="text-xs text-muted-foreground">처리 대기 건수</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">처리율</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{getProcessingRate()}%</div>
                  <p className="text-xs text-muted-foreground">전체 처리 완료율</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>빠른 작업</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    onClick={onNavigateToStoreRegistration}
                    className="h-20 flex flex-col items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-black"
                  >
                    <Plus className="h-6 w-6 mb-2" />
                    상품 등록
                  </Button>
                  <Button
                    onClick={onNavigateToAnimalRegistration}
                    className="h-20 flex flex-col items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-black"
                  >
                    <Heart className="h-6 w-6 mb-2" />
                    동물 등록
                  </Button>
                  <Button onClick={onNavigateToCommunity} className="h-20 flex flex-col items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-black">
                    <MessageSquare className="h-6 w-6 mb-2" />
                    커뮤니티 관리
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">상품 관리</h2>
              <Button onClick={onNavigateToStoreRegistration} className="bg-yellow-400 hover:bg-yellow-500 text-black">
                <Plus className="h-4 w-4 mr-2" />새 상품 등록
              </Button>
            </div>

            <div className="grid gap-4">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-gray-600">{product.category}</p>
                          <p className="text-lg font-bold text-yellow-600">{product.price.toLocaleString()}원</p>
                          <p className="text-sm text-gray-500">재고: {product.stock}개</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Pets Tab */}
          <TabsContent value="pets" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">입양 관리</h2>
              <Button onClick={onNavigateToAnimalRegistration} className="bg-yellow-400 hover:bg-yellow-500 text-black">
                <Plus className="h-4 w-4 mr-2" />새 동물 등록
              </Button>
            </div>

            <div className="grid gap-4">
              {loading ? (
                <div className="text-center py-8">
                  <p>데이터를 불러오는 중...</p>
                </div>
              ) : pets.length === 0 ? (
                <div className="text-center py-8">
                  <p>등록된 동물이 없습니다.</p>
                </div>
              ) : (
                pets.map((pet) => (
                <Card key={pet.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={pet.images?.[0] || "/placeholder.svg"}
                          alt={pet.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold">{pet.name}</h3>
                          <p className="text-sm text-gray-600">
                            {pet.breed} • {pet.age} • {pet.gender}
                          </p>
                          <p className="text-sm text-gray-500">{pet.location}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge className={getStatusColor(pet.adoptionStatus)}>
                              {pet.adoptionStatus === "available"
                                ? "입양가능"
                                : pet.adoptionStatus === "pending"
                                  ? "입양대기"
                                  : "입양완료"}
                            </Badge>
                            {/* 입양신청 현황 표시 */}
                            {(() => {
                              const petRequests = adoptionRequests.filter(request => request.petId === pet.id)
                              const pendingCount = petRequests.filter(r => r.status === "PENDING").length
                              const approvedCount = petRequests.filter(r => r.status === "APPROVED").length
                              
                              if (petRequests.length > 0) {
                                return (
                                  <div className="flex space-x-1">
                                    {pendingCount > 0 && (
                                      <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                        대기 {pendingCount}건
                                      </Badge>
                                    )}
                                    {approvedCount > 0 && (
                                      <Badge className="bg-green-100 text-green-800 text-xs">
                                        승인 {approvedCount}건
                                      </Badge>
                                    )}
                                  </div>
                                )
                              }
                              return null
                            })()}
                          </div>
                        </div>
                      </div>
                                              <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditPet(pet)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUpdatePetStatus(pet.id, "available")}
                            disabled={pet.adoptionStatus === "available"}
                          >
                            입양가능
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleUpdatePetStatus(pet.id, "adopted")}
                            disabled={pet.adoptionStatus === "adopted"}
                          >
                            입양완료
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleDeletePet(pet.id, pet.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
            </div>
          </TabsContent>

          {/* Adoption Requests Tab */}
          <TabsContent value="adoption-requests" className="space-y-6">
            <h2 className="text-2xl font-bold">입양신청 관리</h2>

            <div className="grid gap-4">
              {adoptionRequests.length > 0 ? (
                adoptionRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-3">
                            <h3 className="font-semibold">{request.petName} ({request.petBreed}) 입양신청</h3>
                            <Badge className={getStatusColor(request.status)}>
                              {request.status === "PENDING" ? "대기중" : 
                               request.status === "CONTACTED" ? "연락완료" :
                               request.status === "APPROVED" ? "승인" : "거절"}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">신청자: {request.applicantName}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">연락처: {request.contactNumber}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">이메일: {request.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">사용자 ID: {request.userId}</span>
                            </div>
                          </div>
                          
                          <div className="mb-4">
                            <h4 className="font-medium text-sm mb-2">입양 동기 및 메시지:</h4>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                              {request.message}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>신청일: {new Date(request.createdAt).toLocaleDateString()}</span>
                            <span>수정일: {new Date(request.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateAdoptionRequestStatus(request.id, "CONTACTED")}
                            disabled={request.status === "CONTACTED" || request.status === "APPROVED" || request.status === "REJECTED"}
                          >
                            <Phone className="h-4 w-4 mr-1" />
                            연락완료
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateAdoptionRequestStatus(request.id, "APPROVED")}
                            disabled={request.status === "APPROVED" || request.status === "REJECTED"}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            승인
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateAdoptionRequestStatus(request.id, "REJECTED")}
                            disabled={request.status === "APPROVED" || request.status === "REJECTED"}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            거절
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center text-gray-500">
                      <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>아직 입양신청이 없습니다.</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Adoption Requests Tab */}
          <TabsContent value="inquiries" className="space-y-6">
            <h2 className="text-2xl font-bold">입양신청 관리</h2>

            {/* 검색 및 필터 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="신청자명, 펫명, 품종, 연락처로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="ALL">전체 상태</option>
                <option value="PENDING">대기중</option>
                <option value="CONTACTED">연락완료</option>
                <option value="APPROVED">승인</option>
                <option value="REJECTED">거절</option>
              </select>
              <Button 
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                CSV 내보내기
              </Button>
            </div>

            {/* 통계 요약 */}
            <div className="flex items-center justify-between mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {filteredRequests.filter(r => r.status === "PENDING").length}
                  </div>
                  <p className="text-xs text-gray-600">대기중</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {filteredRequests.filter(r => r.status === "CONTACTED").length}
                  </div>
                  <p className="text-xs text-gray-600">연락완료</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {filteredRequests.filter(r => r.status === "APPROVED").length}
                  </div>
                  <p className="text-xs text-gray-600">승인</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {filteredRequests.filter(r => r.status === "REJECTED").length}
                  </div>
                  <p className="text-xs text-gray-600">거절</p>
                </CardContent>
              </Card>
            </div>
              <div className="text-sm text-gray-600 ml-4">
                총 {filteredRequests.length}건 (전체 {adoptionRequests.length}건)
              </div>
            </div>

            <div className="grid gap-4">
              {filteredRequests.length > 0 ? (
                filteredRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-3">
                            <h3 className="font-semibold">{request.petName} ({request.petBreed}) 입양신청</h3>
                            <div className="flex items-center space-x-2">
                              <Badge className={getStatusColor(request.status)}>
                                {request.status === "PENDING" ? "대기중" : 
                                 request.status === "CONTACTED" ? "연락완료" : 
                                 request.status === "APPROVED" ? "승인" : "거절"}
                              </Badge>
                              {request.status === "PENDING" && isUrgent(request.createdAt) && (
                                <Badge className="bg-red-100 text-red-800 animate-pulse">
                                  긴급
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">신청자: {request.applicantName}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">연락처: {request.contactNumber}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">이메일: {request.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span className="text-sm">회원 ID: {request.userId}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 mb-4">{request.message}</p>
                          <p className="text-xs text-gray-500">
                            신청일: {new Date(request.createdAt).toLocaleDateString()}
                            {request.status === "PENDING" && (
                              <span className="ml-2 text-red-600">
                                ({Math.floor((new Date().getTime() - new Date(request.createdAt).getTime()) / (1000 * 60 * 60))}시간 경과)
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateAdoptionRequestStatus(request.id, "CONTACTED")}
                            disabled={request.status === "CONTACTED"}
                          >
                            <Phone className="h-4 w-4 mr-1" />
                            연락완료
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateAdoptionRequestStatus(request.id, "APPROVED")}
                            disabled={request.status === "APPROVED"}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            승인
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateAdoptionRequestStatus(request.id, "REJECTED")}
                            disabled={request.status === "REJECTED"}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            거절
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="p-6 text-center text-gray-500">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <Heart className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {adoptionRequests.length === 0 ? "입양신청이 없습니다" : "검색 결과가 없습니다"}
                      </h3>
                      <p className="text-gray-500">
                        {adoptionRequests.length === 0 
                          ? "아직 입양신청이 접수되지 않았습니다." 
                          : "검색 조건을 변경해보세요."}
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl font-bold">주문 내역 관리</h2>

            <div className="grid gap-4">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <Card key={order.orderId}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-3">
                            <h3 className="font-semibold">주문 #{order.orderId}</h3>
                            <Badge 
                              className={
                                order.paymentStatus === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : order.paymentStatus === "PENDING"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-red-100 text-red-800"
                              }
                            >
                              {order.paymentStatus === "COMPLETED" ? "완료" : 
                               order.paymentStatus === "PENDING" ? "대기중" : "취소됨"}
                            </Badge>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <p className="text-sm text-gray-600">사용자 ID: {order.userId}</p>
                            <p className="text-sm text-gray-600">총 금액: {order.totalPrice.toLocaleString()}원</p>
                            <p className="text-sm text-gray-600">
                              주문일: {order.orderedAt ? 
                                (() => {
                                  try {
                                    return new Date(order.orderedAt).toLocaleDateString()
                                  } catch {
                                    return "날짜 없음"
                                  }
                                })() 
                                : "날짜 없음"
                              }
                            </p>
                          </div>

                          {/* 주문 상품 목록 */}
                          {order.orderItems && order.orderItems.length > 0 ? (
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">주문 상품:</h4>
                              {order.orderItems.map((item) => {
                                console.log('주문 아이템:', item);
                                console.log('주문 아이템의 ImageUrl:', item.ImageUrl);
                                
                                return (
                                  <div key={item.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                                    <img
                                      src={item.ImageUrl || "/placeholder.svg"}
                                      alt={item.productName || "상품"}
                                      className="w-8 h-8 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{item.productName || "상품명 없음"}</p>
                                      <p className="text-xs text-gray-500">
                                        상품 ID: {item.productId || "N/A"} | {(item.price || 0).toLocaleString()}원 × {item.quantity || 1}개
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              상품 정보가 없습니다.
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateOrderStatus(order.orderId, "PENDING")}
                            disabled={order.paymentStatus === "PENDING"}
                          >
                            대기중
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateOrderStatus(order.orderId, "COMPLETED")}
                            disabled={order.paymentStatus === "COMPLETED"}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            승인
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateOrderStatus(order.orderId, "CANCELLED")}
                            disabled={order.paymentStatus === "CANCELLED"}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            거절
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="p-6 text-center text-gray-500">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">주문 내역이 없습니다</h3>
                      <p className="text-gray-500">아직 주문이 없습니다.</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* 수정 모달 */}
      <AnimalEditModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        selectedPet={selectedPetForEdit}
        onUpdatePet={handleUpdatePet}
      />
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"

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
  onEditProduct: (product: Product) => void
  onDeleteProduct: (productId: number) => void
  onUpdateOrderStatus: (orderId: number, status: "PENDING" | "COMPLETED" | "CANCELLED") => void
  isAdmin: boolean
  onAdminLogout: () => void // New prop for admin logout
}

export default function AdminPage({
  onClose,
  products: initialProducts,
  pets,
  communityPosts,
  adoptionInquiries,
  comments,
  onNavigateToStoreRegistration,
  onNavigateToAnimalRegistration,
  onNavigateToCommunity,
  onUpdateInquiryStatus,
  onDeleteComment,
  onDeletePost,
  onEditProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  isAdmin,
  onAdminLogout, // Destructure new prop
}: AdminPageProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

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
            <TabsTrigger value="inquiries">입양문의</TabsTrigger>
            <TabsTrigger value="orders">주문내역</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <CardTitle className="text-sm font-medium">입양 문의</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{adoptionInquiries.length}</div>
                  <p className="text-xs text-muted-foreground">총 문의 건수</p>
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
              {pets.map((pet) => (
                <Card key={pet.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <img
                          src={pet.images[0] || "/placeholder.svg"}
                          alt={pet.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold">{pet.name}</h3>
                          <p className="text-sm text-gray-600">
                            {pet.breed} • {pet.age} • {pet.gender}
                          </p>
                          <p className="text-sm text-gray-500">{pet.location}</p>
                          <Badge className={getStatusColor(pet.adoptionStatus)}>
                            {pet.adoptionStatus === "available"
                              ? "입양가능"
                              : pet.adoptionStatus === "pending"
                                ? "입양대기"
                                : "입양완료"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Inquiries Tab */}
          <TabsContent value="inquiries" className="space-y-6">
            <h2 className="text-2xl font-bold">입양 문의 연락</h2>

            <div className="grid gap-4">
              {adoptionInquiries.map((inquiry) => (
                <Card key={inquiry.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <h3 className="font-semibold">{inquiry.petName} 입양 문의</h3>
                          <Badge className={getStatusColor(inquiry.status)}>{inquiry.status}</Badge>
                        </div>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{inquiry.inquirerName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{inquiry.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="text-sm">{inquiry.email}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{inquiry.message}</p>
                        <p className="text-xs text-gray-500">문의일: {inquiry.date}</p>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateInquiryStatus(inquiry.id, "연락완료")}
                          disabled={inquiry.status === "연락완료"}
                        >
                          <Phone className="h-4 w-4 mr-1" />
                          연락완료
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateInquiryStatus(inquiry.id, "승인")}
                          disabled={inquiry.status === "승인"}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          승인
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateInquiryStatus(inquiry.id, "거절")}
                          disabled={inquiry.status === "거절"}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          거절
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
    </div>
  )
}

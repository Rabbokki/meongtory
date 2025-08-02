"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Search, Store, BookOpen, User, ShoppingCart } from "lucide-react"
import LoginModal from "./login-modal"
import SignupModal from "./signup-modal"
import PasswordRecoveryModal from "./password-recovery-modal"
import MyPage from "./my-page" // Import the new MyPage component

import AdoptionPage from "./adoption-page"
import AdoptionDetailPage from "./adoption-detail-page"
import StorePage from "./store-page"
import StoreProductDetailPage from "./store-product-detail-page"
import StoreProductRegistrationPage from "./store-product-registration-page"
import StoreProductEditPage from "./store-product-edit-page"
import PetInsurancePage from "./pet-insurance-page"
import InsuranceDetailPage from "./insurance-detail-page"
import GrowthDiaryPage from "./growth-diary-page"
import DiaryEntryDetail from "./diary-entry-detail"
import CommunityPage from "./community-page"
import CommunityDetailPage from "./community-detail-page"
import CommunityWritePage from "./community-write-page"
import DogResearchLabPage from "./dog-research-lab-page"
import AnimalRegistrationPage from "./animal-registration-page"
import CartPage from "./cart-page"
import Chatbot from "./chatbot"
import AdminPage from "./admin-page"
import PetNamingService from "./pet-naming-service"
import InsuranceFavoritesPage from "./insurance-favorites-page"
import GrowthDiaryWritePage from "./growth-diary-write-page" // New import

// Types
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
  ownerEmail?: string // Added for MyPage filtering
}

interface Product {
  id: number
  name: string
  brand: string
  price: number
  image: string
  category: string
  description: string
  tags: string[]
  stock: number
  petType?: "dog" | "cat" | "all"; // Add petType to Product interface
  registrationDate: string
  registeredBy: string
}

interface WishlistItem {
  id: number
  name: string
  brand: string
  price: number
  image: string
  category: string
}

interface CartItem {
  id: number
  name: string
  brand: string
  price: number
  image: string
  category: string
  quantity: number
  order: number // 순서 고정을 위한 필드
}

interface Insurance {
  id: number
  company: string
  planName: string
  monthlyPremium: number
  coverage: string[]
  deductible: number
  maxPayout: number
  ageLimit: string
  description: string
  rating: number
  isPopular?: boolean
}

interface DiaryEntry {
  id: number
  petName: string
  date: string
  title: string
  content: string
  images: string[]
  milestones: string[]
  tags?: string[] // Added tags to the interface
  weight?: number
  height?: number
  mood: string
  activities: string[]
  ownerEmail?: string // Added for filtering
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
  ownerEmail?: string; // Add ownerEmail to CommunityPost interface
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

interface Order {
  orderId: number
  userId: number
  totalPrice: number
  paymentStatus: "PENDING" | "COMPLETED" | "CANCELLED"
  orderedAt: string
}

// Navigation Header Component
function NavigationHeader({
  currentPage,
  onNavigate,
  isLoggedIn,
  isAdmin,
  onLogin,
  onLogout,
  onNavigateToMyPage, // New prop for MyPage
}: {
  currentPage: string
  onNavigate: (page: string) => void
  isLoggedIn: boolean
  isAdmin: boolean
  onLogin: () => void
  onLogout: () => void
  onNavigateToMyPage: () => void // New prop
}) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => onNavigate("home")} className="flex items-center space-x-2">
            <Image src="/KakaoTalk_20250729_160046076.png" alt="멍토리 로고" width={100} height={40} className="h-auto" />
          </button>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onNavigate("adoption")}
              className={`text-sm font-medium transition-colors ${
                currentPage === "adoption" ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
              }`}
            >
              입양
            </button>
            <button
              onClick={() => onNavigate("insurance")}
              className={`text-sm font-medium transition-colors ${
                currentPage === "insurance" ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
              }`}
            >
              펫보험
            </button>
            <button
              onClick={() => onNavigate("diary")}
              className={`text-sm font-medium transition-colors ${
                currentPage === "diary" ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
              }`}
            >
              성장일기
            </button>
            <button
              onClick={() => onNavigate("community")}
              className={`text-sm font-medium transition-colors ${
                currentPage === "community" ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
              }`}
            >
              커뮤니티
            </button>
            <button
              onClick={() => onNavigate("store")}
              className={`text-sm font-medium transition-colors ${
                currentPage === "store" ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
              }`}
            >
              스토어
            </button>
            <button
              onClick={() => onNavigate("research")}
              className={`text-sm font-medium transition-colors ${
                currentPage === "research" ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
              }`}
            >
              강아지 연구소
            </button>
            {isLoggedIn && ( // Only show MyPage if logged in
              <button
                onClick={onNavigateToMyPage}
                className={`text-sm font-medium transition-colors ${
                  currentPage === "myPage" ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
                }`}
              >
                마이페이지
              </button>
            )}
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <>
                {/* 관리자 페이지 버튼 제거됨 */}
                <Button onClick={onLogout} variant="outline" size="sm" className="text-sm bg-transparent">
                  로그아웃
                </Button>
              </>
            ) : (
              <Button onClick={onLogin} variant="outline" size="sm" className="text-sm bg-transparent">
                <User className="w-4 h-4 mr-1" />
                로그인
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default function PetServiceWebsite() {
  // State management
  const [currentPage, setCurrentPage] = useState("home")
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUser, setCurrentUser] = useState<{ id: number; email: string; name: string } | null>(null)
  const [oauthMessage, setOauthMessage] = useState<string | null>(null)

  // OAuth 콜백 처리
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get("success")
    const error = urlParams.get("error")

    if (success) {
      setOauthMessage(`OAuth 로그인 성공: ${success}`)
      setIsLoggedIn(true)
      setCurrentUser({ id: 1, email: "oauth@example.com", name: "OAuth 사용자" })
      // URL에서 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (error) {
      setOauthMessage(`OAuth 로그인 실패: ${error}`)
      // URL에서 파라미터 제거
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [selectedProductForEdit, setSelectedProductForEdit] = useState<Product | null>(null)
  const [selectedInsurance, setSelectedInsurance] = useState<Insurance | null>(null)
  const [selectedDiaryEntry, setSelectedDiaryEntry] = useState<DiaryEntry | null>(null)
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null)
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [favoriteInsurance, setFavoriteInsurance] = useState<number[]>([])

  // Sample data
  const [pets, setPets] = useState<Pet[]>([
    {
      id: 1,
      name: "초코",
      breed: "골든 리트리버",
      age: "2년",
      gender: "수컷",
      size: "대형",
      personality: ["온순함", "활발함", "사람을 좋아함"],
      healthStatus: "건강함",
      description: "매우 온순하고 사람을 좋아하는 골든 리트리버입니다. 아이들과도 잘 어울리며, 산책을 좋아합니다.",
      images: ["/placeholder.svg?height=400&width=600"],
      location: "서울시 강남구",
      contact: "010-1234-5678",
      adoptionFee: 200000,
      isNeutered: true,
      isVaccinated: true,
      dateRegistered: "2024-01-15",
      adoptionStatus: "available",
      ownerEmail: "user@test.com", // Assign to a user
    },
    {
      id: 2,
      name: "메리",
      breed: "푸들",
      age: "1년",
      gender: "암컷",
      size: "소형",
      personality: ["애교 많음", "장난기 많음"],
      healthStatus: "건강함",
      description: "활발하고 애교 많은 푸들입니다. 작은 체구로 실내 생활에 적합합니다.",
      images: ["/placeholder.svg?height=400&width=600"],
      location: "경기도 성남시",
      contact: "010-1111-2222",
      adoptionFee: 150000,
      isNeutered: true,
      isVaccinated: true,
      dateRegistered: "2024-02-01",
      adoptionStatus: "available",
      ownerEmail: "user@test.com", // Assign to a user
    },
  ])

  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "프리미엄 강아지 사료 (성견용)",
      brand: "로얄캐닌",
      price: 45000,
      image: "/placeholder.svg?height=300&width=300",
      category: "사료",
      description: "성견을 위한 프리미엄 사료입니다.",
      tags: ["프리미엄", "성견용", "영양균형"],
      stock: 50,
      registrationDate: "2024-01-10",
      registeredBy: "admin",
    },
    {
      id: 2,
      name: "고양이 장난감 세트",
      brand: "캣토이",
      price: 25000,
      image: "/placeholder.svg?height=300&width=300",
      category: "장난감",
      description: "다양한 고양이 장난감으로 구성된 세트입니다.",
      tags: ["고양이", "장난감", "세트"],
      stock: 100,
      registrationDate: "2024-02-01",
      registeredBy: "admin",
    },
  ])

  const [insurances, setInsurances] = useState<Insurance[]>([
    {
      id: 1,
      company: "펫퍼스트",
      planName: "기본 플랜",
      monthlyPremium: 35000,
      coverage: ["질병치료", "상해치료", "수술비"],
      deductible: 20000,
      maxPayout: 3000000,
      ageLimit: "만 8세 이하",
      description: "기본적인 질병과 상해를 보장하는 플랜입니다.",
      rating: 4.2,
      isPopular: true,
    },
  ])

  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([])

  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([
    {
      id: 1,
      title: "강아지 훈련 방법 문의",
      content: "우리 강아지가 짖는 버릇이 있는데 어떻게 훈련시켜야 할까요?",
      author: "펫러버123",
      date: "2024-01-20",
      category: "훈련",
      boardType: "자유게시판", // Changed to 자유게시판
      views: 45,
      likes: 12,
      comments: 8,
      tags: ["훈련", "짖음", "행동교정"],
    },
    {
      id: 2,
      title: "고양이와 행복한 하루",
      content: "오늘 우리 고양이랑 놀아줬는데 너무 귀여워요! 사진 공유합니다.",
      author: "냥집사",
      date: "2024-02-10",
      category: "일상",
      boardType: "자유게시판",
      views: 120,
      likes: 30,
      comments: 15,
      tags: ["고양이", "일상", "사진"],
    },
  ])

  const [adoptionInquiries, setAdoptionInquiries] = useState<AdoptionInquiry[]>([
    {
      id: 1,
      petId: 1,
      petName: "초코",
      inquirerName: "김철수",
      phone: "010-9876-5432",
      email: "user@test.com", // Assign to a user
      message: "초코를 입양하고 싶습니다. 아이들과 함께 살고 있는데 괜찮을까요?",
      status: "대기중",
      date: "2024-01-21",
    },
    {
      id: 2,
      petId: 2,
      petName: "메리",
      inquirerName: "박영희",
      phone: "010-5555-6666",
      email: "user@test.com", // Assign to a user
      message: "메리 입양에 관심 있습니다. 방문 상담 가능할까요?",
      status: "연락완료",
      date: "2024-02-05",
    },
  ])

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      postId: 1,
      postTitle: "강아지 훈련 방법 문의",
      author: "훈련전문가",
      content: "긍정적 강화 훈련을 추천드립니다. 짖을 때마다 무시하고, 조용할 때 보상을 주세요.",
      date: "2024-01-20",
      isReported: false,
    },
  ])

  const [orders, setOrders] = useState<OrderItem[]>([])

  // Event handlers
  const handleLogin = (email: string, password: string) => {
    setIsLoggedIn(true)
    
    // 이메일 기반으로 사용자 ID 생성 (간단한 해시 함수)
    const userId = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000 + 1
    setCurrentUser({ id: userId, email, name: email.split("@")[0] })

    // 관리자 계정 확인 (admin 또는 admin@test.com)
    if (email === "admin" || email === "admin@test.com") {
      setIsAdmin(true)
      console.log("관리자로 로그인됨:", email, "사용자 ID:", userId)
      setCurrentPage("admin") // 관리자로 로그인 시 관리자 페이지로 자동 이동
    } else {
      setIsAdmin(false)
      console.log("일반 사용자로 로그인됨:", email, "사용자 ID:", userId)
      setCurrentPage("home") // 일반 사용자 로그인 시 홈으로 이동 (또는 현재 페이지 유지)
    }

    setShowLoginModal(false)
  }

  const handleSignup = (userData: any) => {
    console.log("회원가입 데이터:", userData)
    // 회원가입 후 자동 로그인
    setIsLoggedIn(true)
    
    // 이메일 기반으로 사용자 ID 생성
    const userId = userData.email.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 1000 + 1
    setCurrentUser({ id: userId, email: userData.email, name: userData.name })
    // Optionally add pet data to pets state if it's a new pet for the user
    if (userData.petType && userData.petAge && userData.petBreed) {
      const newPet: Pet = {
        id: pets.length + 1,
        name: `${userData.name}'s Pet`, // Placeholder name
        breed: userData.petBreed,
        age: userData.petAge,
        gender: "미상", // Default
        size: "미상", // Default
        personality: [],
        healthStatus: "건강함",
        description: "사용자가 등록한 펫",
        images: ["/placeholder.svg?height=400&width=600"],
        location: "사용자 거주지",
        contact: "사용자 연락처",
        adoptionFee: 0,
        isNeutered: false,
        isVaccinated: false,
        dateRegistered: new Date().toISOString().split("T")[0],
        adoptionStatus: "available" as const, // Not for adoption, just for user info
        ownerEmail: userData.email,
      }
      setPets((prev) => [...prev, newPet])
    }
    setShowSignupModal(false)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setIsAdmin(false)
    setCurrentUser(null)
    setCurrentPage("home")
  }

  const handleAddToWishlist = (item: WishlistItem) => {
    setWishlist((prev) => {
      const exists = prev.find((w) => w.id === item.id)
      if (exists) {
        return prev.filter((w) => w.id !== item.id)
      } else {
        return [...prev, item]
      }
    })
  }

  const isInWishlist = (id: number) => {
    return wishlist.some((item) => item.id === id)
  }

  const handleAddToCart = async (product: Product) => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다.")
      return
    }
    
    console.log('장바구니 추가 시작:', product)
    console.log('Product ID:', product.id)
    console.log('Product 전체 객체:', JSON.stringify(product, null, 2))
    
    if (!product.id) {
      alert('상품 ID가 없습니다.')
      return
    }
    
    try {
      const currentUserId = currentUser?.id || 1
      const url = `/api/carts?userId=${currentUserId}&productId=${product.id}&quantity=1`
      console.log('요청 URL:', url)
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      })
      
      console.log('응답 상태:', response.status)
      console.log('응답 헤더:', response.headers)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('응답 에러:', errorText)
        throw new Error(`장바구니 추가에 실패했습니다. (${response.status})`)
      }
      
      const result = await response.json()
      console.log('장바구니 추가 성공:', result)
      
      alert(`${product.name}을(를) 장바구니에 추가했습니다.`)
      // 장바구니 목록 새로고침
      fetchCartItems()
      // 장바구니 페이지로 이동
      setCurrentPage("cart")
    } catch (error) {
      console.error('장바구니 추가 오류:', error)
      alert('장바구니 추가에 실패했습니다: ' + (error as Error).message)
    }
  }

  const isInCart = (id: number) => {
    return cart.some((item) => item.id === id)
  }

  // 장바구니 목록 조회
  const fetchCartItems = async () => {
    if (!isLoggedIn) return
    
    console.log('장바구니 조회 시작')
    console.log('현재 사용자:', currentUser)
    
    // 현재 로그인한 사용자의 ID (임시로 1 사용, 실제로는 currentUser.id 사용)
    const currentUserId = currentUser?.id || 1
    
    try {
      const response = await fetch(`/api/carts/${currentUserId}`)
      console.log('장바구니 조회 응답 상태:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('장바구니 조회 에러:', errorText)
        throw new Error('장바구니 조회에 실패했습니다.')
      }
      
      const cartData = await response.json()
      console.log('장바구니 데이터:', cartData)
      
      // 백엔드 응답을 프론트엔드 형식으로 변환 (cartId로 정렬하여 추가 순서 유지)
      const cartItems: CartItem[] = cartData
        .sort((a: any, b: any) => a.cartId - b.cartId) // cartId로 정렬하여 추가 순서 유지
        .map((item: any, index: number) => ({
          id: item.cartId,
          name: item.product.name,
          brand: item.product.brand || "브랜드 없음",
          price: item.product.price,
          image: item.product.imageUrl || "/placeholder.svg",
          category: item.product.category,
          quantity: item.quantity,
          order: index // 순서 고정을 위한 인덱스 추가
        }))
      
      console.log('변환된 장바구니 아이템:', cartItems)
      setCart(cartItems)
    } catch (error) {
      console.error('장바구니 조회 오류:', error)
    }
  }

  // 장바구니에서 상품 삭제
  const handleRemoveFromCart = async (cartId: number) => {
    try {
      const response = await fetch(`/api/carts/${cartId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('장바구니에서 삭제에 실패했습니다.')
      }
      
      // 장바구니 목록 새로고침
      fetchCartItems()
    } catch (error) {
      console.error('장바구니 삭제 오류:', error)
      alert('장바구니에서 삭제에 실패했습니다.')
    }
  }

  // 장바구니 수량 업데이트
  const handleUpdateCartQuantity = async (cartId: number, quantity: number) => {
    try {
      const response = await fetch(`/api/carts/${cartId}?quantity=${quantity}`, {
        method: 'PUT'
      })
      
      if (!response.ok) {
        throw new Error('수량 업데이트에 실패했습니다.')
      }
      
      // 장바구니 목록 새로고침
      fetchCartItems()
    } catch (error) {
      console.error('수량 업데이트 오류:', error)
      alert('수량 업데이트에 실패했습니다.')
    }
  }

  // 컴포넌트 마운트 시 장바구니 조회
  useEffect(() => {
    if (isLoggedIn) {
      fetchCartItems()
    }
  }, [isLoggedIn])

  // 주문 관련 함수들
  const createOrder = async (orderData: { userId: number; totalPrice: number }) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })
      
      if (!response.ok) {
        throw new Error('주문 생성에 실패했습니다.')
      }
      
      const newOrder = await response.json()
      setOrders(prev => [...prev, newOrder])
      return newOrder
    } catch (error) {
      console.error('주문 생성 오류:', error)
      throw error
    }
  }

  const purchaseAllFromCart = async () => {
    if (!isLoggedIn || !currentUser) {
      alert('로그인이 필요합니다.')
      return
    }

    try {
      const response = await fetch(`/api/orders/purchase-all/${currentUser.id}`, {
        method: 'POST'
      })
      
      if (!response.ok) {
        throw new Error('전체 구매에 실패했습니다.')
      }
      
      const newOrder = await response.json()
      setOrders(prev => [...prev, newOrder])
      
      // 장바구니 비우기
      setCart([])
      
      // 주문 목록 새로고침
      await fetchUserOrders()
      
      alert('전체 구매가 완료되었습니다!')
      setCurrentPage("myPage")
    } catch (error) {
      console.error('전체 구매 오류:', error)
      alert('전체 구매에 실패했습니다.')
    }
  }

  const fetchUserOrders = async () => {
    if (!isLoggedIn || !currentUser) return
    
    try {
      const response = await fetch(`/api/orders/user/${currentUser.id}`)
      
      if (!response.ok) {
        throw new Error('주문 조회에 실패했습니다.')
      }
      
      const userOrders = await response.json()
      console.log('백엔드에서 받은 주문 데이터:', userOrders)
      
      // 주문 데이터를 OrderItem 형태로 변환
      const orderItems: OrderItem[] = userOrders.flatMap((order: any) => {
        console.log('처리 중인 주문:', order)
        
        if (order.orderItems && order.orderItems.length > 0) {
          // 주문에 상품 정보가 있는 경우
          return order.orderItems.map((item: any) => {
            console.log('처리 중인 주문 아이템:', item)
            return {
              id: item.id || order.orderId,
              productId: item.productId || 0,
              productName: item.productName || `주문 #${order.orderId}`,
              price: item.price || order.totalPrice,
              quantity: item.quantity || 1,
              orderDate: order.orderedAt || new Date().toISOString(),
              status: order.paymentStatus === 'COMPLETED' ? 'completed' : 
                      order.paymentStatus === 'PENDING' ? 'pending' : 'cancelled',
              ImageUrl: item.ImageUrl || "/placeholder.svg"
            }
          })
        } else {
          // 주문에 상품 정보가 없는 경우 (기존 방식)
          return [{
            id: order.orderId,
            productId: 0,
            productName: `주문 #${order.orderId}`,
            price: order.totalPrice,
            quantity: 1,
            orderDate: order.orderedAt || new Date().toISOString(),
            status: order.paymentStatus === 'COMPLETED' ? 'completed' : 
                    order.paymentStatus === 'PENDING' ? 'pending' : 'cancelled',
            image: "/placeholder.svg"
          }]
        }
      })
      
      console.log('변환된 주문 아이템:', orderItems)
      
      // 최신순으로 정렬 (orderDate 기준 내림차순)
      const sortedOrderItems = orderItems.sort((a, b) => {
        const dateA = new Date(a.orderDate).getTime();
        const dateB = new Date(b.orderDate).getTime();
        return dateB - dateA; // 내림차순 (최신순)
      });
      
      console.log('정렬된 주문 아이템:', sortedOrderItems)
      setOrders(sortedOrderItems)
    } catch (error) {
      console.error('주문 조회 오류:', error)
    }
  }

  const deleteOrder = async (orderId: number) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('주문 삭제에 실패했습니다.')
      }
      
      setOrders(prev => prev.filter(order => order.id !== orderId))
      alert('주문이 삭제되었습니다.')
    } catch (error) {
      console.error('주문 삭제 오류:', error)
      alert('주문 삭제에 실패했습니다.')
    }
  }

  const updatePaymentStatus = async (orderId: number, status: "PENDING" | "COMPLETED" | "CANCELLED") => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status?status=${status}`, {
        method: 'PUT'
      })
      
      if (!response.ok) {
        throw new Error('결제 상태 업데이트에 실패했습니다.')
      }
      
      const updatedOrder = await response.json()
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: status === "COMPLETED" ? "completed" : status === "PENDING" ? "pending" : "cancelled" }
          : order
      ))
    } catch (error) {
      console.error('결제 상태 업데이트 오류:', error)
      alert('결제 상태 업데이트에 실패했습니다.')
    }
  }

  const handleAddPet = (petData: any) => {
    const newPet: Pet = {
      id: pets.length + 1,
      ...petData,
      dateRegistered: new Date().toISOString().split("T")[0],
      adoptionStatus: "available" as const,
    }
    setPets((prev) => [...prev, newPet])
    setCurrentPage("adoption")
  }

  const handleAddProduct = (productData: any) => {
    const newProduct: Product = {
      id: products.length + 1,
      ...productData,
      registrationDate: new Date().toISOString().split("T")[0],
      registeredBy: currentUser?.email || "admin",
      petType: productData.petType || "all", // Assign petType for new products
    }
    setProducts((prev) => [...prev, newProduct])
    setCurrentPage("store")
  }

  const handleViewProduct = (product: Product) => {
    setSelectedProductId(product.id)
    setCurrentPage("product-detail")
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProductForEdit(product)
    setCurrentPage("product-edit")
  }

  const handleSaveProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p))
  }

  const addToInsuranceFavorites = (id: number) => {
    setFavoriteInsurance((prev) => {
      if (prev.includes(id)) return prev
      return [...prev, id]
    })
  }

  const removeFromInsuranceFavorites = (id: number) => {
    setFavoriteInsurance((prev) => prev.filter((itemId) => itemId !== id))
  }

  const handleUpdateDiaryEntry = (updatedEntry: DiaryEntry) => {
    setDiaryEntries((prev) =>
      prev.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry)),
    )
    setSelectedDiaryEntry(updatedEntry) // Update the selected entry to reflect changes immediately
  }

  const handleDeleteDiaryEntry = (entryId: number) => {
    setDiaryEntries((prev) => prev.filter((entry) => entry.id !== entryId))
    setSelectedDiaryEntry(null) // Close detail view after deletion
  }

  const handleDeleteCommunityPost = (postId: number) => {
    setCommunityPosts((prev) => prev.filter((post) => post.id !== postId));
    setSelectedPost(null); // Close detail view after deletion
  }

  // 바로구매 함수
  const handleBuyNow = async (product: Product) => {
    if (!isLoggedIn || !currentUser) {
      alert('로그인이 필요합니다.')
      return
    }

    try {
      // 바로구매를 위한 주문 생성
      const orderData = {
        userId: currentUser.id,
        totalPrice: product.price,
        orderItems: [{
          productId: product.id,
          productName: product.name || product.brand + " " + product.category,
          productImage: product.image || "/placeholder.svg",
          quantity: 1,
          price: product.price
        }]
      }
      
      console.log('바로구매 주문 데이터:', orderData);
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      })
      
      if (!response.ok) {
        throw new Error('주문 생성에 실패했습니다.')
      }
      
      const newOrder = await response.json()
      
      // 주문 목록 새로고침
      await fetchUserOrders()
      
      alert('바로구매가 완료되었습니다!')
      setCurrentPage("myPage")
    } catch (error) {
      console.error('바로구매 오류:', error)
      alert('바로구매에 실패했습니다.')
    }
  }

  // Render current page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case "adoption":
        if (selectedPet) {
          return (
            <AdoptionDetailPage
              pet={selectedPet}
              onBack={() => setSelectedPet(null)}
              onAdopt={(petId, inquiryData) => {
                const newInquiry: AdoptionInquiry = {
                  id: adoptionInquiries.length + 1,
                  petId,
                  petName: selectedPet.name,
                  ...inquiryData,
                  status: "대기중",
                  date: new Date().toISOString().split("T")[0],
                }
                setAdoptionInquiries((prev) => [...prev, newInquiry])
              }}
              isLoggedIn={isLoggedIn}
              onShowLogin={() => setShowLoginModal(true)}
            />
          )
        }
        return (
          <AdoptionPage
            pets={pets}
            onViewPet={setSelectedPet}
            onClose={() => setCurrentPage("home")}
            isAdmin={isAdmin}
            isLoggedIn={isLoggedIn}
            onNavigateToAnimalRegistration={() => setCurrentPage("animalRegistration")}
          />
        )

      case "animalRegistration":
        return (
          <AnimalRegistrationPage
            onClose={() => setCurrentPage("admin")}
            onAddPet={handleAddPet}
            isAdmin={isAdmin}
            currentUserId={isLoggedIn ? "user123" : undefined}
          />
        )

      case "store":
        return (
          <StorePage
            onClose={() => setCurrentPage("home")}
            onAddToWishlist={handleAddToWishlist}
            isInWishlist={isInWishlist}
            isAdmin={isAdmin}
            isLoggedIn={isLoggedIn}
            onNavigateToStoreRegistration={() => setCurrentPage("storeRegistration")}
            products={products}
            onViewProduct={handleViewProduct}
          />
        )

      case "product-detail":
        return (
          <StoreProductDetailPage
            productId={selectedProductId!}
            onBack={() => {
              setSelectedProductId(null)
              setCurrentPage("store")
            }}
            onAddToWishlist={handleAddToWishlist}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            isInWishlist={isInWishlist}
            isInCart={isInCart}
          />
        )

      case "product-edit":
        return (
          <StoreProductEditPage
            productId={selectedProductForEdit!.id}
            onBack={() => {
              setSelectedProductForEdit(null)
              setCurrentPage("admin")
            }}
            onSave={handleSaveProduct}
          />
        )

      case "storeRegistration":
        return (
          <StoreProductRegistrationPage
            onBack={() => setCurrentPage("admin")}
            onAddProduct={handleAddProduct}
            isAdmin={isAdmin}
            currentUserId={isLoggedIn ? "user123" : undefined}
            products={products}
          />
        )

      case "insurance":
        if (selectedInsurance) {
          return <InsuranceDetailPage insurance={selectedInsurance} onBack={() => setSelectedInsurance(null)} />
        }
        return (
          <PetInsurancePage
            favoriteInsurance={favoriteInsurance}
            onAddToFavorites={addToInsuranceFavorites}
            onRemoveFromFavorites={removeFromInsuranceFavorites}
            onViewDetails={(insurance) => setSelectedInsurance(insurance)}
          />
        )

      case "insuranceFavorites":
        return (
          <InsuranceFavoritesPage
            favoriteInsurance={favoriteInsurance}
            onRemoveFromFavorites={removeFromInsuranceFavorites}
            onNavigateToInsurance={() => setCurrentPage("insurance")}
            onViewDetails={(insurance) => setSelectedInsurance(insurance)}
          />
        )

      case "diary":
        if (selectedDiaryEntry) {
          return (
            <DiaryEntryDetail
              entry={selectedDiaryEntry}
              onBack={() => setSelectedDiaryEntry(null)}
              onUpdate={handleUpdateDiaryEntry}
              onDelete={handleDeleteDiaryEntry}
              currentUserEmail={currentUser?.email} // Pass current user email
            />
          )
        }
        return (
          <GrowthDiaryPage
            entries={diaryEntries.filter(entry => entry.ownerEmail === currentUser?.email)}
            onViewEntry={setSelectedDiaryEntry}
            onClose={() => setCurrentPage("home")}
            onAddEntry={(entryData) => {
              const newEntry: DiaryEntry = {
                id: diaryEntries.length + 1,
                ...entryData,
                date: new Date().toISOString().split("T")[0],
                ownerEmail: currentUser?.email, // 작성자 이메일 추가
              }
              setDiaryEntries((prev) => [...prev, newEntry])
            }}
            isLoggedIn={isLoggedIn}
            currentUserId={currentUser?.email}
            onNavigateToWrite={() => setCurrentPage("growthDiaryWrite")}
          />
        )

      case "growthDiaryWrite": // New case for writing a diary entry
        return (
          <GrowthDiaryWritePage
            onBack={() => setCurrentPage("diary")}
            onSubmit={(entryData) => {
              const newEntry: DiaryEntry = {
                id: diaryEntries.length + 1,
                ...entryData,
                date: new Date().toISOString().split("T")[0],
                ownerEmail: currentUser?.email, // 작성자 이메일 추가
              }
              setDiaryEntries((prev) => [...prev, newEntry])
              setCurrentPage("diary")
            }}
          />
        )

      case "community":
        if (selectedPost) {
          return (
            <CommunityDetailPage
              post={selectedPost}
              onBack={() => setSelectedPost(null)}
              isLoggedIn={isLoggedIn}
              onShowLogin={() => setShowLoginModal(true)}
              onUpdatePost={(updatedPost) => {
                setCommunityPosts((prev) => prev.map((post) => (post.id === updatedPost.id ? updatedPost : post)))
                setSelectedPost(updatedPost)
              }}
              onDeletePost={handleDeleteCommunityPost} // Pass the delete handler
              currentUserEmail={currentUser?.email} // Pass current user email
            />
          )
        }
        return (
          <CommunityPage
            posts={communityPosts}
            onViewPost={setSelectedPost}
            onClose={() => setCurrentPage("home")}
            onNavigateToWrite={() => setCurrentPage("communityWrite")}
            isLoggedIn={isLoggedIn}
            onShowLogin={() => setShowLoginModal(true)}
            onUpdatePosts={setCommunityPosts}
          />
        )

      case "communityWrite":
        return (
          <CommunityWritePage
            onBack={() => setCurrentPage("community")}
            onSubmit={(postData) => {
              const newPost: CommunityPost = {
                id: communityPosts.length + 1,
                title: postData.title,
                content: postData.content,
                author: currentUser?.name || "현재사용자",
                date: new Date().toISOString().split("T")[0],
                category: "일반",
                boardType: postData.type,
                views: 0,
                likes: 0,
                comments: 0,
                tags: [],
                ownerEmail: currentUser?.email, // Assign owner email
              }
              setCommunityPosts((prev) => [newPost, ...prev])
              setCurrentPage("community")
            }}
          />
        )

      case "research":
        return <DogResearchLabPage onClose={() => setCurrentPage("home")} />

      case "cart":
        if (!isLoggedIn) {
          return (
            <div className="min-h-screen bg-gray-50 pt-20">
              <div className="container mx-auto px-4 py-8">
                <div className="max-w-md mx-auto text-center">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingCart className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">로그인이 필요합니다</h3>
                  <p className="text-gray-600 mb-6">장바구니를 이용하려면 로그인해주세요.</p>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => setShowLoginModal(true)} 
                      className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
                    >
                      로그인하기
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentPage("home")}
                      className="w-full"
                    >
                      홈으로 돌아가기
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        }
        return (
          <CartPage
            cartItems={cart}
            onRemoveFromCart={handleRemoveFromCart}
            onNavigateToStore={() => setCurrentPage("store")}
            onPurchase={purchaseAllFromCart}
            onUpdateQuantity={handleUpdateCartQuantity}
          />
        )

      case "naming":
        return <PetNamingService onClose={() => setCurrentPage("home")} />

      case "admin":
        return (
          <AdminPage
            onClose={() => setCurrentPage("home")}
            products={products}
            pets={pets}
            communityPosts={communityPosts}
            adoptionInquiries={adoptionInquiries}
            comments={comments}
            onNavigateToStoreRegistration={() => setCurrentPage("storeRegistration")}
            onNavigateToAnimalRegistration={() => setCurrentPage("animalRegistration")}
            onNavigateToCommunity={() => setCurrentPage("community")}
            onUpdateInquiryStatus={(id, status) => {
              setAdoptionInquiries((prev) =>
                prev.map((inquiry) => (inquiry.id === id ? { ...inquiry, status } : inquiry)),
              )
            }}
            onDeleteComment={(id) => {
              setComments((prev) => prev.filter((comment) => comment.id !== id))
            }}
            onDeletePost={(id) => {
              setCommunityPosts((prev) => prev.filter((post) => post.id !== id))
            }}
            onEditProduct={handleEditProduct}
            onDeleteProduct={(productId) => {
              setProducts((prev) => prev.filter((product) => product.id !== productId));
            }}
            onUpdateOrderStatus={updatePaymentStatus}
            isAdmin={isAdmin}
            onAdminLogout={handleLogout} // Pass the logout handler
          />
        )

      case "myPage":
        return (
          <MyPage
            currentUser={currentUser}
            userPets={pets.filter((pet) => pet.ownerEmail === currentUser?.email)} // Filter pets by logged-in user
            userAdoptionInquiries={adoptionInquiries.filter((inquiry) => inquiry.email === currentUser?.email)} // Filter inquiries by logged-in user
            userOrders={orders} // Pass filtered orders for current user
            onClose={() => setCurrentPage("home")}
          />
        )

      default:
        return (
          <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-yellow-50 to-orange-50 py-20">
              <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                      펫보험 추천으로
                      <br />더 편한
                      <br />
                      반려 라이프를 즐기세요
                    </h1>
                    <p className="text-xl text-gray-600">우리 아이의 시간을 더 행복하게, 반려인의 삶을 더 편하게</p>
                  </div>
                  <div className="relative">
                    <div className="relative z-10">
                      <Image
                        src="/placeholder.svg?height=400&width=600&text=Pet+service+interface+mockup"
                        alt="Pet service interface mockup"
                        width={600}
                        height={400}
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-yellow-200 rounded-full opacity-50"></div>
                    <div className="absolute -top-10 -left-10 w-24 h-24 bg-orange-200 rounded-full opacity-30"></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Services Section */}
            <section className="py-20 bg-gray-50">
              <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-8 justify-center">
                  {/* 입양 Card */}
                  <Card className="relative overflow-hidden bg-white shadow-lg hover:shadow-xl transition-shadow">
                    <div className="absolute top-4 right-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-medium transform rotate-12">
                      UPDATE
                    </div>
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-2xl font-bold text-gray-900 border-b-4 border-yellow-400 inline-block pb-2">
                        입양
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setCurrentPage("adoption")} className="text-center space-y-2 w-full">
                          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                            <Heart className="w-8 h-8 text-yellow-600 fill-yellow-600" />
                          </div>
                          <p className="text-sm font-medium">보호소 입양</p>
                        </button>
                        <button onClick={() => setCurrentPage("naming")} className="text-center space-y-2 w-full">
                          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                            <BookOpen className="w-8 h-8 text-yellow-600" />
                          </div>
                          <p className="text-sm font-medium">이름 짓기</p>
                        </button>
                        {isAdmin && isLoggedIn && (
                          <button
                            onClick={() => setCurrentPage("animalRegistration")}
                            className="text-center space-y-2 w-full"
                          >
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                              <Search className="w-8 h-8 text-yellow-600" />
                            </div>
                            <p className="text-sm font-medium">동물등록</p>
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* 스토어 Card */}
                  <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="text-center pb-4">
                      <CardTitle className="text-2xl font-bold text-gray-900 border-b-4 border-green-400 inline-block pb-2">
                        스토어
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setCurrentPage("store")} className="text-center space-y-2 w-full">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                            <Store className="w-8 h-8 text-green-600" />
                          </div>
                          <p className="text-sm font-medium">펫용품 쇼핑</p>
                        </button>
                        <button 
                          onClick={() => {
                            if (!isLoggedIn) {
                              alert("장바구니를 이용하려면 로그인이 필요합니다.")
                              setShowLoginModal(true)
                            } else {
                              setCurrentPage("cart")
                            }
                          }} 
                          className="text-center space-y-2 w-full"
                        >
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto relative">
                            <ShoppingCart className="w-8 h-8 text-green-600" />
                            {isLoggedIn && cart.length > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {cart.length}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium">장바구니</p>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* OAuth 메시지 표시 */}
      {oauthMessage && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            oauthMessage.includes("성공") ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {oauthMessage}
          <button onClick={() => setOauthMessage(null)} className="ml-2 text-white hover:text-gray-200">
            ×
          </button>
        </div>
      )}

      <NavigationHeader
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onLogin={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        onNavigateToMyPage={() => setCurrentPage("myPage")} // Link MyPage button
      />

      {renderCurrentPage()}

      <Chatbot />

      {/* Modals */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLogin={handleLogin}
          onSwitchToSignup={() => {
            setShowLoginModal(false)
            setShowSignupModal(true)
          }}
        />
      )}

      {showSignupModal && (
        <SignupModal
          isOpen={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          onSignup={handleSignup}
          onSwitchToLogin={() => {
            setShowSignupModal(false)
            setShowLoginModal(true)
          }}
        />
      )}

      {showPasswordRecovery && (
        <PasswordRecoveryModal
          onClose={() => setShowPasswordRecovery(false)}
          onRecover={(email) => {
            console.log("비밀번호 복구:", email)
            setShowPasswordRecovery(false)
          }}
          onSwitchToLogin={() => {
            setShowPasswordRecovery(false)
            setShowLoginModal(true)
          }}
        />
      )}
    </div>
  )
}

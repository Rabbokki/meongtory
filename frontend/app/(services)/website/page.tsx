"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Heart, Search, Store, BookOpen, User, ShoppingCart, FileText, MessageSquare } from "lucide-react"
import LoginModal from "@/components/modals/login-modal"
import SignupModal from "@/components/modals/signup-modal"
import PasswordRecoveryModal from "@/components/modals/password-recovery-modal"
import MyPage from "../../(dashboard)/my/page"
import AdoptionPage from "../../(pets)/adoption/page"
import AdoptionDetailPage from "../../(pets)/adoption/[id]/page"
import StorePage from "../../(store)/store/page"
import StoreProductDetailPage from "../../(store)/store/[id]/page"
import StoreProductRegistrationPage from "../../(store)/store/register/page"
import StoreProductEditPage from "../../(store)/store/edit/page"
import PetInsurancePage from "../insurance/page"
import InsuranceDetailPage from "../insurance/[id]/page"
import GrowthDiaryPage from "../../(pets)/diary/page"
import DiaryEntryDetail from "../../(pets)/diary/[id]/page"
import CommunityPage from "../../(community)/community/page"
import CommunityDetailPage from "../../(community)/community/[id]/page"
import CommunityWritePage from "../../(community)/community/write/page"
import DogResearchLabPage from "../research/page"
import AnimalRegistrationPage from "../../(pets)/adoption/register/page"
import CartPage from "../../(store)/store/cart/page"
import Chatbot from "@/components/features/chatbot"
import AdminPage from "../../(dashboard)/admin/page"
import PetNamingService from "../naming/page"
import InsuranceFavoritesPage from "../insurance/favorites/page"
import GrowthDiaryWritePage from "../../(pets)/diary/write/page"

import axios from "axios"
import { Toaster, toast } from "react-hot-toast"
import { getCurrentKSTDate } from "@/lib/utils"


// Types

import type { Pet } from "@/types/pets"
import type { Product, WishlistItem, CartItem } from "@/types/store"
import type { Insurance } from "@/types/insurance"

interface DiaryEntry {
  id: number
  petName: string
  date: string
  title: string
  content: string
  images: string[]
  milestones: string[]
  tags?: string[]
  weight?: number
  height?: number
  mood: string
  activities: string[]
  ownerEmail?: string // Added for filtering
  audioUrl?: string // Added for voice diary
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

// AI 계약서 생성 관련 타입들
interface ContractTemplate {
  id: number
  name: string
  description: string
  category: string
  content: string
  sections: ContractSection[]
  isDefault: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}

interface ContractSection {
  id: number
  title: string
  content: string
  isRequired: boolean
  order: number
  type: "text" | "checkbox" | "date" | "number" | "select"
  options?: string[] // select 타입일 때 사용
}

interface ContractGenerationRequest {
  templateId: number
  customSections: ContractSection[]
  removedSections: number[]
  petInfo?: {
    name: string
    breed: string
    age: string
    healthStatus: string
  }
  userInfo?: {
    name: string
    phone: string
    email: string
  }
  additionalInfo?: string
}

interface ContractGenerationResponse {
  id: number
  content: string
  pdfUrl?: string
  wordUrl?: string
  generatedAt: string
}

interface AISuggestion {
  id: number
  suggestion: string
  type: "section" | "clause" | "template"
  confidence: number
}

// TODO: AI 계약서 생성 기능 구현 계획
/*
1. 템플릿 관리 기능
   - 템플릿 등록/수정/삭제/조회
   - 템플릿 카테고리별 분류 (입양계약서, 분양계약서, 보호계약서 등)
   - 기본 템플릿과 사용자 커스텀 템플릿 구분

2. AI 추천 기능
   - ChatGPT OpenAI-4.1 연동
   - 템플릿 작성 시 AI 추천 말풍선 표시
   - "이런 건 어떠세요?" 형태의 추천 시스템
   - 자동 템플릿 생성 버튼

3. 계약서 생성 기능
   - 템플릿 선택 후 커스터마이징
   - 섹션 추가/삭제/수정
   - PDF/Word 다운로드 기능
   - 생성된 계약서 저장 및 관리

4. UI/UX 구현
   - 템플릿 선택 페이지
   - 계약서 편집 페이지
   - AI 추천 말풍선 컴포넌트
   - 다운로드 모달

5. 백엔드 API 구현
   - 템플릿 CRUD API
   - AI 추천 API
   - 계약서 생성 API
   - 파일 다운로드 API

6. 데이터베이스 설계
   - contract_templates 테이블
   - contract_sections 테이블
   - generated_contracts 테이블
   - ai_suggestions 테이블
*/

// Axios Interceptor for Debugging and Token Management
axios.interceptors.request.use(
  (config) => {
    // 자동으로 토큰 추가
    const accessToken = localStorage.getItem("accessToken")
    const refreshToken = localStorage.getItem("refreshToken")
    
    console.log("=== Axios Request Interceptor ===")
    console.log("URL:", config.url)
    console.log("Method:", config.method)
    console.log("Access Token:", accessToken ? "존재함" : "없음")
    console.log("Refresh Token:", refreshToken ? "존재함" : "없음")
    
    if (accessToken) {
      config.headers["Access_Token"] = accessToken
      console.log("Access_Token 헤더 설정됨")
    }
    if (refreshToken) {
      config.headers["Refresh_Token"] = refreshToken
      console.log("Refresh_Token 헤더 설정됨")
    }
    
    console.log("전체 헤더:", config.headers)
    console.log("================================")
    
    return config
  },
  (error) => {
    console.error("Request Error:", error)
    return Promise.reject(error)
  }
)

axios.interceptors.response.use(
  (response) => {
    console.log("Response:", response.status, response.data)
    return response
  },
  (error) => {
    if (error.response) {
      // 서버가 응답을 반환했지만 에러 상태 코드인 경우
      console.error("Response Error:", error.response.status, error.response.data)
    } else if (error.request) {
      // 요청이 전송되었지만 응답을 받지 못한 경우
      console.error("Network Error:", "서버에 연결할 수 없습니다")
    } else {
      // 요청 설정 중 오류가 발생한 경우
      console.error("Request Error:", error.message)
    }
    return Promise.reject(error)
  }
)

// Navigation Header Component
function NavigationHeader({
  currentPage,
  onNavigate,
  isLoggedIn,
  isAdmin,
  onLogin,
  onLogout,
  onNavigateToMyPage,
  onNavigateToDiary, // 성장일기 네비게이션 함수 추가
}: {
  currentPage: string
  onNavigate: (page: string) => void
  isLoggedIn: boolean
  isAdmin: boolean
  onLogin: () => void
  onLogout: () => void
  onNavigateToMyPage: () => void
  onNavigateToDiary: () => void // 성장일기 네비게이션 함수 타입 추가
}) {
  console.log("NavigationHeader 렌더링 - isLoggedIn:", isLoggedIn, "isAdmin:", isAdmin)
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
              onClick={() => onNavigateToDiary()}
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



            {isLoggedIn && (
              <button
                onClick={onNavigateToMyPage}
                className={`text-sm font-medium transition-colors ${
                  currentPage === "myPage" ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
                }`}
              >
                마이페이지
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => onNavigate("admin")}
                className={`text-sm font-medium transition-colors ${
                  currentPage === "admin" ? "text-red-600" : "text-red-700 hover:text-red-600"
                }`}
              >
                관리자
              </button>
            )}
          </nav>

          {/* Right side buttons */}
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <>
            
                <Button onClick={onLogout} variant="outline" size="sm" className="text-sm bg-transparent">
                  로그아웃
                </Button>

              </>
            ) : (
              <>

                <Button onClick={onLogin} variant="outline" size="sm" className="text-sm bg-transparent">
                  <User className="w-4 h-4 mr-1" />
                  로그인
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

// Refresh Token Function
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken")
    if (!refreshToken) throw new Error("No refresh token available")

    const response = await axios.post(
      "http://localhost:8080/api/accounts/refresh",
      { refreshToken },
      { headers: { "Content-Type": "application/json" } }
    )

    const { accessToken } = response.data.data
    localStorage.setItem("accessToken", accessToken)
    console.log("Token refreshed successfully")
    return accessToken
  } catch (err) {
    console.error("토큰 갱신 실패:", err)
    return null
  }
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
  const [showContractTemplatePage, setShowContractTemplatePage] = useState(false)
  const [showContractGenerationPage, setShowContractGenerationPage] = useState(false)
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
  const [isLoading, setIsLoading] = useState(true)
  
  // 로딩 타임아웃 설정 (10초 후 자동 해제)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log("로딩 타임아웃, 강제 해제")
        setIsLoading(false)
      }
    }, 10000)
    
    return () => clearTimeout(timeout)
  }, [isLoading])
  const [isLoginFromDiary, setIsLoginFromDiary] = useState(false) // 성장일기에서 로그인 시도 여부

  // currentPage 상태 변경 감지
  useEffect(() => {
    console.log("currentPage 상태 변경됨:", currentPage)
  }, [currentPage])

  // 사용자 변경 시 장바구니 초기화
  useEffect(() => {
    if (currentUser?.id && isLoggedIn) {
      console.log("사용자 변경됨, 장바구니 초기화:", currentUser.id)
      setCart([])
      // 새 사용자의 장바구니 가져오기
      fetchCartItems()
    }
  }, [currentUser?.id, isLoggedIn])

  // Check initial login state and fetch user info
  useEffect(() => {
    const checkLoginStatus = async () => {
      if (typeof window === "undefined") return

      let accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
        setIsLoading(false)
        // 로그인되지 않은 경우 장바구니 초기화
        setCart([])
        return
      }

      try {
        const response = await axios.get("http://localhost:8080/api/accounts/me", {
          headers: { "Access_Token": accessToken },
          timeout: 5000, // 5초 타임아웃 추가
        })
        const { id, email, name, role } = response.data.data
        setCurrentUser({ id, email, name })
        setIsAdmin(role === "ADMIN")
        setIsLoggedIn(true)
        console.log("Initial login check successful:", { id, email, name, role })
        
        // 로그인 성공 시 장바구니 초기화 후 해당 사용자의 장바구니 가져오기
        setCart([])
        await fetchCartItems()
      } catch (err: any) {
        console.error("사용자 정보 조회 실패:", err)
        
        // 네트워크 오류나 서버 연결 실패 시 로그아웃 처리
        if (err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK' || !err.response) {
          console.log("백엔드 서버 연결 실패, 로그아웃 처리")
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          setIsLoggedIn(false)
          setCurrentUser(null)
          setIsAdmin(false)
          setIsLoading(false)
          return
        }
        
        if (err.response?.status === 401) {
          accessToken = await refreshAccessToken()
          if (accessToken) {
            try {
              const response = await axios.get("http://localhost:8080/api/accounts/me", {
                headers: { "Access_Token": accessToken },
                timeout: 5000,
              })
              const { id, email, name, role } = response.data.data
              setCurrentUser({ id, email, name })
              setIsLoggedIn(true)
              setIsAdmin(role === "ADMIN")
              console.log("Retry login check successful:", { id, email, name, role })
            } catch (retryErr) {
              console.error("재시도 실패:", retryErr)
              localStorage.removeItem("accessToken")
              localStorage.removeItem("refreshToken")
              setIsLoggedIn(false)
              setCurrentUser(null)
              setIsAdmin(false)
            }
          } else {
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            setIsLoggedIn(false)
            setCurrentUser(null)
            setIsAdmin(false)
          }
        } else {
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          setIsLoggedIn(false)
          setCurrentUser(null)
          setIsAdmin(false)
        }
      }
      setIsLoading(false)
    }

    checkLoginStatus()
  }, [])

  // URL 파라미터를 읽어서 페이지 설정
  useEffect(() => {
    if (typeof window === "undefined") return

    const urlParams = new URLSearchParams(window.location.search)
    const page = urlParams.get("page")
    
    if (page && ["home", "adoption", "insurance", "diary", "community", "store", "myPage"].includes(page)) {
      setCurrentPage(page)
    }
  }, [])

  // OAuth callback handling
  useEffect(() => {
    if (typeof window === "undefined") return

    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get("success")
    const error = urlParams.get("error")
    const accessToken = urlParams.get("accessToken")
    const refreshToken = urlParams.get("refreshToken")

    if (success && accessToken && refreshToken) {
      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)

      const fetchUserInfo = async () => {
        try {
          console.log("OAuth 사용자 정보 조회 시작...")
          const response = await axios.get("http://localhost:8080/api/accounts/me")
          console.log("OAuth 사용자 정보 응답:", response)
          const userData = response.data?.data
          if (!userData) {
            throw new Error("사용자 데이터가 없습니다")
          }
          const { id, email, name, role } = userData
          setCurrentUser({ id, email, name })
          setIsLoggedIn(true)
          setIsAdmin(role === "ADMIN")
          toast.success("OAuth 로그인 되었습니다", { duration: 5000 })
          console.log("OAuth login successful:", { id, email, name, role })
        } catch (err: any) {
          console.error("사용자 정보 조회 실패:", err)
          
          let errorMessage = "사용자 정보 조회 실패"
          if (err.response) {
            // 서버 응답이 있는 경우
            errorMessage += ": " + (err.response.data?.message || err.response.statusText)
          } else if (err.request) {
            // 네트워크 오류
            errorMessage += ": 서버에 연결할 수 없습니다"
          } else {
            // 기타 오류
            errorMessage += ": " + err.message
          }
          
          toast.error(errorMessage, { duration: 5000 })
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
          setIsLoggedIn(false)
          setCurrentUser(null)
          setIsAdmin(false)
        }
        window.history.replaceState({}, document.title, window.location.pathname)
      }

      fetchUserInfo()
    } else if (error) {
      toast.error(decodeURIComponent(error), { duration: 5000 })
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  // Event handlers
  const handleLogin = async (email: string, password: string) => {
    try {
      console.log("로그인 시도:", { email })
      const response = await axios.post(
        "http://localhost:8080/api/accounts/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      )

      const { data } = response.data
      const { accessToken, refreshToken, user } = data

      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
      
      // 상태 업데이트를 동기적으로 처리
      const userInfo = { id: user.id, email: user.email, name: user.name }
      const isAdminUser = user.role === "ADMIN"
      
      // 모든 상태를 한 번에 업데이트
      setCurrentUser(userInfo)
      setIsLoggedIn(true)
      setIsAdmin(isAdminUser)
      setShowLoginModal(false)
      
      // 즉시 toast 표시
      toast.success("로그인 되었습니다", { duration: 5000 })
      
      // 페이지 변경도 즉시 실행
      setCurrentPage(isAdminUser ? "admin" : "home")
      
      console.log("로그인 완료 - 상태 업데이트됨:", { userInfo, isLoggedIn: true, isAdmin: isAdminUser })
      
    } catch (err: any) {
      console.error("로그인 실패:", err.response?.data?.message || err.message)
      const errorMessage =
        err.response?.data?.code === "LOGIN_FAILED"
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : "로그인 중 오류가 발생했습니다."
      toast.error(errorMessage, { duration: 5000 })
    }
  }

  const handleSignup = (userData: any) => {
    console.log("회원가입 데이터:", userData)
    setIsLoggedIn(true)
    const userId = userData.email.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 1000 + 1
    setCurrentUser({ id: userId, email: userData.email, name: userData.name })
    toast.success("회원가입 및 로그인이 완료되었습니다", { duration: 5000 })

    if (userData.petType && userData.petAge && userData.petBreed) {
      const newPet: Pet = {
        petId: pets.length + 1,
        name: `${userData.name}'s Pet`,
        breed: userData.petBreed,
        age: userData.petAge,
        gender: "미상",
        size: "대형",
        personality: [],
        healthStatus: "건강함",
        description: "사용자가 등록한 펫",
        images: ["/placeholder.svg?height=400&width=600"],
        location: "사용자 거주지",
        contact: "사용자 연락처",
        adoptionFee: 0,
        isNeutered: false,
        isVaccinated: false,
        dateRegistered: getCurrentKSTDate(),
        adoptionStatus: "available",
        ownerEmail: userData.email,
      }
      setPets((prev) => [...prev, newPet])
    }
    setShowSignupModal(false)
  }

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken")
      if (accessToken) {
        await axios.post(
          "http://localhost:8080/api/accounts/logout",
          {},
          {
            headers: {
              "Content-Type": "application/json"
            },
          }
        )
      }
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      setIsLoggedIn(false)
      setIsAdmin(false)
      setCurrentUser(null)
      // 로그아웃 시 장바구니 초기화
      setCart([])
      toast.success("로그아웃 되었습니다", { duration: 5000 })
      setCurrentPage("home")
    } catch (err: any) {
      console.error("로그아웃 실패:", err.response?.data?.message || err.message)
      toast.error("로그아웃 실패", { duration: 5000 })
    }
  }

  const handleAddToWishlist = (item: WishlistItem) => {
    setWishlist((prev) => {
      const exists = prev.find((w) => w.id === item.id)
      if (exists) {
        toast.success("위시리스트에서 제거되었습니다", { duration: 5000 })
        return prev.filter((w) => w.id !== item.id)
      } else {
        toast.success("위시리스트에 추가되었습니다", { duration: 5000 })
        return [...prev, item]
      }
    })
  }

  const isInWishlist = (id: number) => {
    return wishlist.some((item) => item.id === id)
  }

  const handleAddToCart = async (product: Product) => {
    console.log("=== handleAddToCart 시작 ===")
    console.log("로그인 상태:", isLoggedIn)
    console.log("현재 사용자:", currentUser)
    console.log("상품 정보:", product)
    
    if (!isLoggedIn) {
      toast.error("로그인이 필요합니다", { duration: 5000 })
      setShowLoginModal(true)
      return
    }

    try {
      console.log('장바구니 추가 시작...')
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      console.log("Access Token 존재 여부:", !!accessToken)
      console.log("Refresh Token 존재 여부:", !!refreshToken)
      console.log("Access Token 길이:", accessToken?.length)
      console.log("Access Token 내용 (처음 20자):", accessToken?.substring(0, 20))
      
      if (!accessToken || accessToken.trim() === '') {
        console.error("Access Token이 없거나 비어있습니다!")
        toast.error("인증 토큰이 없습니다. 다시 로그인해주세요.", { duration: 5000 })
        return
      }

      // 장바구니 추가 API
      const url = `http://localhost:8080/api/carts?productId=${product.productId}&quantity=1`
      const response = await axios.post(url, null, {
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Bearer ${accessToken}`,
          "Access_Token": accessToken,
          "Refresh_Token": localStorage.getItem('refreshToken') || ''
        },
        timeout: 5000
      })

      if (response.status !== 200) {
        throw new Error(`장바구니 추가에 실패했습니다. (${response.status})`)
      }

      await fetchCartItems()
      toast.success(`${product.name}을(를) 장바구니에 추가했습니다`, { duration: 5000 })
      setCurrentPage("cart")
    } catch (error: any) {
      console.error("장바구니 추가 오류:", error)
      console.error('에러 상세 정보:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
      toast.error("백엔드 서버 연결에 실패했습니다. 장바구니 추가가 불가능합니다.", { duration: 5000 })
    }
  }

  const isInCart = (id: number) => {
    return cart.some((item) => item.id === id)
  }

  const fetchCartItems = async () => {
    console.log("=== fetchCartItems 시작 ===")
    console.log("로그인 상태:", isLoggedIn)
    console.log("현재 사용자:", currentUser)
    
    if (!isLoggedIn) {
      console.log('로그인되지 않음, 장바구니 조회 중단')
      return
    }

    try {
      console.log('장바구니 조회 시작...')
      
      // accessToken에서 사용자 ID 추출
      const accessToken = localStorage.getItem("accessToken");
      console.log("Access Token 존재 여부:", !!accessToken)
      
      if (!accessToken || accessToken.trim() === '') {
        console.log('Access token이 없거나 비어있습니다.');
        return;
      }

      // 토큰 유효성 간단 체크
      if (accessToken.split('.').length !== 3) {
        console.log('토큰 형식이 유효하지 않습니다.');
        return;
      }

      let userId: number | null = null;
      try {
        const tokenParts = accessToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('JWT payload:', payload);
          // JWT에서 사용자 ID를 직접 가져올 수 없으므로, 백엔드에서 사용자 정보를 가져와야 함
          // 임시로 currentUser?.id 사용
          userId = currentUser?.id || null;
        }
      } catch (error) {
        console.error('JWT 파싱 오류:', error);
        userId = currentUser?.id || null;
      }

      if (!userId) {
        console.log('사용자 ID를 찾을 수 없습니다.');
        return;
      }

      // 사용자별 장바구니 조회 API 사용
      const response = await axios.get(`http://localhost:8080/api/carts`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Access_Token": accessToken,
          "Refresh_Token": localStorage.getItem('refreshToken') || ''
        },
        timeout: 5000
      })
      if (response.status !== 200) {
        throw new Error("장바구니 조회에 실패했습니다.")
      }

      const cartData = response.data
      console.log('백엔드에서 받은 장바구니 데이터:', cartData)
      
      const cartItems: CartItem[] = cartData
        .sort((a: any, b: any) => a.id - b.id)
        .map((item: any, index: number) => ({
          id: item.id,
          name: item.product.name,
          brand: "브랜드 없음", // Product 엔티티에 brand 필드가 없음
          price: item.product.price,
          image: item.product.imageUrl || "/placeholder.svg",
          category: item.product.category,
          quantity: item.quantity,
          order: index,
          product: {
            productId: item.product.productId,
            name: item.product.name,
            description: item.product.description,
            price: item.product.price,
            stock: item.product.stock,
            imageUrl: item.product.imageUrl,
            category: item.product.category,
            targetAnimal: item.product.targetAnimal,
            registrationDate: item.product.registrationDate,
            registeredBy: item.product.registeredBy,
          }
        }))
      setCart(cartItems)
      console.log('장바구니 설정 완료:', cartItems.length, '개')
    } catch (error: any) {
      console.error("장바구니 조회 오류:", error)
      console.error('에러 상세 정보:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      })
      
      // 백엔드 서버가 응답하지 않을 때 빈 장바구니로 설정
      setCart([])
      toast.error('백엔드 서버 연결에 실패했습니다. 장바구니를 불러올 수 없습니다.', { duration: 5000 })
    }
  }

  const handleRemoveFromCart = async (cartId: number) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        toast.error("인증 토큰이 없습니다. 다시 로그인해주세요.", { duration: 5000 })
        return
      }

      const response = await axios.delete(`http://localhost:8080/api/carts/${cartId}`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Access_Token": accessToken,
          "Refresh_Token": localStorage.getItem('refreshToken') || ''
        }
      })

      if (response.status !== 200) {
        throw new Error("장바구니에서 삭제에 실패했습니다.")
      }

      await fetchCartItems()
      toast.success("장바구니에서 상품을 삭제했습니다", { duration: 5000 })
    } catch (error) {
      console.error("장바구니 삭제 오류:", error)
      toast.error("장바구니에서 삭제에 실패했습니다", { duration: 5000 })
    }
  }

  const handleUpdateCartQuantity = async (cartId: number, quantity: number) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        toast.error("인증 토큰이 없습니다. 다시 로그인해주세요.", { duration: 5000 })
        return
      }

      const response = await axios.put(`http://localhost:8080/api/carts/${cartId}?quantity=${quantity}`, null, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Access_Token": accessToken,
          "Refresh_Token": localStorage.getItem('refreshToken') || ''
        }
      })

      if (response.status !== 200) {
        throw new Error("수량 업데이트에 실패했습니다.")
      }

      await fetchCartItems()
      toast.success("장바구니 수량을 업데이트했습니다", { duration: 5000 })
    } catch (error) {
      console.error("수량 업데이트 오류:", error)
      toast.error("수량 업데이트에 실패했습니다", { duration: 5000 })
    }
  }

  useEffect(() => {
    if (isLoggedIn) {
      fetchCartItems()
    }
  }, [isLoggedIn])

  // 상품 목록 가져오기
  useEffect(() => {
    fetchProducts()
  }, [])

  const createOrder = async (orderData: { userId: number; totalPrice: number }) => {
    try {
      const response = await axios.post("http://localhost:8080/api/orders", orderData, {
        headers: { "Content-Type": "application/json" },
      })

      if (response.status !== 200) {
        throw new Error("주문 생성에 실패했습니다.")
      }

      const newOrder = response.data
      setOrders((prev) => [...prev, newOrder])
      toast.success("주문이 생성되었습니다", { duration: 5000 })
      return newOrder
    } catch (error) {
      console.error("주문 생성 오류:", error)
      toast.error("주문 생성에 실패했습니다", { duration: 5000 })
      throw error
    }
  }

  const purchaseAllFromCart = async () => {
    if (!isLoggedIn || !currentUser) {
      toast.error("로그인이 필요합니다", { duration: 5000 })
      setShowLoginModal(true)
      return
    }

    try {
      const response = await axios.post(`http://localhost:8080/api/orders/purchase-all/${currentUser.id}`)

      if (response.status !== 200) {
        throw new Error("전체 구매에 실패했습니다.")
      }

      const newOrder = response.data
      setOrders((prev) => [...prev, newOrder])
      setCart([])
      await fetchUserOrders()
      toast.success("전체 구매가 완료되었습니다", { duration: 5000 })
      setCurrentPage("myPage")
    } catch (error) {
      console.error("전체 구매 오류:", error)
      toast.error("전체 구매에 실패했습니다", { duration: 5000 })
    }
  }

  const purchaseSingleItem = async (cartItem: CartItem) => {
    if (!isLoggedIn || !currentUser) {
      toast.error("로그인이 필요합니다", { duration: 5000 })
      setShowLoginModal(true)
      return
    }

    try {
      // 인증 토큰 가져오기
      const accessToken = localStorage.getItem('accessToken')
      const headers: any = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
      
      // 토큰이 있으면 헤더에 추가
      if (accessToken) {
        headers['access_token'] = accessToken
      }

      const orderData = {
        userId: currentUser.id,
        totalPrice: cartItem.price * cartItem.quantity,
        orderItems: [
          {
            productId: cartItem.product?.productId || cartItem.id, // 실제 상품 ID 사용
            productName: cartItem.product?.name || cartItem.name || cartItem.brand + " " + cartItem.category,
            imageUrl: cartItem.product?.imageUrl || cartItem.image || "/placeholder.svg",
            quantity: cartItem.quantity,
            price: cartItem.product?.price || cartItem.price,
          },
        ],
      }

      console.log("개별 구매 요청 데이터:", orderData)

      const response = await axios.post("http://localhost:8080/api/orders", orderData, {
        headers: headers,
        timeout: 10000
      })

      console.log("개별 구매 응답:", response.data)

      if (response.status !== 200) {
        throw new Error("개별 구매에 실패했습니다.")
      }

      // 장바구니에서 해당 상품 제거
      await handleRemoveFromCart(cartItem.id)
      await fetchUserOrders()
      toast.success("개별 구매가 완료되었습니다", { duration: 5000 })
      setCurrentPage("myPage")
    } catch (error: any) {
      console.error("개별 구매 오류:", error)
      console.error("에러 응답 데이터:", error.response?.data)
      console.error("에러 상태 코드:", error.response?.status)
      console.error("에러 메시지:", error.message)
      toast.error("개별 구매에 실패했습니다", { duration: 5000 })
    }
  }

  const fetchUserOrders = useCallback(async () => {
    if (!isLoggedIn || !currentUser) return

    try {
      const response = await axios.get(`http://localhost:8080/api/orders/user/${currentUser.id}`)
      if (response.status !== 200) {
        throw new Error("주문 조회에 실패했습니다.")
      }

      const userOrders = response.data
      const orderItems: OrderItem[] = userOrders.flatMap((order: any) => {
        if (order.orderItems && order.orderItems.length > 0) {
          return order.orderItems.map((item: any) => ({
            id: item.id || order.orderId,
            productId: item.productId || 0,
            productName: item.productName || `주문 #${order.orderId}`,
            price: item.price || order.totalPrice,
            quantity: item.quantity || 1,
            orderDate: order.orderedAt || new Date().toISOString(),
            status: order.paymentStatus === "COMPLETED" ? "completed" : order.paymentStatus === "PENDING" ? "pending" : "cancelled",
            ImageUrl: item.ImageUrl || "/placeholder.svg",
          }))
        } else {
          return [{
            id: order.orderId,
            productId: 0,
            productName: `주문 #${order.orderId}`,
            price: order.totalPrice,
            quantity: 1,
            orderDate: order.orderedAt || new Date().toISOString(),
            status: order.paymentStatus === "COMPLETED" ? "completed" : order.paymentStatus === "PENDING" ? "pending" : "cancelled",
            ImageUrl: "/placeholder.svg",
          }]
        }
      })
      const sortedOrderItems = orderItems.sort((a, b) => {
        const dateA = new Date(a.orderDate).getTime()
        const dateB = new Date(b.orderDate).getTime()
        return dateB - dateA
      })
      setOrders(sortedOrderItems)
    } catch (error) {
      console.error("주문 조회 오류:", error)
      toast.error("주문 조회에 실패했습니다", { duration: 5000 })
    }
  }, [isLoggedIn, currentUser])

  const deleteOrder = async (orderId: number) => {
    try {
      const response = await axios.delete(`http://localhost:8080/api/orders/${orderId}`)

      if (response.status !== 200) {
        throw new Error("주문 삭제에 실패했습니다.")
      }

      setOrders((prev) => prev.filter((order) => order.id !== orderId))
      toast.success("주문이 삭제되었습니다", { duration: 5000 })
    } catch (error) {
      console.error("주문 삭제 오류:", error)
      toast.error("주문 삭제에 실패했습니다", { duration: 5000 })
    }
  }

  const updatePaymentStatus = async (orderId: number, status: "PENDING" | "COMPLETED" | "CANCELLED") => {
    try {
      const response = await axios.put(`http://localhost:8080/api/orders/${orderId}/status?status=${status}`)

      if (response.status !== 200) {
        throw new Error("결제 상태 업데이트에 실패했습니다.")
      }

      const updatedOrder = response.data
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, status: status === "COMPLETED" ? "completed" : status === "PENDING" ? "pending" : "cancelled" }
            : order
        )
      )
      toast.success("결제 상태가 업데이트되었습니다", { duration: 5000 })
    } catch (error) {
      console.error("결제 상태 업데이트 오류:", error)
      toast.error("결제 상태 업데이트에 실패했습니다", { duration: 5000 })
    }
  }

  const handleAddPet = (petData: any) => {
    const newPet: Pet = {
      id: pets.length + 1,
      ...petData,
      dateRegistered: getCurrentKSTDate(),
      adoptionStatus: "available",
    }
    setPets((prev) => [...prev, newPet])
    toast.success("새로운 펫이 등록되었습니다", { duration: 5000 })
    setCurrentPage("adoption")
  }

  const fetchProducts = async () => {
    try {
      console.log('상품 목록 조회 시작...')
      console.log('요청 URL:', 'http://localhost:8080/api/products')
      
      // 백엔드 서버 상태 확인
      try {
        const healthCheck = await axios.get('http://localhost:8080/actuator/health', {
          timeout: 3000
        })
        console.log('백엔드 서버 상태:', healthCheck.data)
      } catch (healthError) {
        console.warn('백엔드 서버 상태 확인 실패:', healthError)
      }
      
      // 인증 토큰 가져오기
      const accessToken = localStorage.getItem('accessToken')
      const headers: any = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
      
      // 토큰이 있고 유효한 경우에만 헤더에 추가
      if (accessToken && accessToken.trim() !== '') {
        // 토큰 유효성 간단 체크 (JWT 형식인지 확인)
        if (accessToken.split('.').length === 3) {
          headers['Access_Token'] = accessToken
          headers['Refresh_Token'] = localStorage.getItem('refreshToken') || ''
          console.log('인증 토큰 추가됨')
        } else {
          console.log('토큰 형식이 유효하지 않음 - 익명 접근')
        }
      } else {
        console.log('인증 토큰 없음 - 익명 접근')
      }
      
      const response = await axios.get('http://localhost:8080/api/products', {
        timeout: 10000, // 10초로 증가
        headers: headers
      })
      
      console.log('응답 상태:', response.status)
      console.log('응답 헤더:', response.headers)
      const backendProducts = response.data
      console.log('백엔드에서 받은 상품 데이터:', backendProducts)
      
      if (!Array.isArray(backendProducts)) {
        console.error('백엔드 응답이 배열이 아닙니다:', typeof backendProducts)
        throw new Error('잘못된 데이터 형식')
      }
      
      // 백엔드 데이터를 프론트엔드 형식으로 변환
      const convertedProducts: Product[] = backendProducts.map((product: any) => ({
        productId: product.productId || product.id,
        name: product.name || '상품명 없음',
        description: product.description || '',
        price: product.price || 0,
        stock: product.stock || 0,
        imageUrl: product.imageUrl || product.image || '/placeholder.svg?height=300&width=300',
        category: product.category || '용품',
        targetAnimal: product.targetAnimal || 'ALL',
        registrationDate: product.registrationDate || new Date().toISOString().split('T')[0],
        registeredBy: product.registeredBy || 'admin'
      }))
      
      setProducts(convertedProducts)
      console.log('상품 목록 설정 완료:', convertedProducts.length, '개')
    } catch (error: any) {
      console.error('상품 목록 조회 오류:', error)
      console.error('에러 상세 정보:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          timeout: error.config?.timeout
        }
      })
      
      // 404 에러나 기타 네트워크 오류 시 기본 상품 데이터 제공
      console.log('기본 상품 데이터로 대체합니다.')
      const defaultProducts: Product[] = [
        {
          productId: 1,
          name: "프리미엄 강아지 사료 (성견용)",
          description: "성견을 위한 프리미엄 사료입니다.",
          price: 45000,
          stock: 50,
          imageUrl: "/placeholder.svg?height=300&width=300",
          category: "사료",
          targetAnimal: "DOG",
          registrationDate: new Date().toISOString().split('T')[0],
          registeredBy: "admin"
        },
        {
          productId: 2,
          name: "고양이 장난감 세트",
          description: "다양한 고양이 장난감으로 구성된 세트입니다.",
          price: 25000,
          stock: 100,
          imageUrl: "/placeholder.svg?height=300&width=300",
          category: "장난감",
          targetAnimal: "CAT",
          registrationDate: new Date().toISOString().split('T')[0],
          registeredBy: "admin"
        },
        {
          productId: 3,
          name: "강아지 목줄",
          description: "편안하고 안전한 강아지 목줄입니다.",
          price: 15000,
          stock: 30,
          imageUrl: "/placeholder.svg?height=300&width=300",
          category: "용품",
          targetAnimal: "DOG",
          registrationDate: new Date().toISOString().split('T')[0],
          registeredBy: "admin"
        }
      ]
      
      setProducts(defaultProducts)
      
      let errorMessage = '백엔드 서버 연결에 실패했습니다. 기본 상품 데이터를 표시합니다.'
      if (error.response?.status === 500) {
        errorMessage = '서버 내부 오류가 발생했습니다. 기본 상품 데이터를 표시합니다.'
      } else if (error.response?.status === 404) {
        errorMessage = '상품 API 엔드포인트를 찾을 수 없습니다. 기본 상품 데이터를 표시합니다.'
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = '서버 응답 시간이 초과되었습니다. 기본 상품 데이터를 표시합니다.'
      }
      
      toast.error(errorMessage, { duration: 5000 })
    }
  }

  const handleAddProduct = (productData: any) => {
    const newProduct: Product = {
      id: products.length + 1,
      ...productData,
      registrationDate: getCurrentKSTDate(),
      registeredBy: currentUser?.email || "admin",
      petType: productData.petType || "all",
    }
    setProducts((prev) => [...prev, newProduct])
    toast.success("새로운 상품이 등록되었습니다", { duration: 5000 })
    setCurrentPage("store")
  }

  const handleViewProduct = (product: Product) => {
    setSelectedProductId(product.productId)
    setCurrentPage("product-detail")
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProductForEdit(product)
    setCurrentPage("product-edit")
  }

  const handleSaveProduct = (updatedProduct: Product) => {
    setProducts((prev) => prev.map((p) => (p.productId === updatedProduct.productId ? updatedProduct : p)))
    toast.success("상품이 수정되었습니다", { duration: 5000 })
  }

  const addToInsuranceFavorites = (id: number) => {
    setFavoriteInsurance((prev) => {
      if (prev.includes(id)) return prev
      return [...prev, id]
    })
    toast.success("펫보험이 즐겨찾기에 추가되었습니다", { duration: 5000 })
  }

  const removeFromInsuranceFavorites = (id: number) => {
    setFavoriteInsurance((prev) => prev.filter((itemId) => itemId !== id))
    toast.success("펫보험이 즐겨찾기에서 제거되었습니다", { duration: 5000 })
  }

  const handleUpdateDiaryEntry = (updatedEntry: DiaryEntry) => {
    setDiaryEntries((prev) =>
      prev.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))
    )
    setSelectedDiaryEntry(updatedEntry)
    toast.success("성장일기가 수정되었습니다", { duration: 5000 })
  }

  const handleDeleteDiaryEntry = (entryId: number) => {
    setDiaryEntries((prev) => prev.filter((entry) => entry.id !== entryId))
    setSelectedDiaryEntry(null)
    toast.success("성장일기가 삭제되었습니다", { duration: 5000 })
  }

  const handleDeleteCommunityPost = (postId: number) => {
    setCommunityPosts((prev) => prev.filter((post) => post.id !== postId))
    setSelectedPost(null)
    toast.success("게시물이 삭제되었습니다", { duration: 5000 })
  }

  const handleBuyNow = async (product: Product) => {
    if (!isLoggedIn || !currentUser) {
      toast.error("로그인이 필요합니다", { duration: 5000 })
      setShowLoginModal(true)
      return
    }

    try {
      // 인증 토큰 가져오기
      const accessToken = localStorage.getItem('accessToken')
      const headers: any = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
      
      // 토큰이 있으면 헤더에 추가
      if (accessToken) {
        headers['Access_Token'] = accessToken
        headers['Refresh_Token'] = localStorage.getItem('refreshToken') || ''
        console.log('인증 토큰 추가됨')
      } else {
        console.log('인증 토큰 없음')
      }

      const orderData = {
        accountId: currentUser.id,
        productId: Number(product.productId || product.id),
        quantity: 1
      }

      console.log('주문 데이터:', orderData)

      const response = await axios.post("http://localhost:8080/api/orders", orderData, {
        headers: headers,
        timeout: 10000
      })

      console.log('주문 응답:', response.data)

      if (response.status !== 200) {
        throw new Error("주문 생성에 실패했습니다.")
      }

      await fetchUserOrders()
      toast.success("바로구매가 완료되었습니다", { duration: 5000 })
      setCurrentPage("myPage")
    } catch (error: any) {
      console.error("바로구매 오류:", error)
      console.error('에러 상세 정보:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      })
      toast.error("바로구매에 실패했습니다", { duration: 5000 })
    }
  }

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
      ownerEmail: "user@test.com",
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
      ownerEmail: "user@test.com",
    },
  ])

  const [products, setProducts] = useState<Product[]>([])

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
      boardType: "자유게시판",
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
      email: "user@test.com",
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
      email: "user@test.com",
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

  // Render current page
  const renderCurrentPage = () => {
    console.log("renderCurrentPage 호출됨, currentPage:", currentPage)
    
    // URL 파라미터 확인 (SSR 안전)
    let page = null;
    let editId = null;
    
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      page = urlParams.get("page");
      editId = urlParams.get("edit");
    }
    
    console.log("URL params - page:", page, "edit:", editId);
    
    if (isLoading) {
      console.log("로딩 중...")
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      )
    }

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
                  date: getCurrentKSTDate(),
                }
                setAdoptionInquiries((prev) => [...prev, newInquiry])
                toast.success("입양 문의가 등록되었습니다", { duration: 5000 })
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
            currentUserId={isLoggedIn ? currentUser?.id.toString() : undefined}
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
            currentUserId={isLoggedIn ? currentUser?.id.toString() : undefined}
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
        // 수정 모드인지 확인
        if (editId) {
          console.log("Diary edit mode detected for ID:", editId);
          // 수정 페이지로 리다이렉트
          window.location.href = `/diary/edit/${editId}`;
          return null;
        }
        
        return (
          <GrowthDiaryPage
            entries={[]}
            onViewEntry={() => {}}
            onClose={() => setCurrentPage("home")}
            onAddEntry={() => {}}
            isLoggedIn={isLoggedIn}
            currentUserId={currentUser?.id?.toString()}
            onNavigateToWrite={() => {}}
          />
        )

      case "growthDiaryWrite":
        return (
          <GrowthDiaryWritePage
            onBack={() => setCurrentPage("diary")}
            onSubmit={(entryData) => {
              const newEntry: DiaryEntry = {
                id: diaryEntries.length + 1,
                ...entryData,
                date: new Date().toISOString().split("T")[0],
                ownerEmail: currentUser?.email, // 작성자 이메일 추가
                audioUrl: entryData.audioUrl, // 음성 URL 추가
              }
              setDiaryEntries((prev) => [...prev, newEntry])
              toast.success("성장일기가 작성되었습니다", { duration: 5000 })
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
                toast.success("게시물이 수정되었습니다", { duration: 5000 })
              }}
              onDeletePost={handleDeleteCommunityPost}
              currentUserEmail={currentUser?.email}
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
                ownerEmail: currentUser?.email,
              }
              setCommunityPosts((prev) => [newPost, ...prev])
              toast.success("게시물이 작성되었습니다", { duration: 5000 })
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
            onPurchaseAll={purchaseAllFromCart}
            onPurchaseSingle={purchaseSingleItem}
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
                prev.map((inquiry) => (inquiry.id === id ? { ...inquiry, status } : inquiry))
              )
              toast.success("입양 문의 상태가 업데이트되었습니다", { duration: 5000 })
            }}
            onDeleteComment={(id) => {
              setComments((prev) => prev.filter((comment) => comment.id !== id))
              toast.success("댓글이 삭제되었습니다", { duration: 5000 })
            }}
            onDeletePost={(id) => {
              setCommunityPosts((prev) => prev.filter((post) => post.id !== id))
              toast.success("게시물이 삭제되었습니다", { duration: 5000 })
            }}
            onUpdatePet={(updatedPet) => {
              setPets((prev) => prev.map((pet) => (pet.id === updatedPet.id ? updatedPet : pet)))
            }}
            onEditProduct={handleEditProduct}
            onDeleteProduct={(productId) => {
              setProducts((prev) => prev.filter((product) => product.productId !== productId))
              toast.success("상품이 삭제되었습니다", { duration: 5000 })
            }}
            onUpdateOrderStatus={updatePaymentStatus}
            isAdmin={isAdmin}
            onAdminLogout={handleLogout}
          />
        )





      case "myPage":
        console.log("myPage case 실행됨")
        console.log("currentUser:", currentUser)
        return (
          <MyPage
            currentUser={currentUser}
            userPets={pets.filter((pet) => pet.ownerEmail === currentUser?.email)}
            userAdoptionInquiries={adoptionInquiries.filter((inquiry) => inquiry.email === currentUser?.email)}
            userOrders={orders}
            onClose={() => setCurrentPage("home")}
            onRefreshOrders={fetchUserOrders}
          />
        )

      case "contract":
        if (!isAdmin) {
          return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">접근 권한이 없습니다</h1>
                <p className="text-gray-600">AI 계약서 서비스는 관리자만 접근할 수 있습니다.</p>
                <Button onClick={() => setCurrentPage("home")} className="mt-4">
                  홈으로 돌아가기
                </Button>
              </div>
            </div>
          )
        }
        return (
          <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto p-6">
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-4">AI 계약서 서비스</h1>
                <p className="text-gray-600">템플릿을 관리하고 AI의 도움을 받아 맞춤형 계약서를 생성하세요.</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowContractTemplatePage(true)}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      템플릿 관리
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">계약서 템플릿을 생성, 수정, 관리할 수 있습니다.</p>
                  </CardContent>
                </Card>
                
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowContractGenerationPage(true)}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      계약서 생성
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">AI의 도움을 받아 맞춤형 계약서를 생성하세요.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="min-h-screen bg-white">
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

            <section className="py-20 bg-gray-50">
              <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-8 justify-center">
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
                              toast.error("장바구니를 이용하려면 로그인이 필요합니다", { duration: 5000 })
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
      <Toaster position="bottom-right" />
      <NavigationHeader
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onLogin={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        onNavigateToMyPage={() => {
          console.log("마이페이지 버튼 클릭됨")
          console.log("현재 페이지:", currentPage)
          setCurrentPage("myPage")
          console.log("페이지를 myPage로 설정함")
          
          // 상태 변경 확인을 위한 setTimeout
          setTimeout(() => {
            console.log("setTimeout 후 현재 페이지:", currentPage)
          }, 100)
        }}
        onNavigateToDiary={() => {
          console.log("성장일기 버튼 클릭됨")
          setCurrentPage("diary")
        }}
      />

      {renderCurrentPage()}

      <Chatbot />

      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSwitchToSignup={() => {
            setShowLoginModal(false)
            setShowSignupModal(true)
          }}
          onLoginSuccess={async () => {
            console.log("LoginModal에서 로그인 성공 알림 받음")
            // 모달 명시적으로 닫기
            setShowLoginModal(false)
            // 로그인 상태 강제 업데이트
            setIsLoggedIn(true)
            
            // 장바구니 초기화
            setCart([])
            
            // 토큰 저장 상태 확인
            const accessToken = localStorage.getItem("accessToken")
            const refreshToken = localStorage.getItem("refreshToken")
            console.log("로그인 후 토큰 저장 상태 확인:")
            console.log("Access Token 존재:", !!accessToken)
            console.log("Refresh Token 존재:", !!refreshToken)
            console.log("Access Token 길이:", accessToken?.length)
            
            // 사용자 정보 즉시 가져와서 isAdmin 상태 설정
            try {
              if (accessToken && accessToken.trim() !== '') {
                const response = await axios.get("http://localhost:8080/api/accounts/me", {
                  headers: { "Access_Token": accessToken },
                })
                const { id, email, name, role } = response.data.data
                setCurrentUser({ id, email, name })
                setIsAdmin(role === "ADMIN")
                console.log("로그인 후 사용자 정보 업데이트:", { id, email, name, role })
                
                // 로그인 성공 후 해당 사용자의 장바구니 가져오기 (약간의 지연 후)
                setTimeout(async () => {
                  await fetchCartItems()
                }, 100)
              } else {
                console.error("Access Token이 저장되지 않았습니다!")
              }
            } catch (err) {
              console.error("로그인 후 사용자 정보 조회 실패:", err)
            }
          }}
          onLogoutSuccess={() => {
            console.log("LoginModal에서 로그아웃 성공 알림 받음")
            // 로그아웃 상태 강제 업데이트
            setIsLoggedIn(false)
            setIsAdmin(false)
            setCurrentUser(null)
            // 로그아웃 시 장바구니 초기화
            setCart([])
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
            toast.success("비밀번호 복구 이메일이 전송되었습니다", { duration: 5000 })
            setShowPasswordRecovery(false)
          }}
          onSwitchToLogin={() => {
            setShowPasswordRecovery(false)
            setShowLoginModal(true)
          }}
        />
      )}
      
      {showContractTemplatePage && (
        <ContractTemplatePage />
      )}
      
      {showContractGenerationPage && (
        <ContractGenerationPage />
      )}
    </div>
  )
}
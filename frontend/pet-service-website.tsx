"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Search, Store, BookOpen, User } from "lucide-react"
import LoginModal from "./login-modal"
import SignupModal from "./signup-modal"
import PasswordRecoveryModal from "./password-recovery-modal"
import MyPage from "./my-page" // Import the new MyPage component

import AdoptionPage from "./adoption-page"
import AdoptionDetailPage from "./adoption-detail-page"
import StorePage from "./store-page"
import StoreProductDetailPage from "./store-product-detail-page"
import StoreProductRegistrationPage from "./store-product-registration-page"
import PetInsurancePage from "./pet-insurance-page"
import InsuranceDetailPage from "./insurance-detail-page"
import GrowthDiaryPage from "./growth-diary-page"
import DiaryEntryDetail from "./diary-entry-detail"
import CommunityPage from "./community-page"
import CommunityDetailPage from "./community-detail-page"
import CommunityWritePage from "./community-write-page"
import DogResearchLabPage from "./dog-research-lab-page"
import AnimalRegistrationPage from "./animal-registration-page"
import WishlistPage from "./wishlist-page"
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
  image: string
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
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null)
  const [oauthMessage, setOauthMessage] = useState<string | null>(null)

  // OAuth 콜백 처리
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const success = urlParams.get("success")
    const error = urlParams.get("error")

    if (success) {
      setOauthMessage(`OAuth 로그인 성공: ${success}`)
      setIsLoggedIn(true)
      setCurrentUser({ email: "oauth@example.com", name: "OAuth 사용자" })
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
  const [selectedInsurance, setSelectedInsurance] = useState<Insurance | null>(null)
  const [selectedDiaryEntry, setSelectedDiaryEntry] = useState<DiaryEntry | null>(null)
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null)
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
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

  const [orders, setOrders] = useState<OrderItem[]>([
    {
      id: 1,
      productId: 1,
      productName: "프리미엄 강아지 사료 (성견용)",
      price: 45000,
      quantity: 1,
      orderDate: "2024-03-01",
      status: "completed",
      image: "/placeholder.svg?height=100&width=100",
    },
    {
      id: 2,
      productId: 2,
      productName: "고양이 장난감 세트",
      price: 25000,
      quantity: 2,
      orderDate: "2024-03-10",
      status: "pending",
      image: "/placeholder.svg?height=100&width=100",
    },
  ])

  // Event handlers
  const handleLogin = (email: string, password: string) => {
    setIsLoggedIn(true)
    setCurrentUser({ email, name: email.split("@")[0] })

    // 관리자 계정 확인 (admin 또는 admin@test.com)
    if (email === "admin" || email === "admin@test.com") {
      setIsAdmin(true)
      console.log("관리자로 로그인됨:", email)
      setCurrentPage("admin") // 관리자로 로그인 시 관리자 페이지로 자동 이동
    } else {
      setIsAdmin(false)
      console.log("일반 사용자로 로그인됨:", email)
      setCurrentPage("home") // 일반 사용자 로그인 시 홈으로 이동 (또는 현재 페이지 유지)
    }

    setShowLoginModal(false)
  }

  const handleSignup = (userData: any) => {
    console.log("회원가입 데이터:", userData)
    // 회원가입 후 자동 로그인
    setIsLoggedIn(true)
    setCurrentUser({ email: userData.email, name: userData.name })
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
        if (selectedProduct) {
          return (
            <StoreProductDetailPage
              product={selectedProduct}
              onBack={() => setSelectedProduct(null)}
              onAddToWishlist={handleAddToWishlist}
              isInWishlist={isInWishlist}
              onPurchase={(product) => {
                console.log("구매:", product)
                alert(`${product.name}을(를) 구매합니다.`)
              }}
            />
          )
        }
        return (
          <StorePage
            onClose={() => setCurrentPage("home")}
            onAddToWishlist={handleAddToWishlist}
            isInWishlist={isInWishlist}
            isAdmin={isAdmin}
            isLoggedIn={isLoggedIn}
            onNavigateToStoreRegistration={() => setCurrentPage("storeRegistration")}
            products={products}
            onViewProduct={setSelectedProduct}
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
                audioUrl: entryData.audioUrl, // 음성 URL 추가
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

      case "wishlist":
        return (
          <WishlistPage
            wishlistItems={wishlist}
            onRemoveFromWishlist={(id) => {
              setWishlist((prev) => prev.filter((item) => item.id !== id))
            }}
            onNavigateToStore={() => setCurrentPage("store")}
            onPurchase={(items) => {
              if (Array.isArray(items)) {
                console.log("구매:", items)
                alert(`${items.length}개 상품을 구매합니다.`)
              }
            }}
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
            userOrders={orders} // Pass all orders for now, ideally filtered by user
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
                        <button onClick={() => setCurrentPage("wishlist")} className="text-center space-y-2 w-full">
                          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto relative">
                            <Heart className="w-8 h-8 text-green-600 fill-green-600" />
                            {wishlist.length > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {wishlist.length}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium">찜한 상품</p>
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

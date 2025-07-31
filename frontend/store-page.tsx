"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Heart, Plus } from "lucide-react"

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

interface StorePageProps {
  onClose: () => void
  onAddToWishlist: (item: WishlistItem) => void
  isInWishlist: (id: number) => boolean
  isAdmin: boolean
  isLoggedIn: boolean
  onNavigateToStoreRegistration: () => void
  products: Product[]
  onViewProduct: (product: Product) => void
}

export default function StorePage({
  onClose,
  onAddToWishlist,
  isInWishlist,
  isAdmin,
  isLoggedIn,
  onNavigateToStoreRegistration,
  products,
  onViewProduct,
}: StorePageProps) {
  const [activeTab, setActiveTab] = useState<"situation" | "category">("situation")
  const [selectedPet, setSelectedPet] = useState<"dog" | "cat">("dog")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"popular" | "latest" | "lowPrice" | "highPrice">("popular")
  const [selectedTag, setSelectedTag] = useState<string | null>(null); // New state for selected tag/category

  const handleSelectCategory = (key: string) => {
    setSelectedTag(key);
  };

  // Sample products data
  const sampleProducts: Product[] = [
    {
      id: 1,
      name: "[왕로하스닭] 강아지케이크 (고구마 치킨 버전)",
      brand: "왕로하스닭",
      price: 21000,
      image: "/placeholder.svg?height=200&width=200&text=Dog+Cake",
      category: "간식",
      description: "강아지를 위한 특별한 케이크",
      tags: ["케이크", "생일", "간식"],
      stock: 15,
      registrationDate: "2024-01-15",
      registeredBy: "admin",
      petType: "dog",
    },
    {
      id: 2,
      name: "강아지 케이크 - 댕댕놈부 강아지 수제 생일 케이크 맞춤 주문 제작",
      brand: "댕댕놈부",
      price: 16300,
      image: "/placeholder.svg?height=200&width=200&text=Custom+Cake",
      category: "간식",
      description: "맞춤 제작 강아지 생일 케이크",
      tags: ["맞춤제작", "생일", "케이크"],
      stock: 8,
      registrationDate: "2024-01-14",
      registeredBy: "admin",
      petType: "dog",
    },
    {
      id: 3,
      name: "애니몰 강아지 고양이 단가슴살 미트 케이크",
      brand: "애니몰",
      price: 9900,
      image: "/placeholder.svg?height=200&width=200&text=Meat+Cake",
      category: "간식",
      description: "단백질이 풍부한 미트 케이크",
      tags: ["단백질", "건강", "케이크"],
      stock: 25,
      registrationDate: "2024-01-13",
      registeredBy: "admin",
      petType: "all",
    },
    {
      id: 4,
      name: "댕댕 강아지 생일파티 레터링 케이크",
      brand: "댕댕",
      price: 20900,
      image: "/placeholder.svg?height=200&width=200&text=Birthday+Cake",
      category: "간식",
      description: "레터링이 가능한 생일 케이크",
      tags: ["생일파티", "레터링", "케이크"],
      stock: 12,
      registrationDate: "2024-01-12",
      registeredBy: "admin",
      petType: "dog",
    },
    {
      id: 5,
      name: "나우프레쉬와 퍼피 그레인프리 스몰브리드 강아지사료",
      brand: "나우프레쉬",
      price: 31080,
      image: "/placeholder.svg?height=200&width=200&text=Dog+Food",
      category: "사료",
      description: "소형견을 위한 그레인프리 사료",
      tags: ["그레인프리", "소형견", "사료"],
      stock: 30,
      registrationDate: "2024-01-11",
      registeredBy: "admin",
      petType: "dog",
    },
  ]

  const allProducts = [...products, ...sampleProducts]

  const situationCategories = [
    { icon: "🐕", name: "의상", key: "clothing" },
    { icon: "💊", name: "간식 관리", key: "treats" },
    { icon: "🎂", name: "기념일", key: "celebration" },
    { icon: "✈️", name: "여행", key: "travel" },
    { icon: "🦮", name: "산책", key: "walk" },
    { icon: "🏠", name: "분리불안", key: "separation" },
    { icon: "📋", name: "일치 관리", key: "management" },
  ]

  const categoryItems = [
    { icon: "🐕", name: "간식", key: "treats" },
    { icon: "🛏️", name: "매트", key: "mat" },
    { icon: "🥣", name: "사료", key: "food" },
    { icon: "🥣", name: "식기", key: "bowl" },
    { icon: "💊", name: "영양제", key: "supplement" },
    { icon: "🧻", name: "위생", key: "hygiene" },
    { icon: "🎒", name: "이동장", key: "carrier" },
    { icon: "🎾", name: "장난감", key: "toy" },
    { icon: "🏠", name: "집/하우스", key: "house" },
    { icon: "👕", name: "패션", key: "fashion" },
  ]

  const situationTags = [
    "건사료",
    "배변패드",
    "목욕/구강",
    "가습기",
    "기능간식",
    "노즈워크",
    "트릿",
    "이동가방",
    "실루/사료",
  ]

  const categoryTags = [
    "진짜보기",
    "껌",
    "비스킷",
    "올로",
    "저알러지 간식",
    "치킨/스틱",
    "츄르",
    "캔/파우치",
    "케이크",
    "트릿",
  ]

  const handleAddToWishlist = (product: Product) => {
    const wishlistItem: WishlistItem = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      category: product.category,
    }
    onAddToWishlist(wishlistItem)
  }

  const sortedProducts = [...allProducts].sort((a, b) => {
    switch (sortBy) {
      case "latest":
        return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()
      case "lowPrice":
        return a.price - b.price
      case "highPrice":
        return b.price - a.price
      default:
        return 0
    }
  })

  const filteredProducts = allProducts.filter((product) => {
    // Pet type filter
    if (selectedPet === "dog" && product.petType !== "dog" && product.petType !== "all") {
      return false;
    }
    if (selectedPet === "cat" && product.petType !== "cat" && product.petType !== "all") {
      return false;
    }

    // Category/Tag filter
    if (selectedTag) {
      const normalizedSelectedTag = selectedTag.toLowerCase();
      const matchesCategory = product.category.toLowerCase().includes(normalizedSelectedTag);
      const matchesTag = product.tags.some(tag => tag.toLowerCase().includes(normalizedSelectedTag));
      if (!matchesCategory && !matchesTag) {
        return false;
      }
    }

    // Search query filter
    if (searchQuery.trim() !== "") {
      const lowerCaseQuery = searchQuery.toLowerCase();
      if (
        !product.name.toLowerCase().includes(lowerCaseQuery) &&
        !product.description.toLowerCase().includes(lowerCaseQuery) &&
        !product.brand.toLowerCase().includes(lowerCaseQuery)
      ) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case "latest":
        return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
      case "lowPrice":
        return a.price - b.price;
      case "highPrice":
        return b.price - a.price;
      default:
        // For 'popular', we might need a dummy value or a more complex logic.
        // For now, let's keep it as is, or use a stable sort.
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">스토어</h1>
            <p className="text-gray-600">반려동물을 위한 다양한 상품을 만나보세요</p>
          </div>
        
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-md">
            <Input
              type="text"
              placeholder="소량 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-4 pr-12 py-3 border-2 border-yellow-300 rounded-full focus:border-yellow-400 focus:ring-yellow-400"
            />
            <Button
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-full p-2"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Pet Selection */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setSelectedPet("dog")}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedPet === "dog" ? "bg-yellow-400 text-black" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              🐕 강아지
            </button>
            <button
              onClick={() => setSelectedPet("cat")}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedPet === "cat" ? "bg-yellow-400 text-black" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              🐱 고양이
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("situation")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "situation" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              상황별
            </button>
            <button
              onClick={() => setActiveTab("category")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "category" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              카테고리별
            </button>
          </div>
        </div>

        {/* Category Icons */}
        <div className="mb-8">
          <div className="grid grid-cols-4 md:grid-cols-7 gap-6 max-w-4xl mx-auto">
            {(activeTab === "situation" ? situationCategories : categoryItems).map((category) => (
              <button key={category.key} className={`flex flex-col items-center space-y-2 group ${selectedTag === category.name ? 'text-blue-600' : ''}`} onClick={() => handleSelectCategory(category.name)}>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl group-hover:bg-gray-200 transition-colors">
                  {category.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {(activeTab === "situation" ? situationTags : categoryTags).map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className={`bg-yellow-100 text-yellow-800 hover:bg-yellow-200 cursor-pointer px-4 py-2 ${selectedTag === tag ? 'border-2 border-yellow-500' : ''}`}
              onClick={() => handleSelectCategory(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Sort Options */}
        <div className="flex justify-end mb-6">
          <div className="flex items-center space-x-4 text-sm">
            <button
              onClick={() => setSortBy("popular")}
              className={`font-medium ${sortBy === "popular" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              ● 인기순
            </button>
            <button
              onClick={() => setSortBy("latest")}
              className={`font-medium ${sortBy === "latest" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              최신순
            </button>
            <button
              onClick={() => setSortBy("lowPrice")}
              className={`font-medium ${sortBy === "lowPrice" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
            >
              낮은 가격순
            </button>
            <button
              onClick={() => setSortBy("highPrice")}
              className={`font-medium ${
                sortBy === "highPrice" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              높은 가격순
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {filteredProducts.map((product, index) => (
            <Card key={product.id} className="group cursor-pointer hover:shadow-lg transition-shadow relative">
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold z-10">
                  Best
                </div>
              )}
              <div className="relative" onClick={() => onViewProduct(product)}>
                <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddToWishlist(product)
                  }}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                >
                  <Heart
                    className={`w-4 h-4 ${isInWishlist(product.id) ? "text-red-500 fill-red-500" : "text-gray-400"}`}
                  />
                </button>
              </div>
              <CardContent className="p-4" onClick={() => onViewProduct(product)}>
                <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
                <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 leading-tight">{product.name}</h3>
                <p className="text-lg font-bold text-gray-900">{product.price.toLocaleString()}원</p>
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                    <span className="text-white font-bold">품절</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">등록된 상품이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}

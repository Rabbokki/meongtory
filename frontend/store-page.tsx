"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus } from "lucide-react"
import { productApi, naverApi } from "@/lib/api"

interface Product {
  id: number
  name: string
  price: number
  imageUrl: string
  category: string
  description: string
  tags: string[]
  stock: number
  petType?: "dog" | "cat" | "all"
  targetAnimal?: "ALL" | "DOG" | "CAT"
  registrationDate: string
  registeredBy: string
}

interface NaverProduct {
  title: string
  link: string
  image: string
  lprice: number
  hprice: number
  mallName: string
}

interface StorePageProps {
  onClose: () => void
  isAdmin: boolean
  isLoggedIn: boolean
  onNavigateToStoreRegistration: () => void
  products: Product[]
  onViewProduct: (product: Product) => void
}

export default function StorePage({
  onClose,
  isAdmin,
  isLoggedIn,
  onNavigateToStoreRegistration,
  products: initialProducts,
  onViewProduct,
}: StorePageProps) {
  const [selectedPet, setSelectedPet] = useState<"dog" | "cat">("dog")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"popular" | "latest" | "lowPrice" | "highPrice">("popular")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [naverProducts, setNaverProducts] = useState<NaverProduct[]>([])
  const [isSearchingNaver, setIsSearchingNaver] = useState(false)
  const [searchMode, setSearchMode] = useState<"store" | "naver">("store")

  const fetchProducts = async () => {
    try {
      console.log('상품 목록 가져오기 시작...')
      const response = await productApi.getProducts()
      console.log('가져온 상품 데이터:', response)

      const data: Product[] = response.map((item: any) => ({
        ...item,
        id: item.productId,
        imageUrl: item.imageUrl,
        petType: item.targetAnimal?.toLowerCase() || 'all'
      }))

      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.registrationDate).getTime()
        const dateB = new Date(b.registrationDate).getTime()
        return dateB - dateA
      })

      setProducts(sortedData)
    } catch (error) {
      console.error("Error fetching products:", error)
      alert("상품 목록을 가져오는데 실패했습니다.")
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    (window as any).refreshStoreProducts = fetchProducts
    return () => {
      delete (window as any).refreshStoreProducts
    }
  }, [])

  const searchNaverProducts = async () => {
    if (!searchQuery.trim()) return

    setIsSearchingNaver(true)
    try {
      console.log('네이버 상품 검색 시작:', searchQuery)
      const response = await naverApi.searchProducts({
        query: searchQuery,
        display: 20,
        start: 1,
        sort: "sim"
      })

      if (typeof response === 'string' && response.includes('<!DOCTYPE html>')) {
        console.error('백엔드에서 로그인 페이지로 리다이렉트됨')
        alert('인증이 필요합니다. 로그인 페이지로 이동합니다.')
        window.location.href = '/login'
        return
      }

      if (response && response.items) {
        setNaverProducts(response.items || [])
        setSearchMode("naver")
      } else {
        console.error('예상치 못한 응답 형식:', response)
        alert('검색 결과를 가져올 수 없습니다.')
      }
    } catch (error) {
      console.error('네이버 검색 실패:', error)
      if (error.response) {
        console.error('응답 상태:', error.response.status)
        console.error('응답 데이터:', error.response.data)
        if (error.response.status === 401) {
          alert('인증이 필요합니다. 로그인 페이지로 이동합니다.')
          window.location.href = '/login'
        } else if (error.response.status === 403) {
          alert('접근이 거부되었습니다.')
        } else {
          alert(`검색에 실패했습니다. (${error.response.status})`)
        }
      } else {
        alert('네이버 검색에 실패했습니다. 서버와의 연결을 확인해주세요.')
      }
    } finally {
      setIsSearchingNaver(false)
    }
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      if (searchMode === "naver") {
        searchNaverProducts()
      } else {
        // 스토어 검색은 필터링으로 처리됨
        setProducts([...products]) // 상태 업데이트로 필터링 트리거
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category)
  }

  const allProducts = [...products]

  const categoryItems = [
    { icon: "🥣", name: "사료", key: "사료" },
    { icon: "🐕", name: "간식", key: "간식" },
    { icon: "🎾", name: "장난감", key: "장난감" },
    { icon: "🛏️", name: "용품", key: "용품" },
    { icon: "👕", name: "의류", key: "의류" },
    { icon: "💊", name: "건강관리", key: "건강관리" },
  ]

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
    const petType = product.petType || product.targetAnimal?.toLowerCase() || 'all'
    if (selectedPet === "dog" && petType !== "dog" && petType !== "all") {
      return false
    }
    if (selectedPet === "cat" && petType !== "cat" && petType !== "all") {
      return false
    }

    if (selectedCategory) {
      const matchesCategory = product.category === selectedCategory
      if (!matchesCategory) {
        return false
      }
    }

    if (searchQuery.trim() !== "" && searchMode === "store") {
      const lowerCaseQuery = searchQuery.toLowerCase()
      if (
        !product.name.toLowerCase().includes(lowerCaseQuery) &&
        !product.description.toLowerCase().includes(lowerCaseQuery)
      ) {
        return false
      }
    }
    return true
  })

  const sortedAndFilteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "latest":
        return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()
      case "lowPrice":
        return a.price - b.price
      case "highPrice":
        return b.price - a.price
      case "popular":
        return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime()
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">스토어</h1>
            <p className="text-gray-600">반려동물을 위한 다양한 상품을 만나보세요</p>
          </div>
          <div className="flex bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setSearchMode("store")}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                searchMode === "store" ? "bg-yellow-400 text-black" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              🏪 내 스토어
            </button>
            <button
              onClick={() => setSearchMode("naver")}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                searchMode === "naver" ? "bg-yellow-400 text-black" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              🔍 네이버 검색
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-8">
          <div className="relative w-full max-w-md">
            <Input
              type="text"
              placeholder={searchMode === "store" ? "내 스토어 상품 검색" : "네이버에서 상품 검색"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-4 pr-12 py-3 border-2 border-yellow-300 rounded-full focus:border-yellow-400 focus:ring-yellow-400"
            />
            <Button
              size="sm"
              onClick={handleSearch}
              disabled={isSearchingNaver}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-yellow-400 hover:bg-yellow-500 text-black rounded-full p-2"
            >
              {isSearchingNaver ? (
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Pet Selection */}
        {searchMode === "store" && (
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
        )}

        {/* Category Icons */}
        {searchMode === "store" && (
          <div className="mb-8">
            <div className="grid grid-cols-4 md:grid-cols-7 gap-6 max-w-4xl mx-auto">
              {categoryItems.map((category) => (
                <button
                  key={category.key}
                  className={`flex flex-col items-center space-y-2 group ${selectedCategory === category.key ? 'text-blue-600' : ''}`}
                  onClick={() => handleSelectCategory(category.key)}
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl group-hover:bg-gray-200 transition-colors">
                    {category.icon}
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sort Options */}
        {searchMode === "store" && (
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
                className={`font-medium ${sortBy === "highPrice" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                높은 가격순
              </button>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {searchMode === "store" ? (
            sortedAndFilteredProducts.map((product, index) => (
              <Card key={`${product.id}-${index}`} className="group cursor-pointer hover:shadow-lg transition-shadow relative">
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold z-10">
                    Best
                  </div>
                )}
                <div className="relative" onClick={() => onViewProduct(product)}>
                  <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                    <img
                      src={product.imageUrl || "/placeholder.svg"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                </div>
                <CardContent className="p-4" onClick={() => onViewProduct(product)}>
                  <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 leading-tight">{product.name}</h3>
                  <p className="text-lg font-bold text-gray-900">{product.price.toLocaleString()}원</p>
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <span className="text-white font-bold">품절</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            naverProducts.map((product, index) => (
              <Card key={`naver-${index}`} className="group cursor-pointer hover:shadow-lg transition-shadow relative">
                <div className="relative">
                  <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                    <img
                      src={product.image || "/placeholder.svg"}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2 leading-tight">{product.title}</h3>
                  <p className="text-lg font-bold text-gray-900">{product.lprice.toLocaleString()}원</p>
                  <p className="text-xs text-gray-500 mt-1">{product.mallName}</p>
                  <a
                    href={product.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block bg-yellow-400 hover:bg-yellow-500 text-black px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    구매하기
                  </a>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Empty State Messages */}
        {searchMode === "store" && sortedAndFilteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">등록된 상품이 없습니다.</p>
          </div>
        )}
        {searchMode === "naver" && naverProducts.length === 0 && searchQuery && !isSearchingNaver && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
          </div>
        )}
        {searchMode === "naver" && !searchQuery && naverProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">검색어를 입력하고 검색해보세요.</p>
          </div>
        )}
      </div>
    </div>
  )
}
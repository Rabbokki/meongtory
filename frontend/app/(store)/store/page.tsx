"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus } from "lucide-react"
import { useEffect } from "react" // useEffect 추가
import { productApi } from "@/lib/api"

interface Product {
  id: number
  name: string
  price: number
  imageUrl: string // image → imageUrl로 변경
  category: string
  description: string
  tags: string[]
  stock: number
  petType?: "dog" | "cat" | "all"; // Add petType to Product interface
  targetAnimal?: "ALL" | "DOG" | "CAT"; // 백엔드 필드 추가
  registrationDate: string
  registeredBy: string
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
  products: initialProducts, // 기존 products prop을 initialProducts로 변경
  onViewProduct,
}: StorePageProps) {
  const [selectedPet, setSelectedPet] = useState<"dog" | "cat">("dog")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"popular" | "latest" | "lowPrice" | "highPrice">("popular")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // 카테고리 선택 상태
  const [products, setProducts] = useState<Product[]>([]); // 상품 데이터를 위한 새로운 상태 추가

  const fetchProducts = async () => {
    try {
      console.log('상품 목록 가져오기 시작...');
      const response = await productApi.getProducts();
      console.log('가져온 상품 데이터:', response);
      
      // 백엔드 응답을 프론트엔드 형식으로 변환
      const data: Product[] = response.map((item: any) => ({
        ...item,
        id: item.productId,
        imageUrl: item.imageUrl,
        petType: item.targetAnimal?.toLowerCase() || 'all'
      }));
      
      // 최신순으로 정렬 (registrationDate 기준 내림차순)
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.registrationDate).getTime();
        const dateB = new Date(b.registrationDate).getTime();
        return dateB - dateA; // 내림차순 (최신순)
      });
      
      setProducts(sortedData); // 정렬된 데이터로 products 상태 업데이트
    } catch (error) {
      console.error("Error fetching products:", error);
      // 오류 처리 로직 (예: 사용자에게 메시지 표시)
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 상품 목록 새로고침 함수를 외부로 노출
  useEffect(() => {
    // 전역 함수로 등록하여 다른 컴포넌트에서 호출할 수 있도록 함
    (window as any).refreshStoreProducts = fetchProducts;
    
    return () => {
      // 컴포넌트 언마운트 시 전역 함수 제거
      delete (window as any).refreshStoreProducts;
    };
  }, []);

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  // Sample products data -> 이 부분은 이제 필요 없으므로 제거합니다.
  // const sampleProducts: Product[] = [
  //   {
  //     id: 1,
  //     name: "[왕로하스닭] 강아지케이크 (고구마 치킨 버전)",
  //     brand: "왕로하스닭",
  //     price: 21000,
  //     image: "/placeholder.svg?height=200&width=200&text=Dog+Cake",
  //     category: "간식",
  //     description: "강아지를 위한 특별한 케이크",
  //     tags: ["케이크", "생일", "간식"],
  //     stock: 15,
  //     registrationDate: "2024-01-15",
  //     registeredBy: "admin",
  //     petType: "dog",
  //   },
  //   {
  //     id: 2,
  //     name: "강아지 케이크 - 댕댕놈부 강아지 수제 생일 케이크 맞춤 주문 제작",
  //     brand: "댕댕놈부",
  //     price: 16300,
  //     image: "/placeholder.svg?height=200&width=200&text=Custom+Cake",
  //     category: "간식",
  //     description: "맞춤 제작 강아지 생일 케이크",
  //     tags: ["맞춤제작", "생일", "케이크"],
  //     stock: 8,
  //     registrationDate: "2024-01-14",
  //     registeredBy: "admin",
  //     petType: "dog",
  //   },
  //   {
  //     id: 3,
  //     name: "애니몰 강아지 고양이 단가슴살 미트 케이크",
  //     brand: "애니몰",
  //     price: 9900,
  //     image: "/placeholder.svg?height=200&width=200&text=Meat+Cake",
  //     category: "간식",
  //     description: "단백질이 풍부한 미트 케이크",
  //     tags: ["단백질", "건강", "케이크"],
  //     stock: 25,
  //     registrationDate: "2024-01-13",
  //     registeredBy: "admin",
  //     petType: "all",
  //   },
  //   {
  //     id: 4,
  //     name: "댕댕 강아지 생일파티 레터링 케이크",
  //     brand: "댕댕",
  //     price: 20900,
  //     image: "/placeholder.svg?height=200&width=200&text=Birthday+Cake",
  //     category: "간식",
  //     description: "레터링이 가능한 생일 케이크",
  //     tags: ["생일파티", "레터링", "케이크"],
  //     stock: 12,
  //     registrationDate: "2024-01-12",
  //     registeredBy: "admin",
  //     petType: "dog",
  //   },
  //   {
  //     id: 5,
  //     name: "나우프레쉬와 퍼피 그레인프리 스몰브리드 강아지사료",
  //     brand: "나우프레쉬",
  //     price: 31080,
  //     image: "/placeholder.svg?height=200&width=200&text=Dog+Food",
  //     category: "사료",
  //     description: "소형견을 위한 그레인프리 사료",
  //     tags: ["그레인프리", "소형견", "사료"],
  //     stock: 30,
  //     registrationDate: "2024-01-11",
  //     registeredBy: "admin",
  //     petType: "dog",
  //   },
  // ]

  const allProducts = [...products] // products prop 대신 새로 가져온 products 상태 사용

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
    // Pet type filter - targetAnimal 필드 사용
    const petType = product.petType || product.targetAnimal?.toLowerCase() || 'all';
    if (selectedPet === "dog" && petType !== "dog" && petType !== "all") {
      return false;
    }
    if (selectedPet === "cat" && petType !== "cat" && petType !== "all") {
      return false;
    }

    // Category filter
    if (selectedCategory) {
      const matchesCategory = product.category === selectedCategory;
      if (!matchesCategory) {
        return false;
      }
    }

    // Search query filter
    if (searchQuery.trim() !== "") {
      const lowerCaseQuery = searchQuery.toLowerCase();
      if (
        !product.name.toLowerCase().includes(lowerCaseQuery) &&
        !product.description.toLowerCase().includes(lowerCaseQuery)
      ) {
        return false;
      }
    }
    return true;
  });

  // 정렬 로직을 별도로 분리
  const sortedAndFilteredProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "latest":
        return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
      case "lowPrice":
        return a.price - b.price;
      case "highPrice":
        return b.price - a.price;
      case "popular":
        // 인기순은 기본적으로 최신순으로 처리 (실제로는 조회수나 판매량 기준이 필요)
        return new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime();
      default:
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

        {/* Category Icons */}
        <div className="mb-8">
          <div className="grid grid-cols-4 md:grid-cols-7 gap-6 max-w-4xl mx-auto">
            {categoryItems.map((category) => (
              <button key={category.key} className={`flex flex-col items-center space-y-2 group ${selectedCategory === category.key ? 'text-blue-600' : ''}`} onClick={() => handleSelectCategory(category.key)}>
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-2xl group-hover:bg-gray-200 transition-colors">
                  {category.icon}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{category.name}</span>
              </button>
            ))}
          </div>
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
          {sortedAndFilteredProducts.map((product, index) => (
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
          ))}
        </div>

        {sortedAndFilteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">등록된 상품이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
}

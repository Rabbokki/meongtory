"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus } from "lucide-react"
import { useEffect } from "react"
import axios from "axios" // axios 직접 import

const API_BASE_URL = 'http://localhost:8080/api'

// axios 인터셉터 설정 - 요청 시 인증 토큰 자동 추가
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 401 에러 시 토큰 갱신 시도
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/accounts/refresh`, {
            refreshToken: refreshToken
          });
          const newAccessToken = response.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);
          
          // 원래 요청 재시도
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios.request(error.config);
        } catch (refreshError) {
          // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
    }
    return Promise.reject(error);
  }
);

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 상품 API 함수들 - 백엔드와 직접 연결
  const productApi = {
    // 모든 상품 조회
    getProducts: async (): Promise<any[]> => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products`);
        return response.data;
      } catch (error) {
        console.error('상품 목록 조회 실패:', error);
        throw error;
      }
    },

    // 특정 상품 조회
    getProduct: async (productId: number): Promise<any> => {
      try {
        const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
        return response.data;
      } catch (error) {
        console.error('상품 조회 실패:', error);
        throw error;
      }
    },

    // 상품 생성
    createProduct: async (productData: any): Promise<any> => {
      try {
        const response = await axios.post(`${API_BASE_URL}/products`, productData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response.data;
      } catch (error) {
        console.error('상품 생성 실패:', error);
        throw error;
      }
    },

    // 상품 수정
    updateProduct: async (productId: number, productData: any): Promise<any> => {
      try {
        const response = await axios.put(`${API_BASE_URL}/products/${productId}`, productData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return response.data;
      } catch (error) {
        console.error('상품 수정 실패:', error);
        throw error;
      }
    },

    // 상품 삭제
    deleteProduct: async (productId: number): Promise<void> => {
      try {
        await axios.delete(`${API_BASE_URL}/products/${productId}`);
      } catch (error) {
        console.error('상품 삭제 실패:', error);
        throw error;
      }
    },
  };

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('상품 목록 가져오기 시작...');
      
      const response = await productApi.getProducts();
      console.log('가져온 상품 데이터:', response);
      
      // 백엔드 응답을 프론트엔드 형식으로 변환
      const data: Product[] = response.map((item: any) => ({
        ...item,
        id: item.id || item.productId || 0,  // id를 우선 사용
        productId: item.id || item.productId || 0,  // 호환성을 위해 productId도 설정
        imageUrl: item.imageUrl || item.image || '/placeholder.svg',
        petType: item.targetAnimal?.toLowerCase() || 'all',
        price: typeof item.price === 'number' ? item.price : 0,
        stock: typeof item.stock === 'number' ? item.stock : 0,
        category: item.category || '카테고리 없음',
        description: item.description || '상품 설명이 없습니다.',
        tags: item.tags || [],
        registrationDate: item.registrationDate || new Date().toISOString(),
        registeredBy: item.registeredBy || '등록자 없음'
      }));
      
      // 최신순으로 정렬 (registrationDate 기준 내림차순)
      const sortedData = data.sort((a, b) => {
        const dateA = new Date(a.registrationDate).getTime();
        const dateB = new Date(b.registrationDate).getTime();
        return dateB - dateA;
      });
      
      setProducts(sortedData);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError('상품 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 상품 목록 새로고침 함수를 외부로 노출
  useEffect(() => {
    (window as any).refreshStoreProducts = fetchProducts;
    
    return () => {
      delete (window as any).refreshStoreProducts;
    };
  }, []);

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };

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

  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">상품 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchProducts} className="bg-yellow-400 hover:bg-yellow-500 text-black">
            다시 시도
          </Button>
        </div>
      </div>
    )
  }

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
              placeholder="상품 검색"
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

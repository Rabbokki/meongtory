"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ShoppingCart } from "lucide-react"
import Image from "next/image"
import axios from "axios"
import { useRouter } from "next/navigation"


const API_BASE_URL = 'http://localhost:8080/api'

// axios 인터셉터 설정 - 요청 시 인증 토큰 자동 추가
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `${token}`;
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
          error.config.headers.Authorization = `${newAccessToken}`;
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
  registrationDate: string
  registeredBy: string
  petType: "dog" | "cat" | "all"
  targetAnimal?: "ALL" | "DOG" | "CAT"
  brand?: string
}

interface PageProps {
  params?: {
    id: string
  }
  productId?: number
  onBack?: () => void
  onAddToCart?: (product: Product) => void
  onBuyNow?: (product: Product) => void
  isInCart?: (id: number) => boolean
}

export default function StoreProductDetailPage({ 
  params, 
  productId: propProductId,
  onBack: propOnBack,
  onAddToCart: propOnAddToCart,
  onBuyNow: propOnBuyNow,
  isInCart: propIsInCart
}: PageProps) {
  const router = useRouter()
  
  // params에서 productId를 추출하거나 props에서 받기
  const productId = propProductId || (params ? parseInt(params.id) : null)
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1);


  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 주문 내역 상태 추가
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  // 상품 API 함수들 - 백엔드와 직접 연결
  const productApi = {
    // 특정 상품 조회
    getProduct: async (productId: number): Promise<any> => {
      try {
        console.log('상품 조회 요청:', `${API_BASE_URL}/products/${productId}`);
        console.log('요청할 productId:', productId, '타입:', typeof productId);
        
        const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
        console.log('상품 조회 성공:', response.data);
        return response.data;
      } catch (error) {
        console.error('상품 조회 실패:', error);
        if (axios.isAxiosError(error)) {
          console.error('Axios 에러 상세:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
            method: error.config?.method
          });
        }
        throw error;
      }
    },
  };

  // 주문 내역 가져오기
  const fetchOrders = async () => {
    setOrdersLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(`${API_BASE_URL}/orders`, {
        headers: {
          "Access_Token": token,
          "Refresh_Token": localStorage.getItem('refreshToken') || ''
        }
      })
      setOrders(response.data)
    } catch (error) {
      console.error('주문 내역을 가져오는데 실패했습니다:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  // 현재 사용자 정보 가져오기
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (token) {
          const response = await axios.get(`${API_BASE_URL}/accounts/me`, {
            headers: {
              "Access_Token": token,
              "Refresh_Token": localStorage.getItem('refreshToken') || ''
            }
          })
          console.log('사용자 정보 응답:', response.data)
          setCurrentUser(response.data.data)
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error)
      }
    }
    fetchCurrentUser()
  }, [])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('상품 조회 요청 - productId:', productId)
        console.log('productId 타입:', typeof productId)
        console.log('propProductId:', propProductId)
        console.log('params:', params)
        
        if (!productId || isNaN(productId)) {
          throw new Error('유효하지 않은 상품 ID입니다.')
        }
        
        const rawData = await productApi.getProduct(productId)
        console.log('상품 상세 데이터:', rawData);
        
        // 백엔드 응답을 프론트엔드 형식으로 변환
        const data: Product = {
          ...rawData,
          id: rawData.id || rawData.productId || 0,  // id를 우선 사용
          productId: rawData.id || rawData.productId || 0,  // 호환성을 위해 productId도 설정
          name: rawData.name || '상품명 없음',
          price: typeof rawData.price === 'number' ? rawData.price : 0,
          imageUrl: rawData.image || rawData.imageUrl || '/placeholder.svg',
          category: rawData.category || '카테고리 없음',
          description: rawData.description || '상품 설명이 없습니다.',
          petType: rawData.targetAnimal?.toLowerCase() || 'all',
          brand: rawData.brand || '브랜드 없음',
          tags: rawData.tags || [],
          stock: typeof rawData.stock === 'number' ? rawData.stock : 0,
          registrationDate: rawData.registrationDate || '등록일 없음',
          registeredBy: rawData.registeredBy || '등록자 없음'
        };
        
        setProduct(data)
      } catch (error) {
        console.error('상품 조회 오류:', error)
        setError('상품을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const handleBack = () => {
    if (propOnBack) {
      propOnBack()
    } else {
      router.back()
    }
  }

  const handleAddToCart = async (product: Product) => {
    if (propOnAddToCart) {
      // 수량 정보를 포함하여 전달
      const productWithQuantity = {
        ...product,
        selectedQuantity: quantity
      }
      propOnAddToCart(productWithQuantity)
    } else {
      // 장바구니 추가 로직 구현
      console.log('장바구니에 추가:', product, '수량:', quantity)
      
      // 재고 확인
      const stock = typeof product.stock === 'number' ? product.stock : 0
      if (quantity > stock) {
        alert(`재고가 부족합니다. (재고: ${stock}개, 요청: ${quantity}개)`)
        return
      }
      
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          alert('로그인이 필요합니다.')
          return
        }

        // 장바구니 추가 API 호출 (수량 포함)
        const response = await axios.post(`${API_BASE_URL}/carts?productId=${product.id}&quantity=${quantity}`, null, {
          headers: {
            "Access_Token": token,
            "Refresh_Token": localStorage.getItem('refreshToken') || ''
          }
        })

        if (response.status === 200) {
          alert(`장바구니에 ${quantity}개가 추가되었습니다!`)
          // 장바구니 페이지로 이동
          router.push('/store/cart')
        } else {
          alert('장바구니 추가에 실패했습니다.')
        }
      } catch (error: any) {
        console.error('장바구니 추가 오류:', error)
        
        // 백엔드에서 재고 부족 에러 처리
        if (error.response?.data?.message?.includes('재고가 부족합니다')) {
          alert(error.response.data.message)
        } else {
          alert('장바구니 추가에 실패했습니다.')
        }
      }
    }
  }

  const handleBuyNow = async () => {
    console.log('handleBuyNow 함수 호출됨')
    console.log('product:', product)
    console.log('currentUser:', currentUser)
    
    if (!product) {
      console.log('product가 없음')
      return
    }

    // propOnBuyNow가 전달된 경우에도 직접 Payment 페이지로 이동
    // (website/page.tsx에서 사용될 때도 동일하게 처리)

    if (!currentUser) {
      console.log('currentUser가 없음 - 로그인 필요')
      alert('로그인이 필요합니다.')
      return
    }

    if ((typeof product.stock === 'number' ? product.stock : 0) === 0) {
      console.log('품절된 상품')
      alert('품절된 상품입니다.')
      return
    }

    console.log('Payment 페이지로 이동 시도')
    // URL 파라미터를 통해 Payment 페이지로 이동
    const paymentUrl = `/payment?productId=${product.id}&quantity=${quantity}&price=${product.price}&productName=${encodeURIComponent(product.name)}&imageUrl=${encodeURIComponent(product.imageUrl)}`
    console.log('이동할 URL:', paymentUrl)
    router.push(paymentUrl)
  }

  const isInCart = (id: number) => {
    if (propIsInCart) {
      return propIsInCart(id)
    }
    // 장바구니 확인 로직 구현
    return false
  }





  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">상품 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">상품을 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-4">{error || '요청하신 상품이 존재하지 않습니다.'}</p>
            <Button onClick={handleBack}>돌아가기</Button>
          </CardContent>
        </Card>
      </div>
    )
  }





  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={handleBack} className="hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            스토어로 돌아가기
          </Button>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <Card>
            <CardContent className="p-6">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={product.imageUrl || "/placeholder.svg"}
                  alt={product.name}
                  width={500}
                  height={500}
                  className="w-full h-full object-cover"
                />
              </div>
            </CardContent>
          </Card>

          {/* Product Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">{product.name}</CardTitle>
                    <p className="text-gray-600 mt-2">{product.category}</p>
                  </div>

                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-yellow-600">
                    {(typeof product.price === 'number' ? product.price : 0).toLocaleString()}원
                  </span>
                  <Badge variant="outline" className="text-sm">
                    {product.petType === 'all' ? '강아지/고양이' : product.petType === 'dog' ? '강아지' : '고양이'}
                  </Badge>
                </div>



                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    재고: <span className="font-semibold">{typeof product.stock === 'number' ? product.stock : 0}개</span>
                  </p>
                  {(typeof product.stock === 'number' ? product.stock : 0) === 0 && (
                    <Badge variant="destructive" className="text-sm">
                      품절
                    </Badge>
                  )}
                </div>

                {/* 수량 선택 */}
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">수량:</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 p-0"
                    >
                      -
                    </Button>
                    <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setQuantity(Math.min((typeof product.stock === 'number' ? product.stock : 0), quantity + 1))}
                      disabled={quantity >= (typeof product.stock === 'number' ? product.stock : 0)}
                      className="w-8 h-8 p-0"
                    >
                      +
                    </Button>
                  </div>
                  {quantity >= (typeof product.stock === 'number' ? product.stock : 0) && (
                    <span className="text-xs text-red-500">최대 재고 수량입니다</span>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    disabled={(typeof product.stock === 'number' ? product.stock : 0) === 0 || isInCart(product.id)}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {isInCart(product.id) ? '장바구니에 추가됨' : '장바구니에 추가'}
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    variant="outline"
                    disabled={(typeof product.stock === 'number' ? product.stock : 0) === 0 || isLoading}
                    className="flex-1"
                  >
                    {isLoading ? '주문 중...' : '바로 구매'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Product Description */}
            <Card>
              <CardHeader>
                <CardTitle>상품 설명</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {product.description || '상품 설명이 없습니다.'}
                </p>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle>상품 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">카테고리</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">대상 동물</span>
                    <span className="font-medium">
                      {product.targetAnimal === 'ALL' ? '강아지/고양이' : product.targetAnimal === 'DOG' ? '강아지' : product.targetAnimal === 'CAT' ? '고양이' : '알 수 없음'}
                    </span>
                  </div>
 
                  {product.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">태그</span>
                      <div className="flex flex-wrap gap-1">
                        {product.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

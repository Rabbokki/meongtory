"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Sparkles, PawPrint, Clock, ChevronDown } from "lucide-react"
import Image from "next/image"
import axios from "axios"
import { useRouter } from "next/navigation"
import { ProductRecommendationSlider } from "@/components/ui/product-recommendation-slider"
import { useAuth } from "@/components/navigation"
import { getBackendUrl } from '@/lib/api'
import { recentApi } from '@/lib/api'
import { RecentProductsSidebar } from "@/components/ui/recent-products-sidebar"
import { loadSidebarState, updateSidebarState } from "@/lib/sidebar-state"

interface Product {
  id: number
  productId?: string  // 네이버 상품의 경우 원본 productId
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
  const { isAdmin } = useAuth();
  const router = useRouter()
  
  // params에서 productId를 추출하거나 props에서 받기
  let productId: string | number | null = propProductId || (params ? parseInt(params.id) : null)
  
  // URL 파라미터가 인코딩된 문자열인 경우 디코딩
  if (params && params.id && isNaN(parseInt(params.id))) {
    try {
      const decodedId = decodeURIComponent(params.id);
      productId = decodedId;
    } catch (error) {
      console.error('URL 파라미터 디코딩 실패:', error);
      productId = params.id;
    }
  }
  
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1);


  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 주문 내역 상태 추가
  const [orders, setOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  // StoreAI 추천 관련 상태
  const [myPets, setMyPets] = useState<any[]>([]) // 모든 펫 목록
  const [selectedPet, setSelectedPet] = useState<any>(null) // 선택된 펫
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null)
  const isFetchingRecommendationsRef = useRef(false)
  const hasFallbackTriedRef = useRef(false)
  const lastRecommendationKeyRef = useRef<string | null>(null)

  // 최근 본 상품 사이드바
  const [showRecentSidebar, setShowRecentSidebar] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // 사이드바 상태 로드
  useEffect(() => {
    const savedState = loadSidebarState()
    if (savedState.productType === 'store') {
      setShowRecentSidebar(savedState.isOpen)
    }
  }, [])

  // 사이드바 토글 함수
  const handleSidebarToggle = () => {
    const newIsOpen = !showRecentSidebar
    setShowRecentSidebar(newIsOpen)
    updateSidebarState({ isOpen: newIsOpen, productType: 'store' })
  }



  // 상품 API 함수들 - 백엔드와 직접 연결
  const productApi = {
    // 특정 상품 조회
    getProduct: async (productId: number): Promise<any> => {
      try {
        const response = await axios.get(`${getBackendUrl()}/api/products/${productId}`);
        // ResponseDto 구조에서 실제 데이터 추출
        if (response.data && response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data?.error?.message || '상품 조회에 실패했습니다.');
        }
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

    // 네이버 상품 조회
    getNaverProduct: async (productId: string): Promise<any> => {
      try {
        const response = await axios.get(`${getBackendUrl()}/api/naver-shopping/products/${productId}`);
        // ResponseDto 구조에서 실제 데이터 추출
        if (response.data && response.data.success) {
          return response.data.data;
        } else {
          throw new Error(response.data?.error?.message || '네이버 상품 조회에 실패했습니다.');
        }
      } catch (error) {
        console.error('네이버 상품 조회 실패:', error);
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

  // 반려동물 정보 가져오기
  const fetchMyPets = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return

      const response = await axios.get(`${getBackendUrl()}/api/mypet`, {
        headers: {
          "Access_Token": token,
          "Refresh_Token": localStorage.getItem('refreshToken') || ''
        }
      })
      
      // 백엔드 응답 구조: ResponseDto<MyPetListResponseDto>
      if (response.data && response.data.data && response.data.data.myPets && response.data.data.myPets.length > 0) {
        const pets = response.data.data.myPets
        setMyPets(pets)
        // 첫 번째 펫을 기본 선택
        setSelectedPet(pets[0])
      }
    } catch (error) {
      console.error('반려동물 정보 가져오기 실패:', error)
    }
  }

     // StoreAI 추천 API 호출
   const fetchRecommendations = async (petToUse = selectedPet) => {
    if (!petToUse) return

    const key = `${product ? `p:${product.id}` : 'none'}|pet:${petToUse.myPetId}`
    if (lastRecommendationKeyRef.current === key && (recommendations.length > 0 || recommendationsLoading)) {
      return
    }
    if (isFetchingRecommendationsRef.current) return
    isFetchingRecommendationsRef.current = true
    lastRecommendationKeyRef.current = key
    hasFallbackTriedRef.current = false

    setRecommendationsLoading(true)
    setRecommendationsError(null)
    
    try {
      let response
      if (product) {
        try {
          response = await axios.post(`${getBackendUrl()}/api/storeai/recommend/products/${product.id}`, {
            myPetId: petToUse.myPetId,
            recommendationType: 'BREED_SPECIFIC'
          })
        } catch (productRecommendationError) {
          console.error('상품 기반 추천 실패, 펫 기반 추천으로 대체:', productRecommendationError)
          if (!hasFallbackTriedRef.current) {
            hasFallbackTriedRef.current = true
            response = await axios.get(`${getBackendUrl()}/api/storeai/recommend/my-pets`)
          } else {
            throw productRecommendationError
          }
        }
      } else {
        return
      }

      if (response.data.success) {
        let recommendations = []
        
        if (product) {
          // 상품 기반 추천: List<ProductRecommendationResponseDto>
          recommendations = response.data.data || []
        }
        
        setRecommendations(recommendations)
      } else {
        setRecommendationsError('추천을 생성할 수 없습니다.')
      }
    } catch (error) {
      console.error('추천 API 호출 실패:', error)
      setRecommendationsError('추천을 불러오는데 실패했습니다.')
    } finally {
      setRecommendationsLoading(false)
      isFetchingRecommendationsRef.current = false
    }
  }



  // 주문 내역 가져오기
  const fetchOrders = async () => {
    setOrdersLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const response = await axios.get(`${getBackendUrl()}/api/orders`, {
        headers: {
          "Access_Token": token,
          "Refresh_Token": localStorage.getItem('refreshToken') || ''
        }
      })
      setOrders(response.data.data || response.data)
    } catch (error) {
      console.error('주문 내역을 가져오는데 실패했습니다:', error)
    } finally {
      setOrdersLoading(false)
    }
  }

  // 최근 본 상품에 추가하는 함수
  const addToRecentProducts = async (product: Product | any) => {
    const isLoggedIn = typeof window !== 'undefined' && localStorage.getItem('accessToken')
    
    console.log('최근 본 상품 추가 시도:', {
      productId: product.id,
      productName: product.name || product.title,
      isLoggedIn: isLoggedIn,
      productType: 'store'
    })
    
    if (isLoggedIn) {
      // 로그인 시: DB에 저장
      try {
        console.log('DB에 저장 시도:', product.id, 'store')
        await recentApi.addToRecent(product.id, "store")
        console.log('DB 저장 성공')
      } catch (error: any) {
        console.error("최근 본 상품 저장 실패:", error)
        if (error.response) {
          console.error("에러 응답:", error.response.data)
          console.error("에러 상태:", error.response.status)
        }
        // DB 저장 실패 시 localStorage에 저장
        addToLocalRecentProducts(product)
      }
    } else {
      // 비로그인 시: localStorage에 저장
      addToLocalRecentProducts(product)
      
      // localStorage 변경 이벤트 발생 (다른 탭/컴포넌트에서 감지)
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'recentStoreProducts',
        newValue: localStorage.getItem('recentStoreProducts')
      }))
    }
  }

  // localStorage 관련 함수들
  type SimplifiedProduct = {
    id: number
    naverProductId?: string
    name: string
    title?: string
    imageUrl: string
    type: string
    price?: number
  }

  const getLocalRecentProducts = (): SimplifiedProduct[] => {
    try {
      const stored = localStorage.getItem('recentStoreProducts')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  const addToLocalRecentProducts = (product: Product) => {
    try {
      const products = getLocalRecentProducts()
      
      // 중복 체크 - 더 정확한 중복 확인
      const existingIndex = products.findIndex(p => {
        // 일반 상품인 경우 id로만 체크 (다른 상품이어도 중복 처리하지 않음)
        return p.id === product.id
      })
      
      if (existingIndex > -1) {
        // 기존 항목 제거
        products.splice(existingIndex, 1)
      }
      
      // 필요한 정보만 추출하여 저장
      const simplifiedProduct: SimplifiedProduct = {
        id: product.id,
        naverProductId: undefined,
        name: (product as Product).name,
        title: (product as Product).name,
        imageUrl: product.imageUrl,
        type: 'store',
        price: product.price
      }
      
      // 새 항목을 맨 앞에 추가 (최신순)
      products.unshift(simplifiedProduct)
      
      // 최대 15개만 유지
      if (products.length > 15) {
        products.splice(15)
      }
      
      localStorage.setItem('recentStoreProducts', JSON.stringify(products))
      console.log('localStorage에 최근 본 상품 추가됨:', simplifiedProduct)
    } catch (error) {
      console.error("localStorage 저장 실패:", error)
    }
  }

  // 현재 사용자 정보 가져오기
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (token) {
          const response = await axios.get(`${getBackendUrl()}/api/accounts/me`, {
            headers: {
              "Access_Token": token,
              "Refresh_Token": localStorage.getItem('refreshToken') || ''
            }
          })
          setCurrentUser(response.data.data)
        }
      } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error)
      }
    }
    fetchCurrentUser()
  }, [])

  // 반려동물 정보 가져오기
  useEffect(() => {
    fetchMyPets()
  }, [])

     // 반려동물 정보가 있으면 추천 가져오기
   useEffect(() => {
     if (selectedPet && product) {
       fetchRecommendations()
     }
   }, [selectedPet, product])

   // 펫 선택 변경 핸들러
   const handlePetChange = (petId: string) => {
     const selected = myPets.find(pet => pet.myPetId.toString() === petId)
     if (selected) {
       setSelectedPet(selected)
     }
   }

  useEffect(() => {
    // 상품 조회 함수
    const fetchProduct = async () => {
      try {
        setLoading(true)
        setError(null)

        
        if (!productId) {
          throw new Error('유효하지 않은 상품 ID입니다.')
        }

        let rawData: any;
        
        // URL의 productId로 상품 조회 (내부 상품만)
        const numericProductId = Number(productId);
        if (!isNaN(numericProductId)) {
          rawData = await productApi.getProduct(numericProductId);
        } else {
          throw new Error('유효하지 않은 상품 ID입니다.')
        }
        
        console.log('상품 상세 데이터:', rawData);
        
        // 백엔드 응답을 프론트엔드 형식으로 변환 (내부 상품만)
        const data: Product = {
          ...rawData,
          id: rawData.id || Number(productId) || 0,  // DB의 자동 생성 ID 또는 URL의 productId
          name: (rawData.name || '상품명 없음').replace(/<[^>]*>/g, ''),
          price: typeof rawData.price === 'number' ? rawData.price : 0,
          imageUrl: rawData.image || rawData.imageUrl || '/placeholder.svg',
          category: rawData.category || '카테고리 없음',
          description: (rawData.description || '상품 설명이 없습니다.').replace(/<[^>]*>/g, ''),
          petType: 'all',
          brand: rawData.brand || '브랜드 없음',
          tags: rawData.tags || [],
          stock: typeof rawData.stock === 'number' ? rawData.stock : 0,
          registrationDate: rawData.registrationDate || rawData.createdAt || '등록일 없음',
          registeredBy: rawData.registeredBy || '등록자 없음'
        };
        
        console.log('상품 데이터 설정:', {
          id: data.id,
          name: data.name,
          productId: productId,
          rawDataId: rawData.id,
          urlProductId: productId
        })
        
        setProduct(data)
        
        // 최근 본 상품에 추가 (내부 상품만)
        addToLocalRecentProducts(data)
        
        // 로그인 시 백엔드에도 추가
        const token = localStorage.getItem('accessToken')
        if (token) {
          try {
            await recentApi.addToRecent(data.id, 'store')
          } catch (error) {
            console.error('백엔드 최근본 추가 실패:', error)
          }
        }
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

        // 백엔드 응답에서 네이버 상품 여부 확인
        const isNaverProduct = product.productId && product.registeredBy === '네이버';
        let response: any;
        
        if (isNaverProduct) {
          // 네이버 상품인 경우 네이버 상품용 API 호출
          
          const naverProductData = {
            productId: product.productId,
            title: product.name,
            description: product.description,
            price: product.price,
            imageUrl: product.imageUrl,
            mallName: '네이버 쇼핑',
            productUrl: '',
            brand: product.brand || '',
            maker: '',
            category1: product.category,
            category2: '',
            category3: '',
            category4: '',
            reviewCount: 0,
            rating: 0.0,
            searchCount: 0
          }
          
          response = await axios.post(`${getBackendUrl()}/api/naver-shopping/cart/add`, naverProductData, {
            params: { quantity },
            headers: {
              "Access_Token": token,
              "Refresh_Token": localStorage.getItem('refreshToken') || '',
              "Content-Type": "application/json"
            }
          })
        } else {
          // 일반 상품인 경우 일반 상품용 API 호출
          
          response = await axios.post(`${getBackendUrl()}/api/carts?productId=${product.id}&quantity=${quantity}`, null, {
            headers: {
              "Access_Token": token,
              "Refresh_Token": localStorage.getItem('refreshToken') || ''
            }
          })
        }

        if (response.status === 200 && response.data.success) {
          alert(`장바구니에 ${quantity}개가 추가되었습니다!`)
          
          // 장바구니 추가 성공 후 cart 페이지로 이동
          router.push('/store/cart')
        } else {
          throw new Error(response.data?.error?.message || '장바구니 추가에 실패했습니다.')
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
    if (!product) {
      return
    }

    // propOnBuyNow가 전달된 경우에도 직접 Payment 페이지로 이동
    // (website/page.tsx에서 사용될 때도 동일하게 처리)

    if (!currentUser) {
      alert('로그인이 필요합니다.')
      return
    }

    if ((typeof product.stock === 'number' ? product.stock : 0) === 0) {
      alert('품절된 상품입니다.')
      return
    }

    // 네이버 상품인지 확인 (productId 필드가 있고 registeredBy가 '네이버'인 경우)
    const isNaverProduct = product.productId && product.registeredBy === '네이버';

    if (isNaverProduct) {
      
             try {
         // 네이버 상품을 DB에 저장하고 실제 ID를 받아옴
         const response = await axios.post(`${getBackendUrl()}/api/naver-shopping/save`, {
           productId: product.productId,
           title: product.name,
           description: product.description,
           price: product.price,
           imageUrl: product.imageUrl,
           productUrl: '',
           mallName: '네이버 쇼핑',
           brand: product.brand || '',
           maker: ''
         }, {
           headers: {
             'Access_Token': localStorage.getItem('accessToken') || '',
             'Refresh_Token': localStorage.getItem('refreshToken') || '',
             'Content-Type': 'application/json'
           }
         });

         const result = response.data;
        
        // 새로운 응답 형식 처리
        let productId;
        if (result.success && result.data) {
          productId = result.data.productId;
        } else {
          throw new Error('네이버 상품 저장에 실패했습니다.');
        }
        
                 // URL 파라미터를 통해 Payment 페이지로 이동 (네이버 상품이므로 isNaverProduct=true)
         const cleanProductName = product.name.replace(/<[^>]*>/g, ''); // HTML 태그 제거
         const paymentUrl = `/payment?productId=${productId}&quantity=${quantity}&price=${product.price}&productName=${encodeURIComponent(cleanProductName)}&imageUrl=${encodeURIComponent(product.imageUrl)}&isNaverProduct=true`;
        router.push(paymentUrl);
      } catch (error) {
        console.error('네이버 상품 DB 저장 실패:', error);
        alert('상품 정보를 준비하는 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
    } else {
      // URL 파라미터를 통해 Payment 페이지로 이동 (일반 상품이므로 isNaverProduct=false 명시)
      const cleanProductName = product.name.replace(/<[^>]*>/g, ''); // HTML 태그 제거
      const paymentUrl = `/payment?productId=${product.id}&quantity=${quantity}&price=${product.price}&productName=${encodeURIComponent(cleanProductName)}&imageUrl=${encodeURIComponent(product.imageUrl)}&isNaverProduct=false`
      router.push(paymentUrl)
    }
  }

  const isInCart = (id: number) => {
    if (propIsInCart) {
      return propIsInCart(id)
    }
    // 장바구니 확인 로직 구현
    return false
  }

  // 네이버 상품의 재고 상태 확인
  const isNaverProductInStock = () => {
    return (product?.stock || 0) > 0
  }

                                               // 추천 상품 장바구니 추가
      const handleRecommendationAddToCart = async (productId: number, productInfo?: any) => {
        try {
          
          if (!productId || isNaN(productId)) {
            alert('유효하지 않은 상품 ID입니다.')
            return
          }

          const token = localStorage.getItem('accessToken')
          if (!token) {
            alert('로그인이 필요합니다.')
            return
          }

          // 추천 상품이 네이버 상품인지 확인
          const isNaverProduct = productInfo?.source === 'NAVER' || productInfo?.externalProductUrl;

          let response: any;

          if (isNaverProduct) {
            // 네이버 상품인 경우 네이버 상품용 API 호출

            const naverProductData = {
              productId: String(productId),
              title: productInfo?.name || '네이버 상품',
              description: productInfo?.description || productInfo?.name || '네이버 상품',
              price: productInfo?.price || 0,
              imageUrl: productInfo?.imageUrl || '',
              mallName: productInfo?.externalMallName || '네이버 쇼핑',
              productUrl: productInfo?.externalProductUrl || '',
              brand: productInfo?.brand || '',
              maker: '',
              category1: productInfo?.category || '',
              category2: '',
              category3: '',
              category4: '',
              reviewCount: 0,
              rating: 0.0,
              searchCount: 0
            }

            response = await axios.post(`${getBackendUrl()}/api/naver-shopping/cart/add`, naverProductData, {
              params: { quantity: 1 },
              headers: {
                "Access_Token": token,
                "Refresh_Token": localStorage.getItem('refreshToken') || '',
                "Content-Type": "application/json"
              }
            })
          } else {
            // 일반 상품인 경우 일반 상품용 API 호출
            response = await axios.post(`${getBackendUrl()}/api/carts?productId=${productId}&quantity=1`, null, {
              headers: {
                "Access_Token": token,
                "Refresh_Token": localStorage.getItem('refreshToken') || ''
              }
            })
          }

          if (response.status === 200 && response.data.success) {
            alert('장바구니에 추가되었습니다!')
            // 장바구니 페이지로 이동
            router.push('/store/cart')
          } else {
            alert('장바구니 추가에 실패했습니다.')
          }
        } catch (error: any) {
          console.error('추천 상품 장바구니 추가 오류:', error)
          console.error('에러 상세 정보:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            url: error.config?.url
          })
          
          // 백엔드에서 재고 부족 에러 처리
          if (error.response?.data?.message?.includes('재고가 부족합니다')) {
            alert(error.response.data.message)
          } else if (error.response?.status === 400) {
            alert('이미 장바구니에 있는 상품입니다.')
          } else {
            alert('장바구니 추가에 실패했습니다.')
          }
        }
      }

  // 추천 상품 위시리스트 추가
  const handleRecommendationAddToWishlist = async (productId: number) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        alert('로그인이 필요합니다.')
        return
      }

      // 위시리스트 추가 API 호출 (실제 구현 필요)
      alert('위시리스트에 추가되었습니다!')
    } catch (error) {
      console.error('위시리스트 추가 오류:', error)
      alert('위시리스트 추가에 실패했습니다.')
    }
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
                   {(product.description || '상품 설명이 없습니다.').replace(/<[^>]*>/g, '')}
                 </p>
               </CardContent>
             </Card>

            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">카테고리</span>
                    <span className="font-medium">{product.category}</span>
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

        {/* AI 추천 섹션 */}
        <div className="mt-12">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                   <Sparkles className="w-6 h-6 text-orange-500" />
                   <CardTitle className="text-2xl">맞춤 추천</CardTitle>
                 </div>
                 {myPets.length > 1 && (
                   <Select value={selectedPet?.myPetId?.toString() || ""} onValueChange={handlePetChange}>
                     <SelectTrigger className="w-40">
                       <SelectValue placeholder="펫 선택" />
                     </SelectTrigger>
                     <SelectContent>
                       {myPets.map((pet) => (
                         <SelectItem key={pet.myPetId} value={pet.myPetId.toString()}>
                           {pet.name} ({pet.breed})
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 )}
               </div>
               {selectedPet && (
                 <p className="text-base text-gray-600">
                   {selectedPet.name} ({selectedPet.breed}, {selectedPet.age}살)을 위한 맞춤 상품을 추천해드려요
                 </p>
               )}
            </CardHeader>
            <CardContent>
              {!selectedPet ? (
                <div className="text-center py-8">
                  <PawPrint className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">반려동물을 등록해주세요</h3>
                  <p className="text-gray-600 mb-4">
                    반려동물을 등록하면 맞춤 추천을 받을 수 있어요!
                  </p>
                  <Button 
                    onClick={() => router.push('/my')}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    마이페이지에서 반려동물 등록하기
                  </Button>
                </div>
              ) : recommendationsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-gray-600">맞춤 상품을 찾고 있어요...</p>
                </div>
              ) : recommendationsError ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-4">{recommendationsError}</p>
                  <Button 
                    onClick={fetchRecommendations}
                    variant="outline"
                  >
                    다시 시도
                  </Button>
                </div>
                             ) : recommendations.length > 0 ? (
                 <ProductRecommendationSlider
                   products={recommendations.map((recommendation) => {
                     const productId = recommendation.productId || recommendation.id
                     return {
                       id: productId,
                       productId: productId,
                       name: recommendation.name.replace(/<[^>]*>/g, ''),
                       price: recommendation.price,
                       imageUrl: recommendation.imageUrl,
                       category: recommendation.category,
                       recommendationReason: recommendation.recommendationReason,
                       source: recommendation.source,
                       externalProductUrl: recommendation.externalProductUrl,
                       externalMallName: recommendation.externalMallName,
                       brand: recommendation.brand,
                       description: recommendation.description
                     }
                   })}
                   onAddToCart={handleRecommendationAddToCart}
                   title=""
                   subtitle=""
                 />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">추천할 상품이 없습니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 최근 본 상품 사이드바 */}
      <RecentProductsSidebar
        productType="store"
        isOpen={showRecentSidebar}
        onToggle={handleSidebarToggle}
        refreshTrigger={refreshTrigger}
      />

      {/* 고정된 사이드바 토글 버튼 */}
      <div className="fixed top-20 right-6 z-40">
        <Button
          onClick={handleSidebarToggle}
          className="bg-yellow-400 hover:bg-yellow-500 text-black shadow-lg rounded-full w-14 h-14 p-0"
          title="최근 본 상품"
        >
          <Clock className="h-6 w-6 text-white" />
        </Button>
      </div>


    </div>
  )
}

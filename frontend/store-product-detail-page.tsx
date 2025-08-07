"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ShoppingCart, Star } from "lucide-react"
import Image from "next/image"
import { productApi } from "@/lib/api"
import PaymentPage from "./PaymentPage"

interface Product {
  id: number
  name: string
  price: number
  imageUrl: string // image → imageUrl로 변경
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

interface StoreProductDetailPageProps {
  productId: number
  onBack: () => void
  onAddToCart: (product: Product) => void
  onBuyNow: (product: Product) => void
  isInCart: (id: number) => boolean
}

export default function StoreProductDetailPage({
  productId,
  onBack,
  onAddToCart,
  onBuyNow,
  isInCart,
}: StoreProductDetailPageProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        console.log('상품 조회 요청 - productId:', productId)
        
        const rawData = await productApi.getProduct(productId)
        console.log('상품 상세 데이터:', rawData);
        
        // 백엔드 응답을 프론트엔드 형식으로 변환
        const data: Product = {
          ...rawData,
          id: rawData.productId || rawData.id || 0, // productId를 id로 매핑
          name: rawData.name || '상품명 없음',
          price: typeof rawData.price === 'number' ? rawData.price : 0, // price 필드 안전하게 매핑
          imageUrl: rawData.image || rawData.imageUrl || '/placeholder.svg', // image 필드를 imageUrl로 매핑
          category: rawData.category || '카테고리 없음',
          description: rawData.description || '상품 설명이 없습니다.',
          petType: rawData.targetAnimal?.toLowerCase() || 'all', // targetAnimal을 petType으로 매핑
          brand: rawData.brand || '브랜드 없음', // brand 필드 추가
          tags: rawData.tags || [], // tags 필드 추가
          stock: typeof rawData.stock === 'number' ? rawData.stock : 0,
          registrationDate: rawData.registrationDate || '등록일 없음',
          registeredBy: rawData.registeredBy || '등록자 없음'
        };
        
        setProduct(data)
      } catch (error) {
        console.error('상품 조회 오류:', error)
        
        console.error('상품 조회 오류:', error);
        setError('상품을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  const handleBuyNow = () => {
    if (product) {
      setShowPayment(true)
    }
  }

  const handlePaymentSuccess = (paymentInfo: any) => {
    console.log("결제 성공:", paymentInfo)
    setShowPayment(false)
    alert("결제가 완료되었습니다!")
    // 성공 후 상품 목록으로 돌아가기
    onBack()
  }

  const handlePaymentFail = (error: any) => {
    console.log("결제 실패:", error)
    setShowPayment(false)
  }

  const handleBackFromPayment = () => {
    setShowPayment(false)
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
            <Button onClick={onBack}>돌아가기</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // PaymentPage가 표시되어야 하는 경우
  if (showPayment) {
    return (
      <PaymentPage
        items={[{
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          image: product.imageUrl
        }]}
        onBack={handleBackFromPayment}
        onSuccess={handlePaymentSuccess}
        onFail={handlePaymentFail}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="hover:bg-gray-100">
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

                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">(4.5)</span>
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
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 p-0"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => onAddToCart(product)}
                    disabled={(typeof product.stock === 'number' ? product.stock : 0) === 0 || isInCart(product.id)}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {isInCart(product.id) ? '장바구니에 추가됨' : '장바구니에 추가'}
                  </Button>
                  <Button
                    onClick={handleBuyNow}
                    variant="outline"
                    disabled={(typeof product.stock === 'number' ? product.stock : 0) === 0}
                    className="flex-1"
                  >
                    바로 구매
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

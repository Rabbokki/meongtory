"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, ShoppingCart, ArrowLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import PaymentPage from "../../payment/PaymentPage"

interface CartItem {
  id: number
  name: string
  brand: string
  price: number
  image: string
  category: string
  quantity: number

  order: number // 순서 고정을 위한 필드
  isNaverProduct?: boolean // 네이버 상품 여부

  product?: {
    id: number
    name: string
    description: string
    price: number
    stock: number
    imageUrl: string
    category: string
    targetAnimal: string
    registrationDate: string
    registeredBy: string
  }
}

export default function CartPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [paymentItems, setPaymentItems] = useState<CartItem[]>([])

  // 장바구니 데이터 가져오기
  const fetchCartItems = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("accessToken")
      if (!token) {
        console.log("토큰이 없어서 장바구니를 불러올 수 없습니다.")
        setCartItems([])
        return
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/carts`, {
        headers: { "Access_Token": token },
        timeout: 5000,
      })

      if (response.status !== 200) {
        throw new Error("장바구니 조회에 실패했습니다.")
      }

      const cartData = response.data
      const items: CartItem[] = cartData
        .sort((a: any, b: any) => a.id - b.id)
        .map((item: any, index: number) => ({
          id: item.id,
          name: item.product.name,
          brand: "브랜드 없음",
          price: item.product.price,
          image: item.product.imageUrl || "/placeholder.svg",
          category: item.product.category,
          quantity: item.quantity,
          order: index,
          product: {
            id: item.product.id,
            name: item.product.name,
            description: item.product.description,
            price: item.product.price,
            stock: item.product.stock,
            imageUrl: item.product.imageUrl,
            category: item.product.category,
            targetAnimal: item.product.targetAnimal,
            registrationDate: item.product.registrationDate,
            registeredBy: item.product.registeredBy,
          },
        }))

      setCartItems(items)
      console.log("장바구니 설정 완료:", items.length, "개")
    } catch (error: any) {
      console.error("장바구니 조회 오류:", error)
      setCartItems([])
    } finally {
      setLoading(false)
    }
  }

  // 장바구니에서 상품 제거
  const onRemoveFromCart = async (cartId: number) => {
    try {
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
        alert("로그인이 필요합니다")
        return
      }

      const response = await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/carts/${cartId}`, {
        headers: { "Access_Token": accessToken }
      })
      
      if (response.status === 200) {
        await fetchCartItems()
        alert("장바구니에서 상품을 삭제했습니다")
      } else {
        throw new Error("장바구니에서 삭제에 실패했습니다.")
      }
    } catch (error: any) {
      console.error("장바구니 삭제 오류:", error)
      alert("장바구니에서 삭제에 실패했습니다")
    }
  }

  // 수량 업데이트
  const onUpdateQuantity = async (cartId: number, quantity: number) => {
    try {
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
        alert("로그인이 필요합니다")
        return
      }

      const response = await axios.put(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/carts/${cartId}?quantity=${quantity}`, null, {
        headers: { "Access_Token": accessToken }
      })
      
      if (response.status === 200) {
        await fetchCartItems()
      } else {
        throw new Error("수량 업데이트에 실패했습니다.")
      }
    } catch (error: any) {
      console.error("수량 업데이트 오류:", error)
      alert("수량 업데이트에 실패했습니다")
    }
  }

  // 전체 구매
  const onPurchaseAll = async (items: CartItem[]) => {
    try {
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
        alert("로그인이 필요합니다")
        return
      }

      // 각 상품을 개별적으로 주문
      for (const item of items) {
        const orderData = {
          accountId: 1, // TODO: 실제 사용자 ID 가져오기
          productId: item.product?.id || item.id,
          quantity: item.quantity,
        }

        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/orders`, orderData, {
          headers: { "Access_Token": accessToken }
        })
      }

      // 장바구니 비우기
      for (const item of items) {
        await onRemoveFromCart(item.id)
      }

      alert("전체 구매가 완료되었습니다")
      router.push("/my")
    } catch (error: any) {
      console.error("전체 구매 오류:", error)
      alert("전체 구매에 실패했습니다")
    }
  }

  // 개별 구매
  const onPurchaseSingle = async (item: CartItem) => {
    try {
      const accessToken = localStorage.getItem("accessToken")
      if (!accessToken) {
        alert("로그인이 필요합니다")
        return
      }

      const orderData = {
        accountId: 1, // TODO: 실제 사용자 ID 가져오기
        productId: item.product?.id || item.id,
        quantity: item.quantity,
      }

      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'}/api/orders`, orderData, {
        headers: { "Access_Token": accessToken }
      })

      if (response.status === 200) {
        await onRemoveFromCart(item.id)
        alert("개별 구매가 완료되었습니다")
        router.push("/my")
      } else {
        throw new Error("개별 구매에 실패했습니다.")
      }
    } catch (error: any) {
      console.error("개별 구매 오류:", error)
      alert("개별 구매에 실패했습니다")
    }
  }

  // 페이지 로드 시 장바구니 데이터 가져오기
  useEffect(() => {
    fetchCartItems()
  }, [])

  // 디버깅: cartItems 배열 확인
  console.log('CartPage - cartItems:', cartItems);
  if (cartItems) {
    const ids = cartItems.map(item => item.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      console.warn('CartPage - 중복된 ID가 있습니다:', ids);
    }
  }

  const handlePurchaseAll = () => {
    setPaymentItems(cartItems)
    setShowPayment(true)
  }

  const handlePurchaseItem = (item: CartItem) => {
    setPaymentItems([item])
    setShowPayment(true)
  }

  const handlePaymentSuccess = (paymentInfo: any) => {
    console.log("결제 성공:", paymentInfo)
    // 결제 성공 후 장바구니에서 상품 제거
    paymentItems.forEach(item => onRemoveFromCart(item.id))
    setShowPayment(false)
    setPaymentItems([])
    // 성공 페이지로 이동하거나 알림
    alert("결제가 완료되었습니다!")
  }

  const handlePaymentFail = (error: any) => {
    console.log("결제 실패:", error)
    setShowPayment(false)
    setPaymentItems([])
  }

  const handleBackFromPayment = () => {
    setShowPayment(false)
    setPaymentItems([])
  }

  // PaymentPage가 표시되어야 하는 경우
  if (showPayment) {
    return (
      <PaymentPage
        items={paymentItems.map(item => ({
          id: item.product?.id || item.id, // 실제 상품 ID 사용
          name: item.name.replace(/<[^>]*>/g, ''), // HTML 태그 제거
          price: item.price,
          quantity: item.quantity,
          image: item.image,

          isNaverProduct: item.isNaverProduct || false
        }))}
        onSuccess={handlePaymentSuccess}
        onFail={handlePaymentFail}
        onBack={handleBackFromPayment}
      />
    )
  }

  // 로딩 중
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-600">장바구니를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">장바구니</h1>
          <p className="text-gray-600">구매할 상품들을 확인해보세요</p>
        </div>

        {!cartItems || cartItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">장바구니가 비어있습니다</h3>
            <p className="text-gray-600 mb-6">마음에 드는 상품을 장바구니에 담아보세요!</p>
            <Button onClick={() => router.push("/store")} className="bg-yellow-400 hover:bg-yellow-500 text-black">
              쇼핑하러 가기
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-gray-600">총 {cartItems?.length || 0}개의 상품</p>
                <p className="text-lg font-bold text-yellow-600">
                  총 가격: {(cartItems?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0).toLocaleString()}원
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (window.confirm('장바구니의 모든 상품을 삭제하시겠습니까?')) {
                      cartItems?.forEach(item => onRemoveFromCart(item.id))
                    }
                  }}
                >
                  전체 삭제
                </Button>
                <Button onClick={handlePurchaseAll} className="bg-yellow-400 hover:bg-yellow-500 text-black" size="sm">
                  전체 구매하기
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cartItems?.sort((a, b) => a.order - b.order).map((item, index) => (
                <Card key={`${item.id}-${index}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={200}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 mb-1">{item.brand}</p>
                    <h3 className="font-medium text-sm mb-2 line-clamp-2 h-10">{item.name.replace(/<[^>]*>/g, '')}</h3>
                    <div className="mb-3">
                      <p className="text-sm text-gray-500">단가: {item.price.toLocaleString()}원</p>
                      <p className="font-bold text-lg text-yellow-600">
                        {(item.price * item.quantity).toLocaleString()}원
                      </p>
                    </div>
                    
                    {/* 수량 조절 */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">수량:</span>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-8 h-8 p-0"
                        >
                          -
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const stock = item.product?.stock || 0
                            if (item.quantity >= stock) {
                              alert(`재고가 부족합니다. (재고: ${stock}개, 현재: ${item.quantity}개)`)
                              return
                            }
                            onUpdateQuantity(item.id, item.quantity + 1)
                          }}
                          disabled={item.quantity >= (item.product?.stock || 0)}
                          className="w-8 h-8 p-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    {/* 재고 정보 표시 */}
                    {item.product?.stock && (
                      <div className="text-xs text-gray-500 mb-2">
                        재고: {item.product.stock}개
                        {item.quantity >= item.product.stock && (
                          <span className="text-red-500 ml-2">최대 재고 수량입니다</span>
                        )}
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black"
                        onClick={() => handlePurchaseItem(item)}
                      >
                        구매하기
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRemoveFromCart(item.id)}
                        className="px-3"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

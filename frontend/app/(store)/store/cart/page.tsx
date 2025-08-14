"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, ShoppingCart } from "lucide-react"
import { useState } from "react"
import PaymentPage from "../../payment/page"

interface CartItem {
  id: number
  name: string
  brand: string
  price: number
  image: string
  category: string
  quantity: number
  order: number // 순서 고정을 위한 필드
}

interface CartPageProps {
  cartItems: CartItem[]
  onRemoveFromCart: (id: number) => void
  onNavigateToStore: () => void
  onPurchaseAll: (items: CartItem[]) => void
  onPurchaseSingle: (item: CartItem) => void
  onUpdateQuantity: (id: number, quantity: number) => void
}

export default function CartPage({
  cartItems,
  onRemoveFromCart,
  onNavigateToStore,
  onPurchaseAll,
  onPurchaseSingle,
  onUpdateQuantity,
}: CartPageProps) {
  // 디버깅: cartItems 배열 확인
  console.log('CartPage - cartItems:', cartItems);
  if (cartItems) {
    const ids = cartItems.map(item => item.id);
    const uniqueIds = new Set(ids);
    if (ids.length !== uniqueIds.size) {
      console.warn('CartPage - 중복된 ID가 있습니다:', ids);
    }
  }
  const [showPayment, setShowPayment] = useState(false)
  const [paymentItems, setPaymentItems] = useState<CartItem[]>([])

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
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        }))}
        onBack={handleBackFromPayment}
        onSuccess={handlePaymentSuccess}
        onFail={handlePaymentFail}
      />
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
            <Button onClick={onNavigateToStore} className="bg-yellow-400 hover:bg-yellow-500 text-black">
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
                    <h3 className="font-medium text-sm mb-2 line-clamp-2 h-10">{item.name}</h3>
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
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0"
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    
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

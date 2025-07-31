"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, Minus, Plus, ShoppingCart, Share2 } from "lucide-react"

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

interface StoreProductDetailPageProps {
  product: Product
  onBack: () => void
  onAddToWishlist: (item: WishlistItem) => void
  isInWishlist: (id: number) => boolean; // Change type to function
  onPurchase: (product: Product & { quantity: number }) => void
}

export default function StoreProductDetailPage({
  product,
  onBack,
  onAddToWishlist,
  isInWishlist,
  onPurchase,
}: StoreProductDetailPageProps) {
  const [quantity, setQuantity] = useState(1)

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToWishlist = () => {
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

  const handlePurchase = () => {
    onPurchase({ ...product, quantity })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `${product.brand}의 ${product.name}을 확인해보세요!`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert("링크가 복사되었습니다!")
    }
  }

  const totalPrice = product.price * quantity

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={onBack} className="mb-6 hover:bg-gray-100">
          <ArrowLeft className="w-4 h-4 mr-2" />
          스토어로 돌아가기
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative">
              <Image
                src={product.image || "/placeholder.svg?height=400&width=600&query=pet product"}
                alt={product.name}
                width={600}
                height={400}
                className="w-full h-96 object-cover rounded-lg"
              />
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <Badge variant="destructive" className="text-xl px-6 py-3">
                    품절
                  </Badge>
                </div>
              )}
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <Badge variant="outline" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-lg text-gray-600 mb-4">{product.brand}</p>
              <div className="text-3xl font-bold text-yellow-600 mb-4">{product.price.toLocaleString()}원</div>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stock Info */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>재고: {product.stock}개</span>
              <span>•</span>
              <span>등록일: {new Date(product.registrationDate).toLocaleDateString()}</span>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium">수량</span>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-lg font-semibold">
                    <span>총 가격</span>
                    <span className="text-yellow-600">{totalPrice.toLocaleString()}원</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleAddToWishlist}
                className="flex-1 bg-transparent"
                disabled={isInWishlist(product.id)}
              >
                <Heart className={`w-4 h-4 mr-2 ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : ""}`} />
                {isInWishlist(product.id) ? "찜 완료" : "찜하기"}
              </Button>
              <Button
                onClick={handlePurchase}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {product.stock === 0 ? "품절" : "구매하기"}
              </Button>
              <Button variant="outline" onClick={handleShare} className="px-4 bg-transparent">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Product Description */}
            {product.description && (
              <Card>
                <CardHeader>
                  <CardTitle>상품 설명</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Additional Info */}
            <Card>
              <CardHeader>
                <CardTitle>배송 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-gray-600">
                <p>• 평일 오후 2시 이전 주문 시 당일 발송</p>
                <p>• 제주도 및 도서산간 지역은 추가 배송비가 발생할 수 있습니다</p>
                <p>• 상품 하자가 아닌 단순 변심으로 인한 교환/반품 시 배송비는 고객 부담입니다</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

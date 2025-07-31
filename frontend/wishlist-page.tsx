"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Trash2 } from "lucide-react"

interface WishlistItem {
  id: number
  name: string
  brand: string
  price: number
  image: string
  category: string
}

interface WishlistPageProps {
  wishlistItems: WishlistItem[]
  onRemoveFromWishlist: (id: number) => void
  onNavigateToStore: () => void
  onPurchase: (items: WishlistItem[]) => void
}

export default function WishlistPage({
  wishlistItems,
  onRemoveFromWishlist,
  onNavigateToStore,
  onPurchase,
}: WishlistPageProps) {
  const handlePurchaseAll = () => {
    onPurchase(wishlistItems)
  }

  const handlePurchaseItem = (item: WishlistItem) => {
    onPurchase([item])
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">찜한 상품</h1>
          <p className="text-gray-600">관심있는 상품들을 모아보세요</p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">찜한 상품이 없습니다</h3>
            <p className="text-gray-600 mb-6">마음에 드는 상품을 찜해보세요!</p>
            <Button onClick={onNavigateToStore} className="bg-yellow-400 hover:bg-yellow-500 text-black">
              쇼핑하러 가기
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">총 {wishlistItems.length}개의 상품</p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  전체 삭제
                </Button>
                <Button onClick={handlePurchaseAll} className="bg-yellow-400 hover:bg-yellow-500 text-black" size="sm">
                  전체 구매하기
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlistItems.map((item) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      width={200}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={() => onRemoveFromWishlist(item.id)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                    >
                      <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    </button>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-xs text-gray-500 mb-1">{item.brand}</p>
                    <h3 className="font-medium text-sm mb-2 line-clamp-2 h-10">{item.name}</h3>
                    <p className="font-bold text-lg mb-3">{item.price.toLocaleString()}원</p>
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
                        onClick={() => onRemoveFromWishlist(item.id)}
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

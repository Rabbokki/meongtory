"use client"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Trash2 } from "lucide-react"

interface InsuranceProduct {
  id: number
  company: string
  productName: string
  description: string
  features: string[]
  logo: string
}

interface InsuranceFavoritesPageProps {
  favoriteInsurance: number[]
  onRemoveFromFavorites: (id: number) => void
  onNavigateToInsurance: () => void
  onViewDetails: (product: InsuranceProduct) => void
}

const mockInsuranceProducts: InsuranceProduct[] = [
  {
    id: 1,
    company: "삼성화재",
    productName: "펫보험 기본형",
    description: "반려동물 기본적인 치료비를 보장합니다",
    features: [
      "입원비/수술비 최대 1000만 원",
      "진료비 보장률 70%까지 선택가능",
      "특진료비보장(응급실 등) 응급시 더안전하게",
    ],
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    company: "삼성화재",
    productName: "펫보험 고급형",
    description: "수술비, 입원비 등 고액 진료비를 보장합니다",
    features: ["입원비/수술비 최대 1500만 원", "진료비 보장률 70%까지 선택가능", "응급실 및 특진료 5% 할인"],
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    company: "한화손해보험",
    productName: "LIFEPLUS 댕댕이보험 기본형",
    description: "기본적 치료비 보장 및 특약을 통해 보장범위 확대",
    features: ["치료비 최대 1000만원 보장", "입원비, 70% 보장범위", "한 가지 이상의 응급실 치료 기능 가능"],
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 4,
    company: "현대해상",
    productName: "하이펫보험 스탠다드",
    description: "치료비 보장과 50%까지 보장범위",
    features: ["치료비 최대 800만원 보장", "응급실에서 높은 치료 (최대 추가 30% 할인)", "입원비, 50% 보장범위"],
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 5,
    company: "현대해상",
    productName: "하이펫보험 프리미엄",
    description: "프리미엄 치료비 보장 및 응급실보장",
    features: ["치료비 최대 1500만원 보장", "응급실에서 높은 치료 (최대 추가 50% 할인)", "입원비, 80% 보장범위"],
    logo: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 6,
    company: "DB손해보험",
    productName: "프로미라이프",
    description: "보험 가입 후 바로 보장받을 수 있는 보험",
    features: ["입원비/수술비 최대 1000만원 보장", "응급실에서 높은 치료 (최대 추가 30% 할인)", "입원비, 50% 보장범위"],
    logo: "/placeholder.svg?height=40&width=40",
  },
]

export default function InsuranceFavoritesPage({
  favoriteInsurance,
  onRemoveFromFavorites,
  onNavigateToInsurance,
  onViewDetails,
}: InsuranceFavoritesPageProps) {
  const favoriteProducts = mockInsuranceProducts.filter((product) => favoriteInsurance.includes(product.id))

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">관심 펫보험</h1>
          <p className="text-gray-600">관심있는 펫보험 상품들을 모아보세요</p>
        </div>

        {favoriteProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">관심 펫보험이 없습니다</h3>
            <p className="text-gray-600 mb-6">마음에 드는 펫보험을 찜해보세요!</p>
            <Button onClick={onNavigateToInsurance} className="bg-yellow-400 hover:bg-yellow-500 text-black">
              펫보험 보러 가기
            </Button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-600">총 {favoriteProducts.length}개의 상품</p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  전체 삭제
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Image
                          src={product.logo || "/placeholder.svg"}
                          alt={product.company}
                          width={40}
                          height={40}
                          className="rounded"
                        />
                        <div>
                          <p className="text-sm text-gray-500">{product.company}</p>
                          <h3 className="font-bold text-lg">{product.productName}</h3>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveFromFavorites(product.id)}
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <Heart className="w-5 h-5 text-red-500 fill-red-500" />
                      </button>
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{product.description}</p>

                    <div className="mb-6">
                      <h4 className="font-semibold text-sm mb-2 text-yellow-600">비마이펫 TIP</h4>
                      <ul className="space-y-1">
                        {product.features.map((feature, index) => (
                          <li key={index} className="text-xs text-gray-600 flex items-start">
                            <span className="text-yellow-500 mr-2">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => onViewDetails(product)}
                        className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
                      >
                        자세히 보기
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRemoveFromFavorites(product.id)}
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

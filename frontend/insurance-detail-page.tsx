"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Star, Check, X, Phone, Mail, Globe } from "lucide-react"

interface Insurance {
  id: number
  company: string
  planName: string
  monthlyPremium: number
  coverage: string[]
  deductible: number
  maxPayout: number
  ageLimit: string
  description: string
  rating: number
  isPopular?: boolean
  logo?: string
}

interface InsuranceDetailPageProps {
  insurance: Insurance | null
  onBack: () => void
}

export default function InsuranceDetailPage({ insurance, onBack }: InsuranceDetailPageProps) {
  // insurance가 null인 경우 처리
  if (!insurance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="text-center py-8">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-semibold mb-2">상품을 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-4">요청하신 보험 상품 정보를 불러올 수 없습니다.</p>
            <Button onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로가기
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const coverageDetails = {
    질병치료: { included: true, description: "각종 질병으로 인한 치료비 보장" },
    상해치료: { included: true, description: "사고로 인한 상해 치료비 보장" },
    수술비: { included: true, description: "수술이 필요한 경우 수술비 보장" },
    예방접종: { included: insurance.coverage.includes("예방접종"), description: "정기 예방접종 비용 보장" },
    건강검진: { included: insurance.coverage.includes("건강검진"), description: "정기 건강검진 비용 보장" },
    응급처치: { included: insurance.coverage.includes("응급처치"), description: "응급상황 발생시 응급처치 비용 보장" },
    입원비: { included: insurance.coverage.includes("입원비"), description: "입원 치료시 입원비 보장" },
    처방약: { included: insurance.coverage.includes("처방약"), description: "처방받은 약물 비용 보장" },
  }

  const handleApply = () => {
    alert(`${insurance.company} ${insurance.planName} 가입 신청이 접수되었습니다.`)
  }

  const handleConsult = () => {
    alert("상담 신청이 접수되었습니다. 곧 연락드리겠습니다.")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로가기
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={insurance.logo || "/placeholder.svg?height=60&width=120&text=Logo"}
                      alt={insurance.company}
                      className="w-20 h-10 object-contain"
                    />
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">{insurance.planName}</CardTitle>
                      <p className="text-gray-600">{insurance.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {insurance.isPopular && <Badge className="bg-orange-100 text-orange-800">인기 상품</Badge>}
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm font-medium ml-1">{insurance.rating}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4">{insurance.description}</p>
                <div className="grid md:grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      월 {insurance.monthlyPremium.toLocaleString()}원
                    </div>
                    <div className="text-sm text-gray-600">월 보험료</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {(insurance.maxPayout / 10000).toFixed(0)}만원
                    </div>
                    <div className="text-sm text-gray-600">최대 보장한도</div>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{insurance.deductible.toLocaleString()}원</div>
                    <div className="text-sm text-gray-600">자기부담금</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coverage Details */}
            <Card>
              <CardHeader>
                <CardTitle>보장 내용</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(coverageDetails).map(([coverage, details]) => (
                    <div key={coverage} className="flex items-start space-x-3">
                      {details.included ? (
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className={details.included ? "" : "opacity-50"}>
                        <div className="font-medium">{coverage}</div>
                        <div className="text-sm text-gray-600">{details.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card>
              <CardHeader>
                <CardTitle>가입 조건 및 유의사항</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">가입 조건</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 가입 연령: {insurance.ageLimit}</li>
                    <li>• 건강한 반려동물만 가입 가능</li>
                    <li>• 예방접종 완료 필수</li>
                    <li>• 중성화 수술 시 보험료 할인 적용</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">보장 제외 사항</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• 기존 질병 및 선천적 질환</li>
                    <li>• 미용 목적의 수술</li>
                    <li>• 예방 가능한 질병 (예방접종 미실시)</li>
                    <li>• 자연재해로 인한 상해</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold mb-2">청구 절차</h4>
                  <ol className="space-y-1 text-sm text-gray-600">
                    <li>1. 병원 치료 후 진료비 결제</li>
                    <li>2. 진료비 영수증 및 진료 기록 보관</li>
                    <li>3. 보험금 청구서 작성 및 제출</li>
                    <li>4. 심사 후 보험금 지급 (평균 7-10일)</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Apply */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">간편 가입</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    월 {insurance.monthlyPremium.toLocaleString()}원
                  </div>
                  <div className="text-sm text-gray-600">부터</div>
                </div>

                <Button onClick={handleApply} className="w-full bg-blue-600 hover:bg-blue-700">
                  지금 가입하기
                </Button>

                <Button onClick={handleConsult} variant="outline" className="w-full bg-transparent">
                  상담 신청
                </Button>

                <div className="text-xs text-gray-500 text-center">
                  * 최종 보험료는 반려동물 정보에 따라 달라질 수 있습니다.
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">문의하기</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium">고객센터</div>
                    <div className="text-sm text-gray-600">1588-0000</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium">이메일</div>
                    <div className="text-sm text-gray-600">support@{insurance.company.toLowerCase()}.com</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <div>
                    <div className="font-medium">홈페이지</div>
                    <div className="text-sm text-gray-600">www.{insurance.company.toLowerCase()}.com</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Products */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">관련 상품</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="font-medium text-sm">{insurance.company} 프리미엄 플랜</div>
                  <div className="text-xs text-gray-600">월 55,000원부터</div>
                </div>
                <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="font-medium text-sm">{insurance.company} 라이트 플랜</div>
                  <div className="text-xs text-gray-600">월 25,000원부터</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

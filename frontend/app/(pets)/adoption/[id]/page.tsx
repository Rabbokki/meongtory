"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, Share2, MapPin, Calendar, Weight, Stethoscope, User } from "lucide-react"
import AdoptionRequestModal from "@/components/modals/adoption-request-modal"
import { adoptionRequestApi } from "@/lib/api"

import type { Pet } from "@/types/pets"

interface FormField {
  id: string
  label: string
  type: "text" | "email" | "tel" | "textarea"
  required: boolean
  placeholder: string
}

interface AdoptionDetailPageProps {
  pet: Pet
  onBack: () => void
  isLoggedIn: boolean
  onShowLogin: () => void
}

export default function AdoptionDetailPage({ pet, onBack, isLoggedIn, onShowLogin }: AdoptionDetailPageProps) {
  const [showFullStory, setShowFullStory] = useState(false)
  const [showAdoptionRequestModal, setShowAdoptionRequestModal] = useState(false)
  const [customFields, setCustomFields] = useState<FormField[]>([])

  const handleAdoptionRequest = () => {
    if (!isLoggedIn) {
      onShowLogin()
      return
    }
    setShowAdoptionRequestModal(true)
  }

  const handleSubmitAdoptionRequest = async (requestData: {
    petId: number
    [key: string]: any
  }) => {
    try {
      // API 함수 호출 시 필요한 기본 필드들을 포함
      const apiRequestData = {
        applicantName: requestData.applicantName || "",
        contactNumber: requestData.contactNumber || "",
        email: requestData.email || "",
        message: requestData.message || "",
        ...requestData
      }
      
      await adoptionRequestApi.createAdoptionRequest(apiRequestData)
      alert("입양신청이 성공적으로 접수되었습니다. 보호소에서 검토 후 연락드리겠습니다.")
      setShowAdoptionRequestModal(false)
    } catch (error) {
      console.error("입양신청 실패:", error)
      alert("입양신청에 실패했습니다. 다시 시도해주세요.")
    }
  }

  const handleUpdateCustomFields = (fields: FormField[]) => {
    setCustomFields(fields)
    // 여기서 백엔드에 커스텀 필드 설정을 저장할 수 있습니다
    console.log("커스텀 필드 업데이트:", fields)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${pet.name} - 입양을 기다리고 있어요`,
        text: `${pet.breed} ${pet.name}이(가) 새로운 가족을 찾고 있습니다.`,
        url: window.location.href,
      })
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert("링크가 클립보드에 복사되었습니다!")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" onClick={onBack} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          입양 목록으로 돌아가기
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pet Image */}
          <div className="space-y-4">
            <div className="relative">
              <Image
                src={pet.images?.[0] || "/placeholder.svg?height=400&width=600&query=cute pet"}
                alt={`${pet.breed}`}
                width={600}
                height={400}
                className="w-full h-96 object-cover rounded-lg"
              />
              <Badge className="absolute top-4 left-4 bg-yellow-400 text-black hover:bg-yellow-500">
                {pet.adoptionStatus === "available" ? "보호중" : pet.adoptionStatus === "pending" ? "입양대기" : "입양완료"}
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              {isLoggedIn ? (
                <Button onClick={handleAdoptionRequest} className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black">
                  <Heart className="w-4 h-4 mr-2" />
                  입양신청하기
                </Button>
              ) : (
                <Button onClick={handleAdoptionRequest} className="flex-1 bg-gray-400 hover:bg-gray-500 text-white">
                  <Heart className="w-4 h-4 mr-2" />
                  로그인 후 입양신청
                </Button>
              )}
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                공유하기
              </Button>
            </div>
          </div>

          {/* Pet Information */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {pet.name} ({pet.breed})
              </h1>
              <p className="text-gray-600">{pet.age} • {pet.gender} • {pet.location}</p>
            </div>

            {/* Basic Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    나이
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">{pet.age}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Weight className="w-4 h-4 mr-2" />
                    크기
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">{pet.size}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Stethoscope className="w-4 h-4 mr-2" />
                    건강상태
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">{pet.healthStatus}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    성격
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {pet.personality.split(', ').map((trait, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {trait.trim()}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>소개</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{pet.description}</p>
              </CardContent>
            </Card>

            {/* Special Needs */}
            {pet.specialNeeds && (
              <Card>
                <CardHeader>
                  <CardTitle>특별한 사항</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{pet.specialNeeds}</p>
                </CardContent>
              </Card>
            )}

            {/* Medical Info */}
            <Card>
              <CardHeader>
                <CardTitle>의료 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>중성화</span>
                  <Badge variant={pet.isNeutered ? "default" : "secondary"}>
                    {pet.isNeutered ? "완료" : "미완료"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>예방접종</span>
                  <Badge variant={pet.isVaccinated ? "default" : "secondary"}>
                    {pet.isVaccinated ? "완료" : "미완료"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">입양 문의</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">입양 절차 안내</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 입양 문의 후 보호소에서 연락드립니다</li>
                <li>• 입양 전 면담 및 가정 환경 확인이 있을 수 있습니다</li>
                <li>• 입양 후 정기적인 근황 공유를 부탁드립니다</li>
                <li>• 입양비는 의료비 및 관리비로 사용됩니다</li>
              </ul>
            </div>
            <div className="mt-4 flex justify-center">
              {isLoggedIn ? (
                <Button onClick={handleAdoptionRequest} className="bg-yellow-400 hover:bg-yellow-500 text-black">
                  <Heart className="w-4 h-4 mr-2" />
                  입양신청하기
                </Button>
              ) : (
                <Button onClick={handleAdoptionRequest} className="bg-gray-400 hover:bg-gray-500 text-white">
                  <Heart className="w-4 h-4 mr-2" />
                  로그인 후 입양신청
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 입양신청 모달 */}
        <AdoptionRequestModal
          isOpen={showAdoptionRequestModal}
          onClose={() => setShowAdoptionRequestModal(false)}
          selectedPet={pet}
          onSubmit={handleSubmitAdoptionRequest}
          customFields={customFields}
          onUpdateCustomFields={handleUpdateCustomFields}
        />
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Heart, Share2, MapPin, Calendar, Weight, Stethoscope, User } from "lucide-react"

interface Pet {
  id: number
  name: string
  type: string
  breed: string
  age: string
  gender: "male" | "female"
  neutered: boolean
  location: string
  image: string
  status: string
  description?: string
  weight?: string
  personality?: string[]
  medicalHistory?: string
  rescueStory?: string
}

interface AdoptionDetailPageProps {
  pet: Pet
  onBack: () => void
  isLoggedIn: boolean
  onShowLogin: () => void
}

export default function AdoptionDetailPage({ pet, onBack, isLoggedIn, onShowLogin }: AdoptionDetailPageProps) {
  const [showFullStory, setShowFullStory] = useState(false)

  const handleAdoptionInquiry = () => {
    if (!isLoggedIn) {
      onShowLogin()
      return
    }
    alert(`${pet.name}의 입양 문의가 접수되었습니다. 보호소에서 연락드리겠습니다.`)
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
                src={pet.image || "/placeholder.svg?height=400&width=600&query=cute pet"}
                alt={`${pet.type} ${pet.breed}`}
                width={600}
                height={400}
                className="w-full h-96 object-cover rounded-lg"
              />
              <Badge className="absolute top-4 left-4 bg-yellow-400 text-black hover:bg-yellow-500">{pet.status}</Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button onClick={handleAdoptionInquiry} className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black">
                <Heart className="w-4 h-4 mr-2" />
                입양 문의하기
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                공유하기
              </Button>
            </div>
          </div>

          {/* Pet Information */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {pet.name} ({pet.type})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">품종</span>
                    <span className="font-medium">{pet.breed}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">나이</span>
                    <span className="font-medium">{pet.age}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`w-4 h-4 ${pet.gender === "male" ? "text-blue-500" : "text-pink-500"}`}>
                      {pet.gender === "male" ? "♂" : "♀"}
                    </span>
                    <span className="text-sm text-gray-600">성별</span>
                    <span className="font-medium">{pet.gender === "male" ? "남아" : "여아"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">중성화</span>
                    <span className="font-medium">{pet.neutered ? "완료" : "미완료"}</span>
                  </div>
                  {pet.weight && (
                    <div className="flex items-center gap-2">
                      <Weight className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">체중</span>
                      <span className="font-medium">{pet.weight}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">지역</span>
                    <span className="font-medium">{pet.location}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Personality */}
            {pet.personality && pet.personality.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">성격</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {pet.personality.map((trait, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50">
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Medical History */}
            {pet.medicalHistory && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">건강 상태</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{pet.medicalHistory}</p>
                </CardContent>
              </Card>
            )}

            {/* Description */}
            {pet.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">소개</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{pet.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Rescue Story */}
            {pet.rescueStory && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">구조 이야기</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-gray-700">
                      {showFullStory ? pet.rescueStory : `${pet.rescueStory.slice(0, 150)}...`}
                    </p>
                    {pet.rescueStory.length > 150 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFullStory(!showFullStory)}
                        className="p-0 h-auto text-blue-600 hover:text-blue-800"
                      >
                        {showFullStory ? "접기" : "더 보기"}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
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
            
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

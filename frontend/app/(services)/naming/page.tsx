"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface PetNamingServiceProps {
  onClose: () => void
}

export default function PetNamingService({ onClose }: PetNamingServiceProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [petData, setPetData] = useState({
    type: "",
    gender: "",
    personality: "",
    color: "",
  })

  const steps = ["main", "gender", "personality", "color", "loading", "result"]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSelection = (key: string, value: string) => {
    setPetData((prev) => ({ ...prev, [key]: value }))
  }

  // Main landing page
  if (currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-white flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* AI Service Description */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-24 h-32 bg-teal-400 rounded-2xl flex items-center justify-center">
                <Image
                  src="/placeholder.svg?height=100&width=80"
                  alt="White cat"
                  width={80}
                  height={100}
                  className="rounded-lg"
                />
              </div>
              <div className="w-20 h-24 bg-yellow-400 rounded-2xl flex items-center justify-center">
                <Image
                  src="/placeholder.svg?height=80&width=60"
                  alt="Brown dog"
                  width={60}
                  height={80}
                  className="rounded-lg"
                />
              </div>
            </div>
            <h2 className="text-lg font-bold mb-2">
              인공지능(AI)을 활용하여
              <br />
              반려동물 이름을 추천해
              <br />
              빠르게 만들어 보세요!
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              반려동물 성격과 특징에 맞는 이름을 추천해 드립니다.
              <br />
              인공지능이 분석하여 제안한 이름을 선택하세요.
            </p>
            <div className="bg-yellow-100 rounded-lg p-3 text-sm">
              <p className="font-medium">✨ 무료 이름추천 가능합니다!</p>
              <p>더 많은 추천을 원하시면 프리미엄 서비스를 이용하세요!</p>
            </div>
          </div>

          {/* Pet Characteristics */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold">
              반려동물의 특성을
              <br />
              파악하여 생성되는 이름!
            </h3>

            <div className="relative">
              <div className="w-48 h-64 bg-pink-200 rounded-full mx-auto flex items-center justify-center">
                <Image
                  src="/placeholder.svg?height=200&width=150"
                  alt="White fluffy dog"
                  width={150}
                  height={200}
                  className="rounded-full"
                />
              </div>

              {/* Characteristic labels */}
              <div className="absolute top-8 left-8 text-sm font-medium">cat or dog?</div>
              <div className="absolute top-16 right-8 text-sm font-medium">hair</div>
              <div className="absolute bottom-16 left-8 text-sm font-medium">gender</div>
              <div className="absolute bottom-8 right-8 text-sm font-medium">personality</div>
              <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-sm font-medium">color</div>
            </div>
          </div>

          <Button
            onClick={handleNext}
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-12 py-3 rounded-full text-lg"
          >
            Start
          </Button>
        </div>
      </div>
    )
  }

  // Gender selection
  if (currentStep === 1) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="max-w-md mx-auto text-center space-y-8">
          <h1 className="text-2xl font-bold text-gray-900">내 반려동물의 성별은?</h1>

          <div className="grid grid-cols-2 gap-6">
            <Card
              className={`cursor-pointer transition-all hover:shadow-lg ${petData.gender === "male" ? "ring-2 ring-blue-400" : ""}`}
              onClick={() => handleSelection("gender", "male")}
            >
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center">
                    <div className="text-white text-2xl">♂</div>
                  </div>
                </div>
                <p className="font-medium text-lg">남아</p>
              </CardContent>
            </Card>

            <Card
              className={`cursor-pointer transition-all hover:shadow-lg ${petData.gender === "female" ? "ring-2 ring-pink-400" : ""}`}
              onClick={() => handleSelection("gender", "female")}
            >
              <CardContent className="p-8 text-center">
                <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                  <div className="w-16 h-16 bg-pink-400 rounded-full flex items-center justify-center">
                    <div className="text-white text-2xl">♀</div>
                  </div>
                </div>
                <p className="font-medium text-lg">여아</p>
              </CardContent>
            </Card>
          </div>

          <Button
            onClick={handleNext}
            disabled={!petData.gender}
            className="bg-gray-400 hover:bg-gray-500 text-white px-12 py-3 rounded-full disabled:opacity-50"
          >
            다음
          </Button>
        </div>
      </div>
    )
  }

  // Personality selection
  if (currentStep === 2) {
    const personalities = [
      { id: "shy", name: "소심한", desc: "무서운 것이 많은 친구구나?", image: "/placeholder.svg?height=120&width=120" },
      { id: "picky", name: "새침한", desc: "자주 새침하는 영양이", image: "/placeholder.svg?height=120&width=120" },
      {
        id: "active",
        name: "활발한",
        desc: "에너지 넘치는 우리 아이!",
        image: "/placeholder.svg?height=120&width=120",
      },
      {
        id: "reliable",
        name: "듬직한",
        desc: "든든 다정한 성격 든든해요!",
        image: "/placeholder.svg?height=120&width=120",
      },
    ]

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-2xl font-bold text-gray-900">내 반려동물의 성향은?</h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {personalities.map((personality) => (
              <Card
                key={personality.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${petData.personality === personality.id ? "ring-2 ring-blue-400" : ""}`}
                onClick={() => handleSelection("personality", personality.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-blue-100">
                    <Image
                      src={personality.image || "/placeholder.svg"}
                      alt={personality.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{personality.name}</h3>
                  <p className="text-sm text-gray-600">{personality.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={!petData.personality}
            className="bg-gray-400 hover:bg-gray-500 text-white px-12 py-3 rounded-full disabled:opacity-50"
          >
            다음
          </Button>
        </div>
      </div>
    )
  }

  // Color selection
  if (currentStep === 3) {
    const colors = [
      { id: "black", name: "블랙 계열", desc: "시크하고 멋진 블랙!", image: "/placeholder.svg?height=120&width=120" },
      {
        id: "brown",
        name: "브라운 / 베이지 계열",
        desc: "초콜릿 카페라떼!",
        image: "/placeholder.svg?height=120&width=120",
      },
      {
        id: "cream",
        name: "크림 / 화이트 계열",
        desc: "밝은 크림과 화이트!",
        image: "/placeholder.svg?height=120&width=120",
      },
      {
        id: "other",
        name: "기타 색상",
        desc: "내 털색은 다른 특이한 색이에요!",
        image: "/placeholder.svg?height=120&width=120",
      },
    ]

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-2xl font-bold text-gray-900">내 반려동물은 무슨 색인가요?</h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {colors.map((color) => (
              <Card
                key={color.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${petData.color === color.id ? "ring-2 ring-blue-400" : ""}`}
                onClick={() => handleSelection("color", color.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden bg-gray-100">
                    <Image
                      src={color.image || "/placeholder.svg"}
                      alt={color.name}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{color.name}</h3>
                  <p className="text-sm text-gray-600">{color.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            onClick={handleNext}
            disabled={!petData.color}
            className="bg-gray-400 hover:bg-gray-500 text-white px-12 py-3 rounded-full disabled:opacity-50"
          >
            다음
          </Button>
        </div>
      </div>
    )
  }

  // Loading page
  if (currentStep === 4) {
    // Auto advance after 3 seconds
    setTimeout(() => {
      setCurrentStep(5)
    }, 3000)

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="max-w-md mx-auto text-center space-y-8">
          <div className="relative">
            <div className="w-32 h-32 mx-auto">
              <div className="w-full h-full border-4 border-gray-200 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-yellow-400 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                <Image
                  src="/placeholder.svg?height=60&width=60"
                  alt="Pet illustration"
                  width={60}
                  height={60}
                  className="rounded-full"
                />
              </div>
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900">조금만 기다려주세요</h2>
          <p className="text-gray-600">AI가 완벽한 이름을 생성하고 있어요!</p>
        </div>
      </div>
    )
  }

  // Results page
  if (currentStep === 5) {
    const recommendedNames = [
      {
        id: 1,
        name: "온다",
        description: "예쁘고 활발한 강아지에게 어울리는 귀여운 이름이야. 햇살 같은 밝은 성격을 잘 표현해!",
      },
      {
        id: 2,
        name: "오드리",
        description: "우아하면서도 활발한 느낌의 이름이야. 그래서 오드리가 잘 어울릴 것 같아. 매력적인 이름!",
      },
      {
        id: 3,
        name: "오아시스",
        description: "온순하면서도 밝고 활발해서, 오아시스 이름 지어줄 만한 사랑스러운 더 친절할 수 있을 것!",
      },
      {
        id: 4,
        name: "오라라",
        description: "도도한 외모와 활발한 모습이 잘 어울리는 멋진 이름이지. 그래서 오라라 지어주면 잘 어울릴 것!",
      },
    ]

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <span className="text-2xl">🐾</span>
            <h1 className="text-2xl font-bold text-gray-900">추천 이름이 완성되었습니다!</h1>
          </div>

          <p className="text-gray-600 mb-8">반려동물의 특성을 담은 추천 이름이 생성되었어요!</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendedNames.map((nameData) => (
              <Card key={nameData.id} className="p-6 text-left">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {nameData.id}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{nameData.name}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{nameData.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-center">
            <Image
              src="/placeholder.svg?height=60&width=60"
              alt="Pet mascot"
              width={60}
              height={60}
              className="rounded-full"
            />
          </div>

          <div className="space-y-4">
            <Button
              onClick={() => setCurrentStep(1)}
              className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-full font-medium"
            >
              추천 이름 다시 받기
            </Button>
            <div>
              <Button onClick={onClose} variant="outline" className="px-8 py-3 rounded-full font-medium bg-transparent">
                홈으로 가기
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

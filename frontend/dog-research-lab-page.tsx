"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, Sparkles, Heart, Video, Smile } from "lucide-react"
import axios from "axios"

interface BreedIdentificationResult {
  breed: string
  confidence: number
  characteristics: string[]
  description: string
}

interface BreedingResult {
  resultBreed: string
  probability: number
  traits: string[]
  description: string
  image: string
}

interface MoodAnalysisResult {
  mood: string
  confidence: number
  emotions: {
    happy: number
    sad: number
    excited: number
    calm: number
    anxious: number
    playful: number
  }
  recommendations: string[]
  description: string
}

export default function DogResearchLabPage() {
  const [activeTab, setActiveTab] = useState<"identify" | "breeding" | "mood">("identify")

  // Breed Identification State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [identificationResult, setIdentificationResult] = useState<BreedIdentificationResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Breeding Prediction State
  const [parent1Image, setParent1Image] = useState<string>("")
  const [parent2Image, setParent2Image] = useState<string>("")
  const [breedingResults, setBreedingResults] = useState<BreedingResult[]>([])
  const [isPredicting, setIsPredicting] = useState(false)

  // Mood Analysis State
  const [moodImage, setMoodImage] = useState<string>("")
  const [moodVideo, setMoodVideo] = useState<string>("")
  const [moodResult, setMoodResult] = useState<MoodAnalysisResult | null>(null)
  const [isAnalyzingMood, setIsAnalyzingMood] = useState(false)
  const [moodInputType, setMoodInputType] = useState<"photo" | "video">("photo")

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "breed" | "parent1" | "parent2" | "mood",
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          const result = e.target.result as string
          switch (type) {
            case "breed":
              setUploadedFile(file)
              setIdentificationResult(null)
              break
            case "parent1":
              setParent1Image(result)
              break
            case "parent2":
              setParent2Image(result)
              break
            case "mood":
              setMoodImage(result)
              setMoodResult(null)
              break
          }
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setMoodVideo(e.target.result as string)
          setMoodResult(null)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeBreed = async () => {
    if (!uploadedFile) return

    setIsAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append('image', uploadedFile)

      const response = await axios.post('/api/ai/predict-breed', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const result = response.data

      if (result.success) {
        // AI 결과를 기존 인터페이스에 맞게 변환
        const aiResult = result.data
        const breedInfo = getBreedInfo(aiResult.breed)
        
        setIdentificationResult({
          breed: aiResult.breed,
          confidence: Math.round(aiResult.confidence),
          characteristics: breedInfo.characteristics,
          description: breedInfo.description,
        })
      } else {
        // 에러 발생 시 기본값 설정
        setIdentificationResult({
          breed: "분석 실패",
          confidence: 0,
          characteristics: ["분석 실패"],
          description: "이미지 분석에 실패했습니다. 다시 시도해주세요.",
        })
      }
    } catch (error) {
      console.error('품종 분석 오류:', error)
      setIdentificationResult({
        breed: "연결 오류",
        confidence: 0,
        characteristics: ["연결 오류"],
        description: "서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // 품종별 특성 정보를 반환하는 헬퍼 함수
  const getBreedInfo = (breed: string) => {
    const breedInfoMap: Record<string, { characteristics: string[], description: string }> = {
      "골든 리트리버": {
        characteristics: ["온순함", "활발함", "지능적", "가족친화적"],
        description: "골든 리트리버는 매우 온순하고 지능적인 견종으로, 가족과 함께하는 것을 좋아합니다."
      },
      "래브라도 리트리버": {
        characteristics: ["충성심", "에너지 넘침", "훈련 잘됨", "수영 좋아함"],
        description: "래브라도 리트리버는 충성심이 강하고 에너지가 넘치는 견종입니다."
      },
      "치와와": {
        characteristics: ["작은 체구", "용감함", "활발함", "주인에게 충성"],
        description: "치와와는 세계에서 가장 작은 견종 중 하나로, 작지만 용감한 성격을 가지고 있습니다."
      },
      "믹스견": {
        characteristics: ["독특함", "건강함", "다양한 성격", "적응력 좋음"],
        description: "여러 견종이 섞인 믹스견으로 보입니다. 각각의 장점을 가지고 있어요."
      }
    }

    return breedInfoMap[breed] || {
      characteristics: ["독특한 특성", "개성 있음", "사랑스러움"],
      description: `${breed}는 독특한 매력을 가진 견종입니다.`
    }
  }

  const predictBreeding = () => {
    if (!parent1Image || !parent2Image) return

    setIsPredicting(true)

    // Simulate breeding prediction
    setTimeout(() => {
      const mockResults: BreedingResult[] = [
        {
          resultBreed: "혼합견 1세대",
          probability: 85,
          traits: ["중간 크기", "온순한 성격", "지능적", "활발함"],
          description: "두 부모의 특성을 고르게 물려받은 건강한 혼합견이 될 가능성이 높습니다.",
          image: "/placeholder.svg?height=200&width=200&text=Mixed+Breed",
        },
        {
          resultBreed: "부모1 우성형",
          probability: 60,
          traits: ["부모1 외모", "부모1 성격", "중간 크기"],
          description: "첫 번째 부모의 특성이 더 강하게 나타날 수 있습니다.",
          image: "/placeholder.svg?height=200&width=200&text=Parent1+Dominant",
        },
        {
          resultBreed: "부모2 우성형",
          probability: 55,
          traits: ["부모2 외모", "부모2 성격", "독특한 조합"],
          description: "두 번째 부모의 특성이 더 강하게 나타날 수 있습니다.",
          image: "/placeholder.svg?height=200&width=200&text=Parent2+Dominant",
        },
      ]

      setBreedingResults(mockResults)
      setIsPredicting(false)
    }, 2500)
  }

  const analyzeMood = () => {
    if (!moodImage && !moodVideo) return

    setIsAnalyzingMood(true)

    // Simulate AI mood analysis
    setTimeout(() => {
      const mockMoodResults: MoodAnalysisResult[] = [
        {
          mood: "행복함",
          confidence: 92,
          emotions: {
            happy: 92,
            sad: 5,
            excited: 78,
            calm: 45,
            anxious: 8,
            playful: 85,
          },
          recommendations: ["현재 매우 좋은 상태입니다!", "놀이 시간을 늘려주세요", "간식을 주며 칭찬해주세요"],
          description:
            "강아지가 매우 행복하고 건강한 상태를 보이고 있습니다. 꼬리를 흔들고 있고 눈이 밝게 빛나고 있어요.",
        },
        {
          mood: "불안함",
          confidence: 78,
          emotions: {
            happy: 15,
            sad: 25,
            excited: 10,
            calm: 20,
            anxious: 78,
            playful: 12,
          },
          recommendations: [
            "조용한 환경을 만들어주세요",
            "부드럽게 말을 걸어주세요",
            "좋아하는 장난감을 주세요",
            "수의사 상담을 고려해보세요",
          ],
          description: "강아지가 약간 불안해하는 것 같습니다. 귀가 뒤로 젖혀져 있고 몸을 움츠리고 있어요.",
        },
        {
          mood: "평온함",
          confidence: 85,
          emotions: {
            happy: 65,
            sad: 10,
            excited: 20,
            calm: 85,
            anxious: 15,
            playful: 30,
          },
          recommendations: [
            "현재 상태를 유지해주세요",
            "적당한 휴식을 취하게 해주세요",
            "규칙적인 생활 패턴을 유지하세요",
          ],
          description: "강아지가 매우 평온하고 안정된 상태입니다. 편안하게 쉬고 있거나 만족스러워하고 있어요.",
        },
      ]

      const randomResult = mockMoodResults[Math.floor(Math.random() * mockMoodResults.length)]
      setMoodResult(randomResult)
      setIsAnalyzingMood(false)
    }, 3500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🔬 강아지 연구소</h1>
          <p className="text-gray-600">AI 기술로 강아지에 대해 더 자세히 알아보세요!</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-lg p-1 shadow-md">
            <button
              onClick={() => setActiveTab("identify")}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === "identify" ? "bg-blue-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              🐕 견종 맞추기
            </button>
            <button
              onClick={() => setActiveTab("breeding")}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === "breeding" ? "bg-blue-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              💕 교배 예측
            </button>
            <button
              onClick={() => setActiveTab("mood")}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === "mood" ? "bg-blue-500 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              😊 기분 분석
            </button>
          </div>
        </div>

        {/* Breed Identification Tab */}
        {activeTab === "identify" && (
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-center text-2xl">🎯 우리 아이 견종 맞추기</CardTitle>
                <p className="text-center text-gray-600">사진을 업로드하면 AI가 견종을 분석해드려요!</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Upload */}
                <div className="text-center">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors">
                    {uploadedFile ? (
                      <div className="space-y-4">
                        <Image
                          src={URL.createObjectURL(uploadedFile) || "/placeholder.svg"}
                          alt="Uploaded dog"
                          width={300}
                          height={300}
                          className="mx-auto rounded-lg object-cover"
                        />
                        <Button
                          onClick={() => document.getElementById("breed-image-upload")?.click()}
                          variant="outline"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          다른 사진 선택
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                        <div>
                          <Button
                            onClick={() => document.getElementById("breed-image-upload")?.click()}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            사진 업로드
                          </Button>
                          <p className="text-sm text-gray-500 mt-2">JPG, PNG 파일을 업로드해주세요</p>
                        </div>
                      </div>
                    )}
                    <input
                      id="breed-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "breed")}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Analyze Button */}
                {uploadedFile && (
                  <div className="text-center">
                    <Button
                      onClick={analyzeBreed}
                      disabled={isAnalyzing}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3"
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          AI 분석 중...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          견종 분석하기
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Results */}
                {identificationResult && (
                  <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <h3 className="text-2xl font-bold text-blue-800 mb-2">🎉 분석 결과</h3>
                        <div className="text-3xl font-bold text-blue-600">{identificationResult.breed}</div>
                        <div className="text-lg text-gray-600">정확도: {identificationResult.confidence}%</div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">주요 특성</h4>
                          <div className="flex flex-wrap gap-2">
                            {identificationResult.characteristics.map((trait, index) => (
                              <Badge key={index} className="bg-blue-100 text-blue-800">
                                {trait}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">설명</h4>
                          <p className="text-gray-700">{identificationResult.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Breeding Prediction Tab */}
        {activeTab === "breeding" && (
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-center text-2xl">💕 교배 예측 시뮬레이터</CardTitle>
                <p className="text-center text-gray-600">
                  두 부모 강아지의 사진을 업로드하여 교배 결과를 AI로 예측해보세요!
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Parent Images Upload */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Parent 1 */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-center">부모 1</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-pink-400 transition-colors">
                      {parent1Image ? (
                        <div className="space-y-3">
                          <Image
                            src={parent1Image || "/placeholder.svg"}
                            alt="Parent 1"
                            width={200}
                            height={200}
                            className="mx-auto rounded-lg object-cover"
                          />
                          <Button
                            onClick={() => document.getElementById("parent1-upload")?.click()}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            다른 사진 선택
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center space-y-3">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                          <Button
                            onClick={() => document.getElementById("parent1-upload")?.click()}
                            className="bg-pink-500 hover:bg-pink-600 text-white"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            사진 업로드
                          </Button>
                        </div>
                      )}
                      <input
                        id="parent1-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "parent1")}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Parent 2 */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-center">부모 2</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-pink-400 transition-colors">
                      {parent2Image ? (
                        <div className="space-y-3">
                          <Image
                            src={parent2Image || "/placeholder.svg"}
                            alt="Parent 2"
                            width={200}
                            height={200}
                            className="mx-auto rounded-lg object-cover"
                          />
                          <Button
                            onClick={() => document.getElementById("parent2-upload")?.click()}
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            다른 사진 선택
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center space-y-3">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                          <Button
                            onClick={() => document.getElementById("parent2-upload")?.click()}
                            className="bg-pink-500 hover:bg-pink-600 text-white"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            사진 업로드
                          </Button>
                        </div>
                      )}
                      <input
                        id="parent2-upload"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "parent2")}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* Predict Button */}
                {parent1Image && parent2Image && (
                  <div className="text-center">
                    <Button
                      onClick={predictBreeding}
                      disabled={isPredicting}
                      className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3"
                    >
                      {isPredicting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          예측 중...
                        </>
                      ) : (
                        <>
                          <Heart className="w-4 h-4 mr-2" />
                          교배 결과 예측하기
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Breeding Results */}
                {breedingResults.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-center text-pink-600 mb-4">🐶 예상 교배 결과</h3>
                    <div className="grid gap-4">
                      {breedingResults.map((result, index) => (
                        <Card key={index} className="bg-gradient-to-r from-pink-50 to-purple-50">
                          <CardContent className="p-6">
                            <div className="flex items-start space-x-4">
                              <Image
                                src={result.image || "/placeholder.svg"}
                                alt={result.resultBreed}
                                width={100}
                                height={100}
                                className="rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className="text-lg font-bold text-pink-800">{result.resultBreed}</h4>
                                  <Badge className="bg-pink-100 text-pink-800">{result.probability}% 확률</Badge>
                                </div>

                                <p className="text-gray-700 mb-3">{result.description}</p>

                                <div>
                                  <h5 className="font-semibold mb-2">예상 특성</h5>
                                  <div className="flex flex-wrap gap-2">
                                    {result.traits.map((trait, traitIndex) => (
                                      <Badge
                                        key={traitIndex}
                                        variant="outline"
                                        className="text-pink-600 border-pink-300"
                                      >
                                        {trait}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Disclaimer */}
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <p className="text-sm text-yellow-800 text-center">
                  ⚠️ 이 예측은 AI 시뮬레이션 결과이며, 실제 교배 결과와 다를 수 있습니다. 반려동물의 교배는 전문가와 상담
                  후 신중하게 결정해주세요.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mood Analysis Tab */}
        {activeTab === "mood" && (
          <div className="max-w-4xl mx-auto">
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-center text-2xl">😊 AI 기분 분석</CardTitle>
                <p className="text-center text-gray-600">사진이나 동영상을 통해 강아지의 기분 상태를 분석해드려요!</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Input Type Selection */}
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => setMoodInputType("photo")}
                    variant={moodInputType === "photo" ? "default" : "outline"}
                    className={moodInputType === "photo" ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    사진 분석
                  </Button>
                  <Button
                    onClick={() => setMoodInputType("video")}
                    variant={moodInputType === "video" ? "default" : "outline"}
                    className={moodInputType === "video" ? "bg-green-500 hover:bg-green-600" : ""}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    동영상 분석
                  </Button>
                </div>

                {/* Upload Area */}
                <div className="text-center">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-green-400 transition-colors">
                    {moodInputType === "photo" ? (
                      moodImage ? (
                        <div className="space-y-4">
                          <Image
                            src={moodImage || "/placeholder.svg"}
                            alt="Mood analysis"
                            width={300}
                            height={300}
                            className="mx-auto rounded-lg object-cover"
                          />
                          <Button
                            onClick={() => document.getElementById("mood-image-upload")?.click()}
                            variant="outline"
                          >
                            <Camera className="w-4 h-4 mr-2" />
                            다른 사진 선택
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                          <div>
                            <Button
                              onClick={() => document.getElementById("mood-image-upload")?.click()}
                              className="bg-green-500 hover:bg-green-600 text-white"
                            >
                              <Camera className="w-4 h-4 mr-2" />
                              사진 업로드
                            </Button>
                            <p className="text-sm text-gray-500 mt-2">
                              강아지의 표정이 잘 보이는 사진을 업로드해주세요
                            </p>
                          </div>
                        </div>
                      )
                    ) : moodVideo ? (
                      <div className="space-y-4">
                        <video src={moodVideo} controls className="mx-auto rounded-lg max-w-full h-64 object-cover" />
                        <Button onClick={() => document.getElementById("mood-video-upload")?.click()} variant="outline">
                          <Video className="w-4 h-4 mr-2" />
                          다른 동영상 선택
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Video className="w-16 h-16 text-gray-400 mx-auto" />
                        <div>
                          <Button
                            onClick={() => document.getElementById("mood-video-upload")?.click()}
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            <Video className="w-4 h-4 mr-2" />
                            동영상 업로드
                          </Button>
                          <p className="text-sm text-gray-500 mt-2">
                            강아지의 행동이 잘 보이는 짧은 동영상을 업로드해주세요
                          </p>
                        </div>
                      </div>
                    )}

                    <input
                      id="mood-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "mood")}
                      className="hidden"
                    />
                    <input
                      id="mood-video-upload"
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Analyze Button */}
                {(moodImage || moodVideo) && (
                  <div className="text-center">
                    <Button
                      onClick={analyzeMood}
                      disabled={isAnalyzingMood}
                      className="bg-green-500 hover:bg-green-600 text-white px-8 py-3"
                    >
                      {isAnalyzingMood ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          AI 기분 분석 중...
                        </>
                      ) : (
                        <>
                          <Smile className="w-4 h-4 mr-2" />
                          기분 분석하기
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Mood Analysis Results */}
                {moodResult && (
                  <div className="space-y-6">
                    <Card className="bg-gradient-to-r from-green-50 to-blue-50">
                      <CardContent className="p-6">
                        <div className="text-center mb-6">
                          <h3 className="text-2xl font-bold text-green-800 mb-2">🎭 기분 분석 결과</h3>
                          <div className="text-3xl font-bold text-green-600">{moodResult.mood}</div>
                          <div className="text-lg text-gray-600">정확도: {moodResult.confidence}%</div>
                        </div>

                        <div className="space-y-6">
                          {/* Emotion Chart */}
                          <div>
                            <h4 className="font-semibold mb-4 text-center">감정 상태 분석</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {Object.entries(moodResult.emotions).map(([emotion, value]) => (
                                <div key={emotion} className="text-center">
                                  <div className="text-sm font-medium mb-2 capitalize">
                                    {emotion === "happy" && "행복"}
                                    {emotion === "sad" && "슬픔"}
                                    {emotion === "excited" && "흥분"}
                                    {emotion === "calm" && "평온"}
                                    {emotion === "anxious" && "불안"}
                                    {emotion === "playful" && "장난기"}
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
                                    <div
                                      className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                                      style={{ width: `${value}%` }}
                                    ></div>
                                  </div>
                                  <div className="text-xs text-gray-600">{value}%</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Description */}
                          <div>
                            <h4 className="font-semibold mb-2">상세 분석</h4>
                            <p className="text-gray-700 bg-white p-4 rounded-lg">{moodResult.description}</p>
                          </div>

                          {/* Recommendations */}
                          <div>
                            <h4 className="font-semibold mb-2">추천 행동</h4>
                            <div className="space-y-2">
                              {moodResult.recommendations.map((rec, index) => (
                                <div key={index} className="flex items-start bg-white p-3 rounded-lg">
                                  <span className="text-green-500 mr-3 mt-1">•</span>
                                  <span className="text-gray-700">{rec}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <p className="text-sm text-blue-800 text-center">
                  💡 AI 기분 분석은 강아지의 표정, 자세, 행동을 종합적으로 분석합니다. 정확한 진단을 위해서는 수의사와
                  상담하세요.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

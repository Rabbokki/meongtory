"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, Sparkles, Heart, Smile, Shield, ExternalLink } from "lucide-react"
import axios from "axios"
import { getBackendUrl } from "@/lib/api"

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
    angry: number
    relaxed: number
  }
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
  const [breedingResult, setBreedingResult] = useState<BreedingResult | null>(null)
  const [isPredicting, setIsPredicting] = useState(false)

  // Mood Analysis State
  const [moodImage, setMoodImage] = useState<string>("")
  const [moodResult, setMoodResult] = useState<MoodAnalysisResult | null>(null)
  const [isAnalyzingMood, setIsAnalyzingMood] = useState(false)

  // Feedback State
  const [showFeedback, setShowFeedback] = useState(false)
  const [selectedCorrectEmotion, setSelectedCorrectEmotion] = useState<string>("")
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)

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
              // 새 이미지 업로드 시 피드백 상태 초기화
              setShowFeedback(false)
              setSelectedCorrectEmotion("")
              setFeedbackSubmitted(false)
              setIsSubmittingFeedback(false)
              break
          }
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
      const response = await axios.post(`${getBackendUrl()}/api/breed/predict`, 
        formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const result = response.data

      // 백엔드에서 ResponseDto로 래핑해서 보내므로 data 필드에서 실제 결과 추출
      if (result.success && result.data) {
        const breedData = result.data
        const breedInfo = getBreedInfo(breedData.breed)
        
        setIdentificationResult({
          breed: breedData.breed,
          confidence: Math.round(breedData.confidence),
          characteristics: breedInfo.characteristics,
          description: breedInfo.description,
        })
      } else {
        throw new Error(result.error?.message || '품종 분석에 실패했습니다.')
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

  /** ----------------- 교배 예측 ----------------- */
  const predictBreeding = async () => {
    if (!parent1Image || !parent2Image) return;

    setIsPredicting(true);
    setBreedingResult(null);

    try {
      const parent1Blob = await fetch(parent1Image).then((res) => res.blob());
      const parent2Blob = await fetch(parent2Image).then((res) => res.blob());

      if (
        parent1Blob.size > 10 * 1024 * 1024 ||
        parent2Blob.size > 10 * 1024 * 1024
      ) {
        throw new Error("이미지 크기가 10MB를 초과합니다.");
      }
      const okType = (t: string) => ["image/jpeg", "image/png"].includes(t);
      if (!okType(parent1Blob.type) || !okType(parent2Blob.type)) {
        throw new Error("허용된 파일 형식은 JPG, PNG입니다.");
      }

      const formData = new FormData();
      formData.append("parent1", parent1Blob, "parent1.jpg");
      formData.append("parent2", parent2Blob, "parent2.jpg");

      const response = await axios.post(`${getBackendUrl()}/api/ai/predict-breeding`, formData);
      const result = response.data;
      
      if (!result) throw new Error("No result received from API");

      // 백엔드에서 BreedingResultDto를 직접 반환하므로 바로 사용
      setBreedingResult(result);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("교배 예측 오류:", err.response?.data || err.message);
        setBreedingResult({
          resultBreed: "예측 실패",
          probability: 0,
          traits: ["오류"],
          description: `예측에 실패했습니다: ${
            err.response?.data?.description ?? err.message
          }`,
          image: "",
        });
      } else if (err instanceof Error) {
        console.error("교배 예측 오류:", err.message);
        setBreedingResult({
          resultBreed: "예측 실패",
          probability: 0,
          traits: ["오류"],
          description: `예측에 실패했습니다: ${err.message}`,
          image: "",
        });
      } else {
        console.error("교배 예측 오류:", err);
        setBreedingResult({
          resultBreed: "예측 실패",
          probability: 0,
          traits: ["오류"],
          description: "예측에 실패했습니다.",
          image: "",
        });
      }
    } finally {
      setIsPredicting(false);
    }
  };

  const analyzeMood = async () => {
    if (!moodImage) return

    setIsAnalyzingMood(true)
    // 새로운 분석 시 피드백 상태 초기화
    setShowFeedback(false)
    setSelectedCorrectEmotion("")
    setFeedbackSubmitted(false)
    setIsSubmittingFeedback(false)

    try {
      // 사진 분석을 위한 File 객체 생성
      const response = await fetch(moodImage)
      const blob = await response.blob()
      const file = new File([blob], 'emotion-image.jpg', { type: blob.type })

      const formData = new FormData()
      formData.append('image', file)

      const apiResponse = await axios.post(`${getBackendUrl()}/api/emotion/analyze`, formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const result = apiResponse.data

      if (result.success) {
        const aiResult = result.data
        
        // AI 결과를 기존 인터페이스에 맞게 변환
        const moodInfo = getMoodInfo(aiResult.emotion, aiResult.emotionKorean)
        
        setMoodResult({
          mood: aiResult.emotionKorean,
          confidence: Math.round(aiResult.confidence),
          emotions: aiResult.emotions || { happy: 25, sad: 25, angry: 25, relaxed: 25 }, // AI 실제 분석 결과 사용
          description: moodInfo.description,
        })
      } else {
        // 에러 발생 시 기본값 설정
        setMoodResult({
          mood: "분석 실패",
          confidence: 0,
          emotions: {
            happy: 0,
            sad: 0,
            angry: 0,
            relaxed: 0,
          },
          description: "감정 분석에 실패했습니다. 강아지의 얼굴이 명확히 보이는 사진을 업로드해주세요.",
        })
      }
    } catch (error) {
      console.error('감정 분석 오류:', error)
      setMoodResult({
        mood: "연결 오류",
        confidence: 0,
        emotions: {
          happy: 0,
          sad: 0,
          angry: 0,
          relaxed: 0,
        },
        description: "서버 연결 오류가 발생했습니다.",
      })
    } finally {
      setIsAnalyzingMood(false)
    }
  }

  // 감정별 추천사항과 설명을 반환하는 헬퍼 함수
  const getMoodInfo = (emotion: string, emotionKorean: string) => {
    const moodInfoMap: Record<string, { description: string }> = {
      "happy": {
        description: "강아지가 매우 행복하고 건강한 상태를 보이고 있습니다."
      },
      "sad": {
        description: "강아지가 슬퍼하는 것 같습니다. 관심과 사랑을 보여주세요."
      },
      "angry": {
        description: "강아지가 화나거나 스트레스를 받고 있는 것 같습니다."
      },
      "relaxed": {
        description: "강아지가 매우 편안하고 안정된 상태입니다."
      }
    }

    return moodInfoMap[emotion] || {
      description: `강아지의 감정 상태가 ${emotionKorean}로 분석되었습니다.`
    }
  }

  // 피드백 제출 처리 함수
  const handleFeedbackSubmit = async (isCorrect: boolean) => {
    if (!moodResult) return

    setIsSubmittingFeedback(true)

    try {
      // 이미지를 base64에서 File 객체로 변환
      const response = await fetch(moodImage)
      const blob = await response.blob()
      const file = new File([blob], 'emotion-feedback.jpg', { type: blob.type })

      // 이미지를 다시 업로드하여 URL 받기 (실제로는 이미 분석된 이미지의 URL을 사용해야 함)
      // 현재는 임시로 base64 URL 사용
      const imageUrl = moodImage

      const feedbackData = {
        imageUrl: imageUrl,
        predictedEmotion: Object.keys(moodResult.emotions).find(
          (emotion) => moodResult.emotions[emotion as keyof typeof moodResult.emotions] === Math.max(
            ...Object.values(moodResult.emotions)
          )
        ) || 'unknown',
        correctEmotion: isCorrect ? 
          Object.keys(moodResult.emotions).find(
            (emotion) => moodResult.emotions[emotion as keyof typeof moodResult.emotions] === Math.max(
              ...Object.values(moodResult.emotions)
            )
          ) : selectedCorrectEmotion,
        isCorrectPrediction: isCorrect,
        predictionConfidence: moodResult.confidence / 100.0
      }

      const apiResponse = await axios.post(
        `${getBackendUrl()}/api/emotion/feedback`,
        feedbackData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (apiResponse.data.success) {
        setFeedbackSubmitted(true)
        setShowFeedback(false)
        setSelectedCorrectEmotion("")
      } else {
        console.error('피드백 제출 실패:', apiResponse.data.message)
        alert('피드백 제출에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('피드백 제출 오류:', error)
      alert('피드백 제출 중 오류가 발생했습니다.')
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  /** ----------------- 재사용 업로드 컴포넌트 ----------------- */
  const ParentUpload: React.FC<{
    label: string;
    image: string;
    inputId: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }> = ({ label, image, inputId, onChange }) => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-center">{label}</label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-pink-400 transition-colors">
        {image ? (
          <div className="flex flex-col items-center gap-3">
            <div className="relative h-[280px] w-[280px] rounded-xl overflow-hidden">
              <Image
                src={image}
                alt={label}
                fill
                className="object-cover"
                unoptimized
                sizes="(max-width: 768px) 100vw, 280px"
              />
            </div>
            <Button
              onClick={() => document.getElementById(inputId)?.click()}
              variant="outline"
              size="sm"
              className="mt-1 w-[240px] justify-center"
            >
              <Camera className="w-4 h-4 mr-2" />
              다른 사진 선택
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <Button
              onClick={() => document.getElementById(inputId)?.click()}
              className="bg-pink-500 hover:bg-pink-600 text-white"
            >
              <Camera className="w-4 h-4 mr-2" />
              사진 업로드
            </Button>
          </div>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/*"
          onChange={onChange}
          className="hidden"
        />
      </div>
    </div>
  );

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
                  {/* 부모 업로드 박스 */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <ParentUpload
                      label="부모 1"
                      image={parent1Image}
                      inputId="parent1-upload"
                      onChange={(e) => handleImageUpload(e, "parent1")}
                    />
                    <ParentUpload
                      label="부모 2"
                      image={parent2Image}
                      inputId="parent2-upload"
                      onChange={(e) => handleImageUpload(e, "parent2")}
                    />
                  </div>

                                  {/* 예측 버튼 */}
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

                {/* 결과 */}
                {breedingResult && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-center text-pink-600 mb-4">
                       예상 교배 결과
                    </h3>
                    <Card className="bg-gradient-to-r from-pink-50 to-purple-50">
                      <CardContent className="p-6">
                        <div className="flex flex-col items-center">
                          <a
                            href={breedingResult.image}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                            title="이미지를 클릭하면 크게 볼 수 있어요"
                          >
                            <Image
                              src={breedingResult.image || "/placeholder.svg"}
                              alt={breedingResult.resultBreed || "교배 결과"}
                              width={640}
                              height={640}
                              unoptimized
                              sizes="(max-width: 768px) 100vw, 640px"
                              className="w-full max-w-[440px] aspect-square object-cover rounded-2xl shadow-md mb-4"
                            />
                          </a>
                          <div className="text-xs text-gray-400 mb-2">
                            (이미지를 클릭하면 크게 볼 수 있어요)
                          </div>

                          <div className="w-full max-w-2xl">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xl md:text-2xl font-bold text-pink-800">
                                {breedingResult.resultBreed}
                              </h4>
                              <Badge className="bg-pink-100 text-pink-800">
                                {breedingResult.probability}% 확률
                              </Badge>
                            </div>

                            <p className="text-gray-700 mb-4 leading-relaxed">
                              {breedingResult.description}
                            </p>

                            <div>
                              <h5 className="font-semibold mb-2">예상 특성</h5>
                              <div className="flex flex-wrap gap-2">
                                {breedingResult.traits?.map((t, i) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-pink-600 border-pink-300"
                                  >
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
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
                <p className="text-center text-gray-600">사진을 통해 강아지의 기분 상태를 분석해드려요!</p>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Upload Area */}
                <div className="text-center">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-green-400 transition-colors">
                    {moodImage ? (
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
                    )}

                    <input
                      id="mood-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "mood")}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Analyze Button */}
                {moodImage && (
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
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {Object.entries(moodResult.emotions).map(([emotion, value]) => (
                                <div key={emotion} className="text-center">
                                  <div className="text-sm font-medium mb-2 capitalize">
                                    {emotion === "happy" && "행복"}
                                    {emotion === "sad" && "슬픔"}
                                    {emotion === "angry" && "화남"}
                                    {emotion === "relaxed" && "편안함"}
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

                          {/* Feedback Section */}
                          <div>
                            <h4 className="font-semibold mb-3">분석 정확도 피드백</h4>
                            {!feedbackSubmitted ? (
                              <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="mb-4">
                                  <p className="text-gray-700 mb-3">이 감정 분석이 정확한가요?</p>
                                  <div className="flex gap-3">
                                    <Button
                                      onClick={() => handleFeedbackSubmit(true)}
                                      disabled={isSubmittingFeedback}
                                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600"
                                    >
                                      <Heart className="w-4 h-4" />
                                      정확해요
                                    </Button>
                                    <Button
                                      onClick={() => setShowFeedback(true)}
                                      disabled={isSubmittingFeedback}
                                      variant="outline"
                                      className="flex items-center gap-2"
                                    >
                                      <Smile className="w-4 h-4" />
                                      수정하기
                                    </Button>
                                  </div>
                                </div>

                                {showFeedback && (
                                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-600 mb-2">올바른 감정을 선택해주세요:</p>
                                    <select
                                      value={selectedCorrectEmotion}
                                      onChange={(e) => setSelectedCorrectEmotion(e.target.value)}
                                      className="w-full p-2 border border-gray-300 rounded-md mb-3"
                                      disabled={isSubmittingFeedback}
                                    >
                                      <option value="">감정을 선택하세요</option>
                                      <option value="happy">행복</option>
                                      <option value="sad">슬픔</option>
                                      <option value="angry">화남</option>
                                      <option value="relaxed">편안함</option>
                                    </select>
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => handleFeedbackSubmit(false)}
                                        disabled={!selectedCorrectEmotion || isSubmittingFeedback}
                                        size="sm"
                                        className="bg-blue-500 hover:bg-blue-600"
                                      >
                                        {isSubmittingFeedback ? "제출 중..." : "피드백 제출"}
                                      </Button>
                                      <Button
                                        onClick={() => {
                                          setShowFeedback(false)
                                          setSelectedCorrectEmotion("")
                                        }}
                                        disabled={isSubmittingFeedback}
                                        variant="outline"
                                        size="sm"
                                      >
                                        취소
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                <div className="flex items-center gap-2 text-green-700">
                                  <Heart className="w-5 h-5" />
                                  <span className="font-medium">피드백을 제출해주셔서 감사합니다!</span>
                                </div>
                                <p className="text-green-600 text-sm mt-1">
                                  여러분의 피드백이 AI 모델 개선에 도움이 됩니다.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

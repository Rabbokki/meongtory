"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, FileText, Sparkles } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { ArrowLeft } from "lucide-react";

interface AnimalRecord {
  id: string
  name: string
  breed: string
  age: number
  gender: "수컷" | "암컷"
  weight: number
  registrationDate: Date
  medicalHistory: string[]
  vaccinations: string[]
  microchipId?: string
  notes: string
  contractGenerated: boolean
  aiBackgroundStory?: string
}

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

interface AnimalRegistrationPageProps {
  isAdmin: boolean
  currentUserId?: string
  onAddPet?: (pet: Pet) => void
  onClose: () => void; // Add onClose prop
}

export default function AnimalRegistrationPage({ isAdmin, currentUserId, onAddPet, onClose }: AnimalRegistrationPageProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewRegistrationForm, setShowNewRegistrationForm] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)

  const [newAnimal, setNewAnimal] = useState({
    name: "",
    breed: "",
    age: "",
    gender: "",
    weight: "",
    location: "",
    medicalHistory: "",
    vaccinations: "",
    microchipId: "",
    notes: "",
    aiBackgroundStory: "",
  })

  // Mock data for existing registrations
  const [animalRecords] = useState<AnimalRecord[]>([
    {
      id: "REG001",
      name: "멍멍이",
      breed: "골든 리트리버",
      age: 3,
      gender: "수컷",
      weight: 25.5,
      registrationDate: new Date("2024-01-15"),
      medicalHistory: ["예방접종 완료", "중성화 수술 완료"],
      vaccinations: ["광견병", "종합백신"],
      microchipId: "KR123456789",
      notes: "매우 온순하고 사람을 좋아함",
      contractGenerated: true,
      aiBackgroundStory:
        "골든 리트리버 멍멍이는 따뜻한 가정에서 태어나 사랑받으며 자란 반려견입니다. 어릴 때부터 아이들과 함께 자라며 온순하고 친화적인 성격을 갖게 되었습니다.",
    },
    {
      id: "REG002",
      name: "야옹이",
      breed: "페르시안",
      age: 2,
      gender: "암컷",
      weight: 4.2,
      registrationDate: new Date("2024-02-20"),
      medicalHistory: ["중성화 수술 완료"],
      vaccinations: ["종합백신", "광견병"],
      microchipId: "KR987654321",
      notes: "조용하고 독립적인 성격",
      contractGenerated: true,
      aiBackgroundStory:
        "우아한 페르시안 고양이 야옹이는 조용한 환경을 선호하며, 주인과의 깊은 유대감을 형성하는 것을 좋아합니다.",
    },
  ])

  const filteredRecords = animalRecords.filter(
    (record) =>
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleGenerateContract = (animalId: string) => {
    alert(`${animalId} 동물의 계약서가 생성되었습니다.`)
  }

  const handleGenerateAIStory = async () => {
    if (!newAnimal.name || !newAnimal.breed) {
      alert("동물 이름, 품종을 먼저 입력해주세요.")
      return
    }

    setIsGeneratingStory(true)

    // Simulate AI story generation
    setTimeout(() => {
      const stories = [
        `${newAnimal.breed} ${newAnimal.name}는 따뜻한 가정에서 태어나 사랑받으며 자란 반려동물입니다. 어릴 때부터 가족들과 함께 시간을 보내며 친화적이고 온순한 성격을 갖게 되었습니다.`,
        `활발하고 호기심 많은 ${newAnimal.name}는 새로운 환경에 잘 적응하며, 주인과의 깊은 유대감을 형성하는 것을 좋아합니다. 건강하고 활동적인 생활을 즐기는 반려동물입니다.`,
        `${newAnimal.name}는 조용하고 차분한 성격으로, 평화로운 환경에서 자라왔습니다. 주인에게 충성스럽고 다른 동물들과도 잘 어울리는 사회성 좋은 반려동물입니다.`,
      ]

      const randomStory = stories[Math.floor(Math.random() * stories.length)]
      setNewAnimal((prev) => ({ ...prev, aiBackgroundStory: randomStory }))
      setIsGeneratingStory(false)
    }, 2000)
  }

  const handleSubmitRegistration = () => {
    if (!newAnimal.name || !newAnimal.breed) {
      alert("필수 정보를 모두 입력해주세요.")
      return
    }

    // Create a new pet object for the adoption page
    const newPet: Pet = {
      id: Date.now(), // Simple ID generation
      name: newAnimal.name,
      type:
        newAnimal.breed.includes("골든") ||
        newAnimal.breed.includes("리트리버") ||
        newAnimal.breed.includes("말티즈") ||
        newAnimal.breed.includes("시바") ||
        newAnimal.breed.includes("진돗개") ||
        newAnimal.breed.includes("포메라니안") ||
        newAnimal.breed.includes("비글") ||
        newAnimal.breed.includes("웰시코기")
          ? "강아지"
          : "고양이",
      breed: newAnimal.breed,
      age: newAnimal.age + "살",
      gender: newAnimal.gender === "수컷" ? "male" : "female",
      neutered: newAnimal.medicalHistory.includes("중성화") || newAnimal.notes.includes("중성화"),
      location: newAnimal.location || "서울특별시",
      image: "/placeholder.svg?height=200&width=300",
      status: "보호중",
      description: newAnimal.notes,
      weight: newAnimal.weight + "kg",
      medicalHistory: newAnimal.medicalHistory,
      rescueStory: newAnimal.aiBackgroundStory,
    }

    // Add to adoption page if callback is provided
    if (onAddPet) {
      onAddPet(newPet)
    }

    alert("동물 등록이 완료되었습니다!")
    setShowNewRegistrationForm(false)
    setNewAnimal({
      name: "",
      breed: "",
      age: "",
      gender: "",
      weight: "",
      location: "",
      medicalHistory: "",
      vaccinations: "",
      microchipId: "",
      notes: "",
      aiBackgroundStory: "",
    })
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold mb-4">접근 권한이 없습니다</h2>
              <p className="text-gray-600">관리자만 동물 등록 페이지에 접근할 수 있습니다.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={onClose} className="hover:bg-gray-100">
              <ArrowLeft className="w-4 h-4 mr-2" />
              관리자 페이지로 돌아가기
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">동물 등록 관리</h1>
              <p className="text-gray-600">보호소 동물들의 등록 정보를 관리하고 계약서를 생성할 수 있습니다</p>
            </div>
          </div>
        </div>

        {/* Search and Add Button */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="동물 이름, 등록번호로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setShowNewRegistrationForm(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black"
          >
            <Plus className="w-4 h-4 mr-2" />새 동물 등록
          </Button>
        </div>

        {/* New Registration Form */}
        {showNewRegistrationForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>새 동물 등록</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">기본 정보</h3>

                  <div>
                    <Label htmlFor="name">동물 이름 *</Label>
                    <Input
                      id="name"
                      value={newAnimal.name}
                      onChange={(e) => setNewAnimal({ ...newAnimal, name: e.target.value })}
                      placeholder="동물 이름을 입력하세요"
                    />
                  </div>

                  <div>
                    <Label htmlFor="breed">품종 *</Label>
                    <Input
                      id="breed"
                      value={newAnimal.breed}
                      onChange={(e) => setNewAnimal({ ...newAnimal, breed: e.target.value })}
                      placeholder="품종을 입력하세요"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="age">나이</Label>
                      <Input
                        id="age"
                        type="number"
                        value={newAnimal.age}
                        onChange={(e) => setNewAnimal({ ...newAnimal, age: e.target.value })}
                        placeholder="나이"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">성별</Label>
                      <Select
                        value={newAnimal.gender}
                        onValueChange={(value) => setNewAnimal({ ...newAnimal, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="성별" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="수컷">수컷</SelectItem>
                          <SelectItem value="암컷">암컷</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weight">체중 (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={newAnimal.weight}
                        onChange={(e) => setNewAnimal({ ...newAnimal, weight: e.target.value })}
                        placeholder="체중"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">지역</Label>
                      <Input
                        id="location"
                        value={newAnimal.location}
                        onChange={(e) => setNewAnimal({ ...newAnimal, location: e.target.value })}
                        placeholder="지역을 입력하세요"
                      />
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">의료 정보</h3>

                  <div>
                    <Label htmlFor="microchipId">마이크로칩 ID</Label>
                    <Input
                      id="microchipId"
                      value={newAnimal.microchipId}
                      onChange={(e) => setNewAnimal({ ...newAnimal, microchipId: e.target.value })}
                      placeholder="마이크로칩 ID"
                    />
                  </div>

                  <div>
                    <Label htmlFor="medicalHistory">의료 기록</Label>
                    <Textarea
                      id="medicalHistory"
                      value={newAnimal.medicalHistory}
                      onChange={(e) => setNewAnimal({ ...newAnimal, medicalHistory: e.target.value })}
                      placeholder="의료 기록을 입력하세요 (예: 예방접종 완료, 중성화 수술 완료)"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="vaccinations">예방접종 기록</Label>
                    <Textarea
                      id="vaccinations"
                      value={newAnimal.vaccinations}
                      onChange={(e) => setNewAnimal({ ...newAnimal, vaccinations: e.target.value })}
                      placeholder="예방접종 기록을 입력하세요"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              {/* AI Background Story Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="aiBackgroundStory">AI 배경 스토리</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGenerateAIStory}
                    disabled={isGeneratingStory}
                    className="text-purple-600 border-purple-200 hover:bg-purple-50 bg-transparent"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isGeneratingStory ? "생성 중..." : "AI 스토리 생성"}
                  </Button>
                </div>
                <Textarea
                  id="aiBackgroundStory"
                  value={newAnimal.aiBackgroundStory}
                  onChange={(e) => setNewAnimal({ ...newAnimal, aiBackgroundStory: e.target.value })}
                  placeholder="AI가 생성한 동물의 배경 스토리가 여기에 표시됩니다..."
                  rows={4}
                  className="bg-purple-50 border-purple-200"
                />
              </div>

              {/* Additional Notes */}
              <div>
                <Label htmlFor="notes">추가 메모</Label>
                <Textarea
                  id="notes"
                  value={newAnimal.notes}
                  onChange={(e) => setNewAnimal({ ...newAnimal, notes: e.target.value })}
                  placeholder="추가 메모를 입력하세요"
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setShowNewRegistrationForm(false)}>
                  취소
                </Button>
                <Button onClick={handleSubmitRegistration} className="bg-yellow-400 hover:bg-yellow-500 text-black">
                  등록 완료
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Animal Records List */}
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">등록된 동물이 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((animal) => (
              <Card key={animal.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl">
                          {animal.breed.includes("골든") ||
                          animal.breed.includes("리트리버") ||
                          animal.breed.includes("말티즈") ||
                          animal.breed.includes("시바") ||
                          animal.breed.includes("진돗개") ||
                          animal.breed.includes("포메라니안") ||
                          animal.breed.includes("비글") ||
                          animal.breed.includes("웰시코기")
                            ? "🐕"
                            : "🐱"}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{animal.name}</h3>
                        <p className="text-gray-600">
                          {animal.breed} • {animal.age}세 • {animal.gender}
                        </p>
                        <p className="text-sm text-gray-500">등록번호: {animal.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="pointer-events-none">
                        <Badge className="bg-green-100 text-green-800 cursor-default">계약서 생성됨</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">기본 정보</h4>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-medium">체중:</span> {animal.weight}kg
                        </p>
                        <p>
                          <span className="font-medium">등록일:</span>{" "}
                          {format(animal.registrationDate, "yyyy년 MM월 dd일", { locale: ko })}
                        </p>
                        {animal.microchipId && (
                          <p>
                            <span className="font-medium">마이크로칩:</span> {animal.microchipId}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {animal.aiBackgroundStory && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2 flex items-center">
                        <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                        AI 배경 스토리
                      </h4>
                      <p className="text-sm text-gray-700 bg-purple-50 p-3 rounded-lg border border-purple-200">
                        {animal.aiBackgroundStory}
                      </p>
                    </div>
                  )}

                  {animal.medicalHistory.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">의료 기록</h4>
                      <div className="flex flex-wrap gap-2">
                        {animal.medicalHistory.map((record, index) => (
                          <Badge key={index} variant="outline">
                            {record}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {animal.vaccinations.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">예방접종</h4>
                      <div className="flex flex-wrap gap-2">
                        {animal.vaccinations.map((vaccination, index) => (
                          <Badge key={index} variant="outline" className="bg-green-50">
                            {vaccination}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {animal.notes && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">추가 메모</h4>
                      <p className="text-sm text-gray-700">{animal.notes}</p>
                    </div>
                  )}

                  <div className="mt-6 flex justify-end space-x-4">
                    <Button variant="outline" size="sm">
                      정보 수정
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleGenerateContract(animal.id)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      계약서 보기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Plus } from "lucide-react"

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

interface AdoptionPageProps {
  isAdmin?: boolean
  isLoggedIn?: boolean
  onNavigateToAnimalRegistration?: () => void
  pets?: Pet[]
  onViewPet?: (pet: Pet) => void
}

const PETS_PER_PAGE = 6

export default function AdoptionPage({
  isAdmin = false,
  isLoggedIn = false,
  onNavigateToAnimalRegistration,
  pets = [],
  onViewPet,
}: AdoptionPageProps) {
  const [activeFilters, setActiveFilters] = useState<string[]>(["보호"])
  const [displayedPetsCount, setDisplayedPetsCount] = useState(PETS_PER_PAGE)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("전체")
  const [selectedAge, setSelectedAge] = useState("전체")
  const [selectedGender, setSelectedGender] = useState("전체")
  const [selectedNeutering, setSelectedNeutering] = useState("전체")

  // Filter pets based on selected criteria
  const filteredPets = pets.filter((pet) => {
    if (selectedStatus !== "전체" && pet.status !== selectedStatus) return false
    if (selectedAge !== "전체") {
      const ageNum = Number.parseInt(pet.age)
      switch (selectedAge) {
        case "1살 미만":
          if (ageNum >= 1) return false
          break
        case "1-3살":
          if (ageNum < 1 || ageNum > 3) return false
          break
        case "4-7살":
          if (ageNum < 4 || ageNum > 7) return false
          break
        case "8살 이상":
          if (ageNum < 8) return false
          break
      }
    }
    if (selectedGender !== "전체") {
      const genderMap = { 수컷: "male", 암컷: "female" }
      if (pet.gender !== genderMap[selectedGender as keyof typeof genderMap]) return false
    }
    if (selectedNeutering !== "전체") {
      const neuteredMap = { 완료: true, 미완료: false }
      if (pet.neutered !== neuteredMap[selectedNeutering as keyof typeof neuteredMap]) return false
    }
    return true
  })

  const displayedPets = filteredPets.slice(0, displayedPetsCount)
  const hasMorePets = displayedPetsCount < filteredPets.length

  const loadMorePets = () => {
    setIsLoading(true)
    // 실제 로딩 시뮬레이션
    setTimeout(() => {
      setDisplayedPetsCount((prev) => Math.min(prev + PETS_PER_PAGE, filteredPets.length))
      setIsLoading(false)
    }, 1000)
  }

  const handlePetClick = (pet: Pet) => {
    if (onViewPet) {
      onViewPet(pet)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Admin Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">입양</h1>
            <p className="text-gray-600">사랑이 필요한 아이들을 만나보세요</p>
          </div>
        
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 relative z-10">
          <div className="flex flex-wrap gap-4 mb-4">
            {/* Status Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent relative z-20">
                  상태: {selectedStatus}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="relative z-[999]">
                <DropdownMenuItem onClick={() => setSelectedStatus("전체")}>전체</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("보호중")}>보호중</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedStatus("입양완료")}>입양완료</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Age Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent relative z-20">
                  나이: {selectedAge}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="relative z-[999]">
                <DropdownMenuItem onClick={() => setSelectedAge("전체")}>전체</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedAge("1살 미만")}>1살 미만</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedAge("1-3살")}>1-3살</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedAge("4-7살")}>4-7살</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedAge("8살 이상")}>8살 이상</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Gender Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent relative z-20">
                  성별: {selectedGender}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="relative z-[999]">
                <DropdownMenuItem onClick={() => setSelectedGender("전체")}>전체</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedGender("수컷")}>수컷</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedGender("암컷")}>암컷</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Neutering Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent relative z-20">
                  중성화: {selectedNeutering}
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="relative z-[999]">
                <DropdownMenuItem onClick={() => setSelectedNeutering("전체")}>전체</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedNeutering("완료")}>완료</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedNeutering("미완료")}>미완료</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🐾</span>
          <span className="text-lg font-medium">
            <span className="text-blue-600 font-bold">{filteredPets.length}</span> 마리의 아이들이 보호처를 기다리고
            있어요
            {displayedPetsCount < filteredPets.length && (
              <span className="text-gray-500 ml-2">(현재 {displayedPetsCount}마리 표시 중)</span>
            )}
          </span>
        </div>

        {/* Pet Grid */}
        {displayedPets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedPets.map((pet) => (
              <Card
                key={pet.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handlePetClick(pet)}
              >
                <div className="relative">
                  <Image
                    src={pet.image || "/placeholder.svg?height=200&width=300&query=cute pet"}
                    alt={`${pet.type} ${pet.breed}`}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className="absolute top-3 left-3 bg-yellow-400 text-black hover:bg-yellow-500">
                    {pet.status}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">
                      [{pet.type}] {pet.breed} {pet.age}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span className={pet.gender === "male" ? "text-blue-500" : "text-pink-500"}>
                        {pet.gender === "male" ? "♂" : "♀"} {pet.gender === "male" ? "남아" : "여아"}
                      </span>
                      <span>•</span>
                      <span>{pet.neutered ? "중성화 완료" : "중성화 미완료"}</span>
                    </div>
                    <p className="text-sm text-gray-500">지역 : {pet.location}</p>
                  </div>
                  <div className="flex justify-end mt-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">🐕</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐾</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">등록된 동물이 없습니다</h3>
            <p className="text-gray-500 mb-6">관리자가 동물을 등록하면 여기에 표시됩니다.</p>
            {isAdmin && isLoggedIn && (
              <Button onClick={onNavigateToAnimalRegistration} className="bg-yellow-400 hover:bg-yellow-500 text-black">
                <Plus className="w-4 h-4 mr-2" />첫 번째 동물 등록하기
              </Button>
            )}
          </div>
        )}

        {/* Load More Button */}
        {hasMorePets && (
          <div className="text-center mt-12">
            <Button size="lg" className="px-8" onClick={loadMorePets} disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  로딩 중...
                </>
              ) : (
                `더 많은 아이들 보기 (${filteredPets.length - displayedPetsCount}마리 더)`
              )}
            </Button>
          </div>
        )}

        {/* All pets loaded message */}
        {!hasMorePets && filteredPets.length > PETS_PER_PAGE && (
          <div className="text-center mt-12">
            <p className="text-gray-600">모든 아이들을 확인했습니다! 🐾</p>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, FileText, Sparkles, Upload, X, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ko } from "date-fns/locale"
import { ArrowLeft } from "lucide-react"
import { petApi, s3Api, Pet as ApiPet, handleApiError } from "@/lib/api"
import AnimalEditModal from "@/components/modals/animal-edit-modal"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"
import { getBackendUrl } from "@/lib/api"

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
  images?: string[]
}

import type { Pet } from "@/types/pets"

interface AnimalRegistrationPageProps {
  isAdmin: boolean
  currentUserId?: string
  onAddPet?: (pet: Pet) => void
  onClose: () => void; // Add onClose prop
}

export default function AnimalRegistrationPage({ isAdmin, currentUserId, onAddPet, onClose }: AnimalRegistrationPageProps) {
  const { toast } = useToast()
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
    // 엔티티와 일치하도록 추가 필드들
    personality: "",
    description: "",
    specialNeeds: "",
    rescueStory: "",
    status: "보호중",
    type: "",
    isNeutered: false,
    isVaccinated: false,
  })

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const [animalRecords, setAnimalRecords] = useState<AnimalRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPetForEdit, setSelectedPetForEdit] = useState<Pet | null>(null)

  useEffect(() => {
    const fetchPets = async () => {
      setLoading(true)
      try {
        const pets = await petApi.getPets()
        const records: AnimalRecord[] = pets.map((pet) => ({
          id: `REG${pet.petId.toString().padStart(3, '0')}`,
          name: pet.name,
          breed: pet.breed,
          age: pet.age,
          gender: pet.gender === "MALE" ? "수컷" : "암컷",
          weight: pet.weight || 0,
          registrationDate: new Date(), 
          medicalHistory: pet.medicalHistory ? [pet.medicalHistory] : [],
          vaccinations: pet.vaccinations ? [pet.vaccinations] : [],
          microchipId: pet.microchipId || "",
          notes: pet.notes || "",
          contractGenerated: true, 
          aiBackgroundStory: pet.aiBackgroundStory || "",
          images: pet.imageUrl ? [pet.imageUrl] : [],
        }))
        setAnimalRecords(records)
      } catch (error) {
        const errorMessage = handleApiError(error)
        console.error("Error fetching pets:", errorMessage)
        setAnimalRecords([])
      } finally {
        setLoading(false)
      }
    }

    fetchPets()
  }, [])

  const filteredRecords = animalRecords.filter(
    (record) =>
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files)
      setImageFiles((prev) => [...prev, ...filesArray])

      // Create URLs for preview
      const newImageUrls = filesArray.map((file) => URL.createObjectURL(file))
      setImagePreviews((prev) => [...prev, ...newImageUrls])
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setImagePreviews((prev) => prev.filter((_, index) => index !== indexToRemove))
    setImageFiles((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const handleGenerateContract = (animalId: string) => {
    alert(`${animalId} 동물의 계약서가 생성되었습니다.`)
  }

  const handleEditPet = (animalRecord: AnimalRecord) => {
    // AnimalRecord를 Pet 형식으로 변환
    const pet: Pet = {
      id: parseInt(animalRecord.id.replace('REG', '')),
      name: animalRecord.name,
      breed: animalRecord.breed,
      age: `${animalRecord.age}살`,
      gender: animalRecord.gender,
      size: `${animalRecord.weight}kg`,
      personality: "온순함, 친화적",
      healthStatus: animalRecord.medicalHistory.join(', '),
      description: animalRecord.notes || "새로 등록된 반려동물입니다.",
      images: animalRecord.images || [],
      location: "서울특별시",
      contact: "010-0000-0000",
      adoptionFee: 0,
      isNeutered: animalRecord.medicalHistory.some(h => h.includes("중성화")),
      isVaccinated: animalRecord.vaccinations.length > 0,
      specialNeeds: animalRecord.aiBackgroundStory,
      dateRegistered: animalRecord.registrationDate.toISOString().split('T')[0],
      adoptionStatus: "available",
    }
    setSelectedPetForEdit(pet)
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setSelectedPetForEdit(null)
  }

  const handleUpdatePet = (updatedPet: Pet) => {
    // AnimalRecords 상태 업데이트
    setAnimalRecords(prev => prev.map(record => {
      if (record.id === `REG${updatedPet.id.toString().padStart(3, '0')}`) {
        return {
          ...record,
          name: updatedPet.name,
          breed: updatedPet.breed,
          age: parseInt(updatedPet.age.replace('살', '')),
          gender: updatedPet.gender as "수컷" | "암컷",
          weight: parseFloat(updatedPet.size.replace('kg', '')),
          medicalHistory: updatedPet.healthStatus ? [updatedPet.healthStatus] : [],
          notes: updatedPet.description,
          aiBackgroundStory: updatedPet.specialNeeds,
          images: updatedPet.images,
        }
      }
      return record
    }))
    handleCloseEditModal()
  }

  const handleDeletePet = async (animalId: string, petName: string) => {
    if (confirm(`정말로 "${petName}"을(를) 삭제하시겠습니까?`)) {
      try {
        // REG005 -> 5로 변환
        const petId = parseInt(animalId.replace('REG', ''))
        await axios.delete(`${getBackendUrl()}/api/pets/${petId}`)
        setAnimalRecords(prev => prev.filter(record => record.id !== animalId))
        toast({
          title: "성공",
          description: "동물이 삭제되었습니다.",
        })
      } catch (error) {
        console.error("동물 삭제 실패:", error)
        toast({
          title: "오류",
          description: "동물 삭제에 실패했습니다.",
          variant: "destructive",
        })
      }
    }
  }

  const handleGenerateAIStory = async () => {
    if (!newAnimal.name || !newAnimal.breed) {
      alert("동물 이름, 품종을 먼저 입력해주세요.")
      return
    }

    setIsGeneratingStory(true)

    try {
      const backendUrl = getBackendUrl()
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/story/generate-background-story`, 
        {
        petName: newAnimal.name,
        breed: newAnimal.breed,
        age: newAnimal.age,
        gender: newAnimal.gender,
        personality: '',
        userPrompt: newAnimal.description || ''
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Access_Token': localStorage.getItem('accessToken') || '',
        },
      })

      if (response.status !== 200) {
        throw new Error('AI 스토리 생성에 실패했습니다.')
      }

      const result = response.data
      
      // 백엔드에서 ResponseDto로 래핑해서 보내므로 data 필드에서 추출
      if (result.success && result.data) {
        setNewAnimal((prev) => ({ ...prev, description: result.data.story }))
      } else {
        throw new Error(result.error?.message || 'AI 스토리 생성에 실패했습니다.')
      }
    } catch (error) {
      console.error('AI 스토리 생성 오류:', error)
      alert('AI 스토리 생성에 실패했습니다.')
    } finally {
      setIsGeneratingStory(false)
    }
  }

  const handleSubmitRegistration = async () => {
    if (!newAnimal.name || !newAnimal.breed) {
      alert("필수 정보를 모두 입력해주세요.")
      return
    }

    try {
      // 새로 업로드된 이미지들을 S3에 업로드
      const uploadedImageUrls: string[] = []
      
      for (let i = 0; i < imagePreviews.length; i++) {
        const imageUrl = imagePreviews[i]
        const imageFile = imageFiles[i]
        
        if (imageFile && (imageUrl.startsWith('data:') || imageUrl.startsWith('blob:'))) {
          // 새로 업로드된 이미지 (data URL 또는 blob URL)
          try {
            const uploadedUrl = await s3Api.uploadAdoptionFile(imageFile)
            uploadedImageUrls.push(uploadedUrl)
          } catch (error) {
            console.error("이미지 업로드 실패:", error)
            alert("이미지 업로드에 실패했습니다.")
            return
          }
        } else if (imageUrl && imageUrl.startsWith('https://')) {
          // 기존 S3 이미지
          uploadedImageUrls.push(imageUrl)
        } else {
          // 기존 이미지 (data URL이 아닌 경우)
          uploadedImageUrls.push(imageUrl)
        }
      }

      // Create a new pet object for the backend API
      const newPetData: Omit<ApiPet, 'petId'> = {
        name: newAnimal.name,
        breed: newAnimal.breed,
        age: parseInt(newAnimal.age) || 0,
        gender: newAnimal.gender === "수컷" ? "MALE" : "FEMALE",
        vaccinated: newAnimal.isVaccinated,
        description: newAnimal.description || "새로 등록된 반려동물입니다.",
        imageUrl: uploadedImageUrls.length > 0 ? uploadedImageUrls[0] : "/placeholder.svg?height=200&width=300",
        adopted: false,
        weight: parseFloat(newAnimal.weight) || undefined,
        location: newAnimal.location || "서울특별시",
        microchipId: newAnimal.microchipId || undefined,
        medicalHistory: newAnimal.medicalHistory || undefined,
        vaccinations: newAnimal.vaccinations || undefined,
        notes: newAnimal.notes || undefined,
        specialNeeds: newAnimal.specialNeeds || undefined,
        personality: newAnimal.personality || "온순함, 친화적",
        rescueStory: newAnimal.rescueStory || undefined,
        aiBackgroundStory: newAnimal.aiBackgroundStory || undefined,
        status: newAnimal.status || "보호중",
        type: newAnimal.type || (newAnimal.breed.includes("골든") ||
              newAnimal.breed.includes("리트리버") ||
              newAnimal.breed.includes("말티즈") ||
              newAnimal.breed.includes("시바") ||
              newAnimal.breed.includes("진돗개") ||
              newAnimal.breed.includes("포메라니안") ||
              newAnimal.breed.includes("비글") ||
              newAnimal.breed.includes("웰시코기")
                ? "강아지"
                : "고양이"),
        neutered: newAnimal.isNeutered,
      }

      // Send to backend API
      const createdPet = await petApi.createPet(newPetData)
      console.log("Created pet:", createdPet)

      // Create a new pet object for the adoption page (frontend state)
      const newPet: Pet = {
        id: createdPet.petId,
        name: newAnimal.name,
        breed: newAnimal.breed,
        age: newAnimal.age + "살",
        gender: newAnimal.gender,
        size: newAnimal.weight && parseFloat(newAnimal.weight) > 10 ? "대형" : "소형",
        personality: "온순함, 친화적",
        healthStatus: "건강함",
        description: newAnimal.aiBackgroundStory || "새로 등록된 반려동물입니다.",
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : ["/placeholder.svg?height=200&width=300"],
        location: newAnimal.location || "서울특별시",
        contact: "010-0000-0000",
        adoptionFee: 0,
        isNeutered: newPetData.neutered || false,
        isVaccinated: newPetData.vaccinated || false,
        dateRegistered: new Date().toISOString().split("T")[0],
        adoptionStatus: "available",
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
        personality: "",
        description: "",
        specialNeeds: "",
        rescueStory: "",
        status: "보호중",
        type: "",
        isNeutered: false,
        isVaccinated: false,
      })
      setImageFiles([])
      setImagePreviews([])
    } catch (error) {
      const errorMessage = handleApiError(error)
      alert(`동물 등록 실패: ${errorMessage}`)
      console.error("Error creating pet:", error)
    }
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

              {/* Image Upload Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">동물 사진</h3>
                <div className="space-y-2">
                  <Label htmlFor="image-upload">사진 첨부 (선택 사항)</Label>
                  <Input 
                    id="image-upload" 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {imagePreviews.map((imageSrc, index) => (
                      <div key={index} className="relative w-full h-32 rounded-md overflow-hidden group">
                        <img
                          src={imageSrc}
                          alt={`Uploaded preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {imagePreviews.length === 0 && (
                      <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400">
                        <Upload className="h-8 w-8" />
                        <p className="text-sm ml-2">동물 사진을 업로드하세요</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 성격 및 소개 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">성격 및 소개</h3>
                
                <div>
                  <Label htmlFor="personality">성격</Label>
                  <Input
                    id="personality"
                    value={newAnimal.personality}
                    onChange={(e) => setNewAnimal({ ...newAnimal, personality: e.target.value })}
                    placeholder="예: 온순함, 친화적"
                  />
                </div>

                <div>
                  <Label htmlFor="description">동물 소개 (AI 생성)</Label>
                  <div className="space-y-2">
                    <Textarea
                      id="description"
                      value={newAnimal.description}
                      onChange={(e) => setNewAnimal({ ...newAnimal, description: e.target.value })}
                      placeholder="동물의 배경스토리나 소개를 작성해주세요"
                      rows={3}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateAIStory}
                      disabled={isGeneratingStory}
                      className="w-full"
                    >
                      {isGeneratingStory ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          AI 소개 생성 중...
                        </>
                      ) : (
                        "AI 소개 생성"
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="specialNeeds">특별한 사항 (추가 메모)</Label>
                  <Textarea
                    id="specialNeeds"
                    value={newAnimal.specialNeeds}
                    onChange={(e) => setNewAnimal({ ...newAnimal, specialNeeds: e.target.value })}
                    placeholder="특별한 주의사항이나 추가 정보가 있다면 작성해주세요"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">기타 메모</Label>
                  <Textarea
                    id="notes"
                    value={newAnimal.notes}
                    onChange={(e) => setNewAnimal({ ...newAnimal, notes: e.target.value })}
                    placeholder="기타 참고사항"
                    rows={2}
                  />
                </div>
              </div>

              {/* 건강 상태 체크박스 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">건강 상태</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isNeutered"
                      checked={newAnimal.isNeutered}
                      onChange={(e) => setNewAnimal({ ...newAnimal, isNeutered: e.target.checked })}
                    />
                    <Label htmlFor="isNeutered">중성화 완료</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isVaccinated"
                      checked={newAnimal.isVaccinated}
                      onChange={(e) => setNewAnimal({ ...newAnimal, isVaccinated: e.target.checked })}
                    />
                    <Label htmlFor="isVaccinated">예방접종 완료</Label>
                  </div>
                </div>
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
          {loading ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">동물 목록을 불러오는 중...</p>
              </CardContent>
            </Card>
          ) : filteredRecords.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">등록된 동물이 없습니다.</p>
              </CardContent>
            </Card>
          ) : (
            filteredRecords.map((animal) => (
              <Card key={animal.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-24 h-24 bg-yellow-100 rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                        <img
                          src={animal.images?.[0] || "/placeholder-logo.png"}
                          alt={`${animal.name} 이미지`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <span className="text-4xl hidden">
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
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{animal.name}</h3>
                        <p className="text-gray-600 text-lg mb-1">
                          {animal.breed} • {animal.age}세 • {animal.gender}
                        </p>
                        <p className="text-sm text-gray-500 font-medium">등록번호: {animal.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        onClick={() => handleEditPet(animal)}
                      >
                        정보 수정
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        onClick={() => handleDeletePet(animal.id, animal.name)}
                      >
                        삭제
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-3 text-gray-900">기본 정보</h4>
                      <div className="space-y-2 text-sm">
                        <p className="flex justify-between">
                          <span className="font-medium text-gray-600">체중:</span>
                          <span className="text-gray-900">{animal.weight}kg</span>
                        </p>
                        <p className="flex justify-between">
                          <span className="font-medium text-gray-600">등록일:</span>
                          <span className="text-gray-900">
                            {format(animal.registrationDate, "yyyy년 MM월 dd일", { locale: ko })}
                          </span>
                        </p>
                        {animal.microchipId && (
                          <p className="flex justify-between">
                            <span className="font-medium text-gray-600">마이크로칩:</span>
                            <span className="text-gray-900">{animal.microchipId}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {animal.aiBackgroundStory && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3 flex items-center text-gray-900">
                        <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                        AI 배경 스토리
                      </h4>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {animal.aiBackgroundStory}
                        </p>
                      </div>
                    </div>
                  )}

                  {animal.medicalHistory.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3 text-gray-900">의료 기록</h4>
                      <div className="flex flex-wrap gap-2">
                        {animal.medicalHistory.map((record, index) => (
                          <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {record}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {animal.vaccinations.length > 0 && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3 text-gray-900">예방접종</h4>
                      <div className="flex flex-wrap gap-2">
                        {animal.vaccinations.map((vaccination, index) => (
                          <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {vaccination}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {animal.notes && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3 text-gray-900">추가 메모</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-700 leading-relaxed">{animal.notes}</p>
                      </div>
                    </div>
                  )}


                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
      
      {/* 수정 모달 */}
      <AnimalEditModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        selectedPet={selectedPetForEdit}
        onUpdatePet={handleUpdatePet}
      />
    </div>
  )
}

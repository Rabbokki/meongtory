"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { X, Upload, Loader2 } from "lucide-react"
import { petApi, s3Api, handleApiError } from "./lib/api"

interface Pet {
  id: number
  name: string
  breed: string
  age: string
  gender: string
  size: string
  personality: string[]
  healthStatus: string
  description: string
  images: string[]
  location: string
  contact: string
  adoptionFee: number
  isNeutered: boolean
  isVaccinated: boolean
  specialNeeds?: string
  dateRegistered: string
  adoptionStatus: "available" | "pending" | "adopted"
}

interface AnimalEditModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPet: Pet | null
  onUpdatePet: (pet: Pet) => void
}

export default function AnimalEditModal({
  isOpen,
  onClose,
  selectedPet,
  onUpdatePet,
}: AnimalEditModalProps) {
  const [editAnimal, setEditAnimal] = useState<Partial<Pet>>({})
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)
  // 삭제된 이미지들을 추적하기 위한 상태 추가
  const [deletedImages, setDeletedImages] = useState<string[]>([])

  useEffect(() => {
    if (selectedPet) {
      setEditAnimal({
        name: selectedPet.name,
        breed: selectedPet.breed,
        age: selectedPet.age,
        gender: selectedPet.gender,
        size: selectedPet.size,
        personality: selectedPet.personality,
        healthStatus: selectedPet.healthStatus,
        description: selectedPet.description,
        location: selectedPet.location,
        contact: selectedPet.contact,
        adoptionFee: selectedPet.adoptionFee,
        isNeutered: selectedPet.isNeutered,
        isVaccinated: selectedPet.isVaccinated,
        specialNeeds: selectedPet.specialNeeds,
        adoptionStatus: selectedPet.adoptionStatus,
      })
      // 빈 문자열이나 undefined인 이미지는 제외
      const validImages = (selectedPet.images || []).filter(img => img && img.trim() !== '')
      setImagePreviews(validImages)
      setImageFiles([])
      setDeletedImages([]) // 모달이 열릴 때마다 삭제된 이미지 목록 초기화
    }
  }, [selectedPet])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string])
        setImageFiles(prev => [...prev, file])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveImage = (index: number) => {
    const imageToRemove = imagePreviews[index]
    
    // S3 이미지인 경우 삭제 목록에 추가 (실제 삭제는 저장 시에만)
    if (imageToRemove && imageToRemove.startsWith('https://')) {
      setDeletedImages(prev => [...prev, imageToRemove])
    }
    
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleGenerateAIStory = async () => {
    if (!editAnimal.name || !editAnimal.breed) {
      alert("이름과 품종을 먼저 입력해주세요.")
      return
    }

    setIsGeneratingStory(true)
    try {
      // AI 스토리 생성 로직 (실제로는 AI API 호출)
      const story = `${editAnimal.name}는 ${editAnimal.breed}로, 따뜻한 마음을 가진 아이입니다. 새로운 가족을 기다리고 있어요.`
      setEditAnimal(prev => ({ ...prev, specialNeeds: story }))
    } catch (error) {
      console.error("AI 스토리 생성 실패:", error)
      alert("AI 스토리 생성에 실패했습니다.")
    } finally {
      setIsGeneratingStory(false)
    }
  }

  const handleSubmitEdit = async () => {
    if (!selectedPet) return

    setIsSaving(true)
    try {
      // 1. 삭제된 이미지들을 S3에서 실제 삭제
      for (const deletedImageUrl of deletedImages) {
        try {
          // URL에서 파일명 추출
          const fileName = deletedImageUrl.split('/').pop()
          if (fileName) {
            await s3Api.deleteFile(fileName)
            console.log(`S3에서 이미지 삭제 완료: ${fileName}`)
          }
        } catch (error) {
          console.error("S3 이미지 삭제 실패:", error)
          // 삭제 실패해도 계속 진행
        }
      }

      // 2. 새로 업로드된 이미지들을 S3에 업로드
      const uploadedImageUrls: string[] = []
      
      for (let i = 0; i < imagePreviews.length; i++) {
        const imageUrl = imagePreviews[i]
        const imageFile = imageFiles[i]
        
        if (imageFile && imageUrl.startsWith('data:')) {
          // 새로 업로드된 이미지 (data URL)
          try {
            const uploadedUrl = await s3Api.uploadFile(imageFile)
            uploadedImageUrls.push(uploadedUrl)
          } catch (error) {
            console.error("이미지 업로드 실패:", error)
            alert("이미지 업로드에 실패했습니다.")
            return
          }
        } else if (imageUrl && imageUrl.startsWith('https://')) {
          // 기존 S3 이미지 (삭제되지 않은 것들)
          uploadedImageUrls.push(imageUrl)
        } else {
          // 기존 이미지 (data URL이 아닌 경우)
          uploadedImageUrls.push(imageUrl)
        }
      }

      const updateData = {
        name: editAnimal.name,
        breed: editAnimal.breed,
        age: parseInt(editAnimal.age?.replace('살', '') || '0'),
        gender: editAnimal.gender === '수컷' ? 'MALE' : 'FEMALE',
        weight: parseFloat(editAnimal.size?.replace('kg', '') || '0'),
        location: editAnimal.location,
        description: editAnimal.description,
        medicalHistory: editAnimal.healthStatus,
        personality: editAnimal.personality?.join(', '),
        rescueStory: editAnimal.specialNeeds,
        neutered: editAnimal.isNeutered,
        vaccinated: editAnimal.isVaccinated,
        imageUrl: uploadedImageUrls[0] || selectedPet.images?.[0],
      } as any

      const updatedPet = await petApi.updatePet(selectedPet.id, updateData)
      
      // 프론트엔드 상태 업데이트
      const updatedPetForFrontend: Pet = {
        ...selectedPet,
        ...editAnimal,
        images: uploadedImageUrls.length > 0 ? uploadedImageUrls : selectedPet.images,
      }
      
      onUpdatePet(updatedPetForFrontend)
      onClose()
      alert("동물 정보가 성공적으로 수정되었습니다!")
      // 페이지 새로고침 대신 상태 업데이트만 수행
      // window.location.reload() 제거
    } catch (error) {
      console.error("동물 정보 수정에 실패했습니다:", error)
      alert("동물 정보 수정에 실패했습니다.")
    } finally {
      setIsSaving(false)
    }
  }

  if (!selectedPet) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">동물 정보 수정</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">이름 *</Label>
                  <Input
                    id="name"
                    value={editAnimal.name || ""}
                    onChange={(e) => setEditAnimal(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="동물 이름"
                  />
                </div>
                <div>
                  <Label htmlFor="breed">품종 *</Label>
                  <Input
                    id="breed"
                    value={editAnimal.breed || ""}
                    onChange={(e) => setEditAnimal(prev => ({ ...prev, breed: e.target.value }))}
                    placeholder="품종"
                  />
                </div>
                <div>
                  <Label htmlFor="age">나이</Label>
                  <Input
                    id="age"
                    value={editAnimal.age || ""}
                    onChange={(e) => setEditAnimal(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="예: 2살"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">성별</Label>
                  <Select value={editAnimal.gender || ""} onValueChange={(value) => setEditAnimal(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="성별 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="수컷">수컷</SelectItem>
                      <SelectItem value="암컷">암컷</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="size">크기</Label>
                  <Input
                    id="size"
                    value={editAnimal.size || ""}
                    onChange={(e) => setEditAnimal(prev => ({ ...prev, size: e.target.value }))}
                    placeholder="예: 5kg"
                  />
                </div>
                <div>
                  <Label htmlFor="location">위치</Label>
                  <Input
                    id="location"
                    value={editAnimal.location || ""}
                    onChange={(e) => setEditAnimal(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="보호소 위치"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 건강 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>건강 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="healthStatus">건강 상태</Label>
                  <Textarea
                    id="healthStatus"
                    value={editAnimal.healthStatus || ""}
                    onChange={(e) => setEditAnimal(prev => ({ ...prev, healthStatus: e.target.value }))}
                    placeholder="건강 상태 및 병력"
                    rows={3}
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isNeutered"
                      checked={editAnimal.isNeutered || false}
                      onChange={(e) => setEditAnimal(prev => ({ ...prev, isNeutered: e.target.checked }))}
                    />
                    <Label htmlFor="isNeutered">중성화 완료</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isVaccinated"
                      checked={editAnimal.isVaccinated || false}
                      onChange={(e) => setEditAnimal(prev => ({ ...prev, isVaccinated: e.target.checked }))}
                    />
                    <Label htmlFor="isVaccinated">예방접종 완료</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 성격 및 특별한 사항 */}
          <Card>
            <CardHeader>
              <CardTitle>성격 및 특별한 사항</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="personality">성격</Label>
                <Input
                  id="personality"
                  value={editAnimal.personality?.join(', ') || ""}
                  onChange={(e) => setEditAnimal(prev => ({ 
                    ...prev, 
                    personality: e.target.value.split(',').map(p => p.trim()).filter(p => p) 
                  }))}
                  placeholder="예: 친근함, 활발함, 순함"
                />
              </div>
              <div>
                <Label htmlFor="specialNeeds">특별한 사항</Label>
                <div className="space-y-2">
                  <Textarea
                    id="specialNeeds"
                    value={editAnimal.specialNeeds || ""}
                    onChange={(e) => setEditAnimal(prev => ({ ...prev, specialNeeds: e.target.value }))}
                    placeholder="특별한 사항이나 배경 스토리"
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
                        AI 스토리 생성 중...
                      </>
                    ) : (
                      "AI 스토리 생성"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 이미지 업로드 */}
          <Card>
            <CardHeader>
              <CardTitle>이미지</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.filter(preview => preview && preview.trim() !== '').map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 p-0"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    multiple
                  />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">이미지 추가</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 연락처 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>연락처 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact">연락처</Label>
                  <Input
                    id="contact"
                    value={editAnimal.contact || ""}
                    onChange={(e) => setEditAnimal(prev => ({ ...prev, contact: e.target.value }))}
                    placeholder="연락처"
                  />
                </div>
                <div>
                  <Label htmlFor="adoptionFee">입양비</Label>
                  <Input
                    id="adoptionFee"
                    type="number"
                    value={editAnimal.adoptionFee || ""}
                    onChange={(e) => setEditAnimal(prev => ({ ...prev, adoptionFee: parseInt(e.target.value) || 0 }))}
                    placeholder="입양비"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 입양 상태 */}
          <Card>
            <CardHeader>
              <CardTitle>입양 상태</CardTitle>
            </CardHeader>
            <CardContent>
              <Select 
                value={editAnimal.adoptionStatus || "available"} 
                onValueChange={(value) => setEditAnimal(prev => ({ ...prev, adoptionStatus: value as "available" | "pending" | "adopted" }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">입양 가능</SelectItem>
                  <SelectItem value="pending">입양 대기</SelectItem>
                  <SelectItem value="adopted">입양 완료</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* 버튼 */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button 
              onClick={handleSubmitEdit} 
              disabled={isSaving || !editAnimal.name || !editAnimal.breed}
              className="bg-yellow-400 hover:bg-yellow-500 text-black"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  저장 중...
                </>
              ) : (
                "수정 완료"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
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
import { X, Upload, Loader2, Sparkles } from "lucide-react"
import { petApi, s3Api, handleApiError } from "@/lib/api"
import axios from "axios"

import type { Pet } from "@/types/pets"

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
        weight: selectedPet.weight,
        microchipId: selectedPet.microchipId,
        medicalHistory: selectedPet.medicalHistory,
        vaccinations: selectedPet.vaccinations,
        notes: selectedPet.notes,
        rescueStory: selectedPet.rescueStory,
        aiBackgroundStory: selectedPet.aiBackgroundStory,
        status: selectedPet.status,
        type: selectedPet.type,
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
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const response = await axios.post(`${backendUrl}/api/story/generate-background-story`, {
        petName: editAnimal.name,
        breed: editAnimal.breed,
        age: editAnimal.age,
        gender: editAnimal.gender,
        personality: '',
        userPrompt: editAnimal.specialNeeds || ''
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
        setEditAnimal(prev => ({ ...prev, description: result.data.story }))
      } else {
        throw new Error(result.error?.message || 'AI 스토리 생성에 실패했습니다.')
      }
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
          // 기존 S3 이미지 (삭제되지 않은 것들)
          uploadedImageUrls.push(imageUrl)
        } else {
          // 기존 이미지 (data URL이 아닌 경우)
          uploadedImageUrls.push(imageUrl)
        }
      }

      console.log('업로드된 이미지 URLs:', uploadedImageUrls);
      console.log('선택된 펫의 이미지:', selectedPet.images);
      
      const updateData = {
        name: editAnimal.name,
        breed: editAnimal.breed,
        age: parseInt(editAnimal.age?.replace('살', '') || '0'),
        gender: editAnimal.gender === '수컷' ? 'MALE' : 'FEMALE',
        weight: editAnimal.weight,
        location: editAnimal.location,
        microchipId: editAnimal.microchipId,
        description: editAnimal.description || "새로 등록된 반려동물입니다.",
        specialNeeds: editAnimal.specialNeeds || undefined,
        medicalHistory: editAnimal.medicalHistory,
        vaccinations: editAnimal.vaccinations,
        notes: editAnimal.notes,
        personality: editAnimal.personality || '',
        rescueStory: editAnimal.rescueStory,
        aiBackgroundStory: editAnimal.aiBackgroundStory,
        status: editAnimal.status || '보호중',
        type: editAnimal.type,
        neutered: editAnimal.isNeutered,
        vaccinated: editAnimal.isVaccinated,
        imageUrl: uploadedImageUrls[0] || 
                 (selectedPet.images && selectedPet.images.length > 0 && !selectedPet.images[0].includes('placeholder') ? selectedPet.images[0] : undefined),
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
      // 페이지 새로고침으로 변경사항 즉시 반영
      window.location.reload()
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
          <div className="grid md:grid-cols-2 gap-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">기본 정보</h3>

              <div>
                <Label htmlFor="name">동물 이름 *</Label>
                <Input
                  id="name"
                  value={editAnimal.name || ""}
                  onChange={(e) => setEditAnimal(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="동물 이름을 입력하세요"
                />
              </div>

              <div>
                <Label htmlFor="breed">품종 *</Label>
                <Input
                  id="breed"
                  value={editAnimal.breed || ""}
                  onChange={(e) => setEditAnimal(prev => ({ ...prev, breed: e.target.value }))}
                  placeholder="품종을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">나이</Label>
                  <Input
                    id="age"
                    type="number"
                    value={editAnimal.age || ""}
                    onChange={(e) => setEditAnimal(prev => ({ ...prev, age: e.target.value }))}
                    placeholder="나이"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">성별</Label>
                  <Select value={editAnimal.gender || ""} onValueChange={(value) => setEditAnimal(prev => ({ ...prev, gender: value }))}>
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
                    value={editAnimal.weight || ""}
                    onChange={(e) => setEditAnimal(prev => ({ ...prev, weight: parseFloat(e.target.value) || undefined }))}
                    placeholder="체중"
                  />
                </div>
                <div>
                  <Label htmlFor="location">지역</Label>
                  <Input
                    id="location"
                    value={editAnimal.location || ""}
                    onChange={(e) => setEditAnimal(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="지역을 입력하세요"
                  />
                </div>
              </div>
            </div>

            {/* 의료 정보 */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">의료 정보</h3>

              <div>
                <Label htmlFor="microchipId">마이크로칩 ID</Label>
                <Input
                  id="microchipId"
                  value={editAnimal.microchipId || ""}
                  onChange={(e) => setEditAnimal(prev => ({ ...prev, microchipId: e.target.value }))}
                  placeholder="마이크로칩 ID"
                />
              </div>

              <div>
                <Label htmlFor="medicalHistory">의료 기록</Label>
                <Textarea
                  id="medicalHistory"
                  value={editAnimal.medicalHistory || ""}
                  onChange={(e) => setEditAnimal(prev => ({ ...prev, medicalHistory: e.target.value }))}
                  placeholder="의료 기록을 입력하세요 (예: 예방접종 완료, 중성화 수술 완료)"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="vaccinations">예방접종 기록</Label>
                <Textarea
                  id="vaccinations"
                  value={editAnimal.vaccinations || ""}
                  onChange={(e) => setEditAnimal(prev => ({ ...prev, vaccinations: e.target.value }))}
                  placeholder="예방접종 기록을 입력하세요"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* 이미지 업로드 */}
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
                {imagePreviews.filter(preview => preview && preview.trim() !== '').map((preview, index) => (
                  <div key={index} className="relative w-full h-32 rounded-md overflow-hidden group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
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
                {imagePreviews.filter(preview => preview && preview.trim() !== '').length === 0 && (
                  <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400">
                    <Upload className="h-8 w-8" />
                    <p className="text-sm ml-2">동물 사진을 업로드하세요</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* AI Background Story Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="description">동물 소개 (AI 생성)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateAIStory}
                disabled={isGeneratingStory}
                className="text-purple-600 border-purple-200 hover:bg-purple-50 bg-transparent"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isGeneratingStory ? "생성 중..." : "AI 소개 생성"}
              </Button>
            </div>
            <Textarea
              id="description"
              value={editAnimal.description || ""}
              onChange={(e) => setEditAnimal(prev => ({ ...prev, description: e.target.value }))}
              placeholder="AI가 생성한 동물의 소개가 여기에 표시됩니다..."
              rows={4}
              className="bg-purple-50 border-purple-200"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes">추가 메모</Label>
            <Textarea
              id="notes"
              value={editAnimal.notes || ""}
              onChange={(e) => setEditAnimal(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="추가 메모를 입력하세요"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button onClick={handleSubmitEdit} className="bg-yellow-400 hover:bg-yellow-500 text-black" disabled={isSaving}>
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
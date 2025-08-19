"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, GripVertical, Sparkles, X } from "lucide-react"

interface CreateTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateTemplate: (templateData: any) => void
  onGetAISuggestion?: (sectionId: number, sectionTitle: string) => Promise<string>
}

export default function CreateTemplateModal({
  isOpen,
  onClose,
  onCreateTemplate,
  onGetAISuggestion,
}: CreateTemplateModalProps) {
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    category: "",
    description: "",
  })
  const [templateSections, setTemplateSections] = useState<any[]>([])
  const [showAISuggestion, setShowAISuggestion] = useState<number | null>(null)
  const [isLoadingAI, setIsLoadingAI] = useState(false)

  const addSection = () => {
    const newSection = {
      id: Date.now(),
      title: "",
      content: "",
      order: templateSections.length,
    }
    setTemplateSections([...templateSections, newSection])
  }

  const addDefaultSections = () => {
    const defaultSections = [
      {
        id: Date.now(),
        title: "1. 입양자 정보",
        content: "입양자의 기본 정보를 입력하세요.",
        order: 0,
      },
      {
        id: Date.now() + 1,
        title: "2. 입양 동물 정보",
        content: "입양할 동물의 기본 정보를 입력하세요.",
        order: 1,
      },
      {
        id: Date.now() + 2,
        title: "3. 입양 조건",
        content: "입양에 필요한 조건들을 명시하세요.",
        order: 2,
      },
      {
        id: Date.now() + 3,
        title: "4. 책임과 의무",
        content: "입양자의 책임과 의무를 명시하세요.",
        order: 3,
      },
      {
        id: Date.now() + 4,
        title: "5. 기타 사항",
        content: "기타 필요한 사항들을 명시하세요.",
        order: 4,
      },
    ]
    setTemplateSections(defaultSections)
  }

  const updateSection = (id: number, field: string, value: string) => {
    setTemplateSections(prev =>
      prev.map(section =>
        section.id === id ? { ...section, [field]: value } : section
      )
    )
  }

  const removeSection = (id: number) => {
    setTemplateSections(prev => prev.filter(section => section.id !== id))
  }

  const handleGetAISuggestion = async (sectionId: number, sectionTitle: string) => {
    if (!onGetAISuggestion) return
    
    setIsLoadingAI(true)
    try {
      const suggestion = await onGetAISuggestion(sectionId, sectionTitle)
      setTemplateSections(prev =>
        prev.map(section =>
          section.id === sectionId
            ? { ...section, aiSuggestion: suggestion }
            : section
        )
      )
      setShowAISuggestion(sectionId)
    } catch (error) {
      console.error('AI 추천 가져오기 오류:', error)
      alert('AI 추천을 가져오는 중 오류가 발생했습니다.')
    } finally {
      setIsLoadingAI(false)
    }
  }

  const handleApplyAISuggestion = (sectionId: number) => {
    setTemplateSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, content: section.aiSuggestion || section.content }
          : section
      )
    )
    setShowAISuggestion(null)
  }

  const handleRejectAISuggestion = async (sectionId: number) => {
    const section = templateSections.find(s => s.id === sectionId)
    if (section && onGetAISuggestion) {
      await handleGetAISuggestion(sectionId, section.title)
    }
  }

  const handleCloseAISuggestion = (sectionId: number) => {
    setShowAISuggestion(null)
  }

  const handleSubmit = () => {
    if (!newTemplate.name.trim()) {
      alert("템플릿 이름을 입력해주세요.")
      return
    }

    if (templateSections.length === 0) {
      alert("최소 하나의 섹션을 추가해주세요.")
      return
    }

    const templateData = {
      ...newTemplate,
      sections: templateSections.map((section, index) => ({
        ...section,
        order: index,
      })),
    }

    onCreateTemplate(templateData)
    handleClose()
  }

  const handleClose = () => {
    setNewTemplate({ name: "", category: "", description: "" })
    setTemplateSections([])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>새 템플릿 생성</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* 기본 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">템플릿 이름</label>
              <input
                type="text"
                className="w-full mt-1 p-2 border rounded-md"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                placeholder="템플릿 이름을 입력하세요"
              />
            </div>
            <div>
              <label className="text-sm font-medium">카테고리</label>
              <select
                className="w-full mt-1 p-2 border rounded-md"
                value={newTemplate.category}
                onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
              >
                <option value="">카테고리 선택</option>
                <option value="입양계약서">입양계약서</option>
                <option value="분양계약서">분양계약서</option>
                <option value="임시보호계약서">임시보호계약서</option>
                <option value="의료계약서">의료계약서</option>
                <option value="훈련계약서">훈련계약서</option>
                <option value="기타">기타</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">설명</label>
            <textarea
              className="w-full mt-1 p-2 border rounded-md"
              rows={3}
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
              placeholder="템플릿에 대한 설명을 입력하세요"
            />
          </div>

          {/* 섹션 관리 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">계약서 항목</h3>
              <div className="flex gap-2">
                <Button 
                  onClick={addDefaultSections}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  기본 항목 추가
                </Button>
                <Button 
                  onClick={addSection}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  항목 추가
                </Button>
              </div>
            </div>
            
            {templateSections.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-gray-500 mb-2">계약서에 필요한 항목들을 추가하세요</p>
                <p className="text-sm text-gray-400">"기본 항목 추가" 버튼으로 자주 사용하는 항목들을 한 번에 추가할 수 있습니다</p>
              </div>
            ) : (
              <div className="space-y-4">
                {templateSections.map((section, index) => (
                  <div key={section.id}>
                    <Card className="p-4">
                                              <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <GripVertical className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-medium">섹션 {index + 1}</span>
                            {onGetAISuggestion && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleGetAISuggestion(section.id, section.title)}
                                disabled={isLoadingAI}
                                className="text-xs"
                              >
                                {isLoadingAI ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-1"></div>
                                ) : (
                                  <Sparkles className="h-3 w-3 mr-1" />
                                )}
                                AI 추천
                              </Button>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeSection(section.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                                              <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium">제목</label>
                            <input
                              type="text"
                              className="w-full mt-1 p-2 border rounded-md"
                              value={section.title}
                              onChange={(e) => updateSection(section.id, "title", e.target.value)}
                              placeholder="섹션 제목을 입력하세요"
                            />
                          </div>
                          
                          {/* AI 추천 말풍선 */}
                          {showAISuggestion === section.id && section.aiSuggestion && (
                            <div className="relative">
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="text-xs font-medium text-blue-800">AI 추천</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleCloseAISuggestion(section.id)}
                                    className="text-xs p-1 h-6 w-6"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                                <p className="text-sm text-blue-900 mb-2">{section.aiSuggestion}</p>
                                <div className="flex gap-1 justify-end">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleRejectAISuggestion(section.id)}
                                    className="text-xs px-2"
                                  >
                                    다른 추천
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleApplyAISuggestion(section.id)}
                                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2"
                                  >
                                    적용하기
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <div>
                            <label className="text-sm font-medium">내용</label>
                            <textarea
                              className="w-full mt-1 p-2 border rounded-md"
                              rows={3}
                              value={section.content}
                              onChange={(e) => updateSection(section.id, "content", e.target.value)}
                              placeholder="섹션 내용을 입력하세요"
                            />
                          </div>
                        </div>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-600 text-white">
              템플릿 생성
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
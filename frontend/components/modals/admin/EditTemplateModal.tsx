"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, GripVertical, Sparkles, X } from "lucide-react"

interface EditTemplateModalProps {
  isOpen: boolean
  onClose: () => void
  editingTemplate: any
  onUpdateTemplate: (templateData: any) => void
  onGetAISuggestion?: (sectionId: number, sectionTitle: string) => Promise<string>
}

export default function EditTemplateModal({
  isOpen,
  onClose,
  editingTemplate,
  onUpdateTemplate,
  onGetAISuggestion,
}: EditTemplateModalProps) {
  const [newTemplate, setNewTemplate] = useState({
    name: editingTemplate?.name || "",
    category: editingTemplate?.category || "",
    content: "",
    isDefault: false
  })
  const [templateSections, setTemplateSections] = useState<Array<{
    id: string;
    title: string;
    aiSuggestion: string;
  }>>([])
  const [showAISuggestion, setShowAISuggestion] = useState<string | null>(null)
  const [isLoadingAI, setIsLoadingAI] = useState(false)

  // 템플릿 데이터 초기화
  React.useEffect(() => {
    if (editingTemplate) {
      setNewTemplate({
        name: editingTemplate.name || "",
        category: editingTemplate.category || "",
        content: "",
        isDefault: editingTemplate.isDefault || false
      })
      
      // sections 파싱
      if (editingTemplate.sections && editingTemplate.sections.length > 0) {
        const sections = editingTemplate.sections.map((section: any, index: number) => ({
          id: `section-${Date.now()}-${index}`,
          title: section.title,
          aiSuggestion: ""
        }))
        setTemplateSections(sections)
      } else if (editingTemplate.content) {
        // content가 있으면 파싱해서 sections로 변환
        const contentLines = editingTemplate.content.split('\n').filter((line: string) => line.trim())
        const sections = contentLines.map((line: string, index: number) => {
          const match = line.match(/^(\d+)\.\s*(.+?)(?:\s*\(필수\))?$/)
          if (match) {
            return {
              id: `section-${Date.now()}-${index}`,
              title: match[2].trim(),
              required: line.includes('(필수)'),
              aiSuggestion: ""
            }
          } else {
            return {
              id: `section-${Date.now()}-${index}`,
              title: line.trim(),
              required: false,
              aiSuggestion: ""
            }
          }
        })
        setTemplateSections(sections)
      } else {
        setTemplateSections([])
      }
    }
  }, [editingTemplate])

  const addSection = () => {
    const newSection = {
      id: (Date.now() + Math.random()).toString(),
      title: "새 항목",
      aiSuggestion: ""
    }
    setTemplateSections([...templateSections, newSection])
  }

  const addDefaultSections = () => {
    const baseTime = Date.now()
    const defaultSections = [
      {
        id: (baseTime + 1).toString(),
        title: "반려동물 이름",
        aiSuggestion: "반려동물의 이름을 입력해주세요"
      },
      {
        id: (baseTime + 2).toString(),
        title: "반려동물 품종",
        aiSuggestion: "반려동물의 품종을 입력해주세요"
      },
      {
        id: (baseTime + 3).toString(),
        title: "반려동물 나이",
        aiSuggestion: "반려동물의 나이를 입력해주세요"
      },
      {
        id: (baseTime + 4).toString(),
        title: "신청자 이름",
        aiSuggestion: "신청자의 이름을 입력해주세요"
      },
      {
        id: (baseTime + 5).toString(),
        title: "신청자 연락처",
        aiSuggestion: "신청자의 연락처를 입력해주세요"
      },
      {
        id: (baseTime + 6).toString(),
        title: "신청자 이메일",
        aiSuggestion: "신청자의 이메일을 입력해주세요"
      }
    ]
    setTemplateSections([...templateSections, ...defaultSections])
  }

  const removeSection = (id: string) => {
    setTemplateSections(templateSections.filter(section => section.id !== id))
  }

  const updateSection = (id: string, field: 'title' | 'aiSuggestion', value: string) => {
    setTemplateSections(templateSections.map(section => 
      section.id === id ? { ...section, [field]: value } : section
    ))
  }

  const moveSection = (fromIndex: number, toIndex: number) => {
    const newSections = [...templateSections]
    const [movedSection] = newSections.splice(fromIndex, 1)
    newSections.splice(toIndex, 0, movedSection)
    setTemplateSections(newSections)
  }

  const handleGetAISuggestion = async (sectionId: string, sectionTitle: string) => {
    if (!onGetAISuggestion) return
    
    setIsLoadingAI(true)
    try {
      const suggestion = await onGetAISuggestion(parseInt(sectionId), sectionTitle)
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

  const handleApplyAISuggestion = (sectionId: string) => {
    setTemplateSections(prev =>
      prev.map(section =>
        section.id === sectionId
          ? { ...section, title: section.aiSuggestion || section.title }
          : section
      )
    )
    setShowAISuggestion(null)
  }

  const handleRejectAISuggestion = async (sectionId: string) => {
    const section = templateSections.find(s => s.id === sectionId)
    if (section && onGetAISuggestion) {
      await handleGetAISuggestion(sectionId, section.title)
    }
  }

  const handleCloseAISuggestion = (sectionId: string) => {
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
        title: section.title,
        order: index + 1,
        content: "",
        options: null
      })),
    }

    onUpdateTemplate(templateData)
    handleClose()
  }

  const handleClose = () => {
    setNewTemplate({ name: "", category: "", content: "", isDefault: false })
    setTemplateSections([])
    setShowAISuggestion(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>템플릿 수정</DialogTitle>
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
                        <div className="flex items-center gap-2 relative">
                          <div className="cursor-move text-gray-400 hover:text-gray-600">
                            ⋮⋮
                          </div>
                          <h4 className="font-medium">항목 {index + 1}</h4>
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
                          
                          {/* AI 추천 말풍선 */}
                          {showAISuggestion === section.id && section.aiSuggestion && (
                            <div className="absolute bottom-10 left-full z-10 w-80 bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-3 ml-2">
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
                          )}
                        </div>
                        <div className="flex gap-2">
                          {index > 0 && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => moveSection(index, index - 1)}
                            >
                              ↑
                            </Button>
                          )}
                          {index < templateSections.length - 1 && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => moveSection(index, index + 1)}
                            >
                              ↓
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => removeSection(section.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium">항목 제목</label>
                          <input
                            type="text"
                            className="w-full mt-1 p-2 border rounded-md"
                            value={section.title}
                            onChange={(e) => updateSection(section.id, 'title', e.target.value)}
                          />
                        </div>
                      </div>
                    </Card>
                  </div>
                ))}
                
                {/* 마지막 항목 아래에 추가 버튼 */}
                {templateSections.length > 0 && (
                  <div className="flex justify-center my-2">
                    <Button 
                      onClick={addSection}
                      className="bg-green-500 hover:bg-green-600 text-white text-sm"
                      size="sm"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      항목 추가
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              취소
            </Button>
            <Button 
              onClick={handleSubmit}
              className="bg-blue-500 hover:bg-blue-600 text-white"
              disabled={!newTemplate.name || !newTemplate.category || templateSections.length === 0}
            >
              템플릿 수정
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
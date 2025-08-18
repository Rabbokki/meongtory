"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Wand2, Download, Eye } from "lucide-react"

interface ContractGenerationModalProps {
  isOpen: boolean
  onClose: () => void
  adoptionRequest: any
  contractTemplates: any[]
  onGenerateContract: (data: any) => void
  onViewGeneratedContract?: (contract: any) => void
  onDownloadContract?: (contractId: number) => void
}

export default function ContractGenerationModal({
  isOpen,
  onClose,
  adoptionRequest,
  contractTemplates,
  onGenerateContract,
  onViewGeneratedContract,
  onDownloadContract,
}: ContractGenerationModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedContract, setGeneratedContract] = useState<any>(null)

  const handleGenerateContract = async () => {
    if (!selectedTemplate) {
      alert("템플릿을 선택해주세요.")
      return
    }

    setIsGenerating(true)
    try {
      const contractData = {
        templateId: selectedTemplate.id,
        adoptionRequestId: adoptionRequest.id,
        petId: adoptionRequest.petId,
        applicantId: adoptionRequest.userId,
        customData: {
          applicantName: adoptionRequest.applicantName,
          petName: adoptionRequest.petName,
          petBreed: adoptionRequest.petBreed,
          contactNumber: adoptionRequest.contactNumber,
          email: adoptionRequest.email,
          message: adoptionRequest.message,
        }
      }

      const result = await onGenerateContract(contractData)
      setGeneratedContract(result)
    } catch (error) {
      console.error("계약서 생성 오류:", error)
      alert("계약서 생성 중 오류가 발생했습니다.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleViewContract = () => {
    if (onViewGeneratedContract && generatedContract) {
      onViewGeneratedContract(generatedContract)
    }
  }

  const handleDownload = () => {
    if (onDownloadContract && generatedContract?.id) {
      onDownloadContract(generatedContract.id)
    }
  }

  const handleClose = () => {
    setSelectedTemplate(null)
    setGeneratedContract(null)
    setIsGenerating(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI 계약서 생성
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 입양신청 정보 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-lg mb-3">입양신청 정보</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm"><span className="font-medium">신청자:</span> {adoptionRequest?.applicantName}</p>
                <p className="text-sm"><span className="font-medium">연락처:</span> {adoptionRequest?.contactNumber}</p>
                <p className="text-sm"><span className="font-medium">이메일:</span> {adoptionRequest?.email}</p>
              </div>
              <div>
                <p className="text-sm"><span className="font-medium">동물명:</span> {adoptionRequest?.petName}</p>
                <p className="text-sm"><span className="font-medium">품종:</span> {adoptionRequest?.petBreed}</p>
                <p className="text-sm"><span className="font-medium">신청일:</span> {adoptionRequest?.createdAt}</p>
              </div>
            </div>
          </div>

          {/* 템플릿 선택 */}
          {!generatedContract && (
            <div>
              <h3 className="font-medium text-lg mb-3">계약서 템플릿 선택</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {contractTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{template.name || template.title}</h4>
                      <Badge variant="outline">
                        {template.isDefault ? "기본" : "사용자"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {template.description}
                    </p>
                    <div className="text-xs text-gray-500">
                      섹션 수: {template.sections?.length || 0}개
                    </div>
                  </div>
                ))}
              </div>
              
              {contractTemplates.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>사용 가능한 템플릿이 없습니다.</p>
                  <p className="text-sm">먼저 템플릿을 생성해주세요.</p>
                </div>
              )}
            </div>
          )}

          {/* 생성된 계약서 */}
          {generatedContract && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-lg mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                생성된 계약서
              </h3>
              <div className="space-y-2">
                <p className="text-sm"><span className="font-medium">제목:</span> {generatedContract.title}</p>
                <p className="text-sm"><span className="font-medium">상태:</span> 
                  <Badge className="ml-2 bg-green-100 text-green-800">
                    생성완료
                  </Badge>
                </p>
                <p className="text-sm"><span className="font-medium">생성일:</span> {generatedContract.createdAt}</p>
              </div>
              
              <div className="flex gap-2 mt-4">
                {onViewGeneratedContract && (
                  <Button onClick={handleViewContract} variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    계약서 보기
                  </Button>
                )}
                {onDownloadContract && (
                  <Button onClick={handleDownload} className="bg-green-600 hover:bg-green-700 text-white">
                    <Download className="h-4 w-4 mr-2" />
                    PDF 다운로드
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose}>
              취소
            </Button>
            {!generatedContract && selectedTemplate && (
              <Button 
                onClick={handleGenerateContract} 
                disabled={isGenerating}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    생성 중...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    AI 계약서 생성
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
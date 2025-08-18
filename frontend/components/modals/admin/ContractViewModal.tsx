"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Edit } from "lucide-react"

interface ContractViewModalProps {
  isOpen: boolean
  onClose: () => void
  contract: any
  onDownload?: (contractId: number) => void
  onEdit?: (contract: any) => void
  formatToKST?: (date: string) => string
}

export default function ContractViewModal({
  isOpen,
  onClose,
  contract,
  onDownload,
  onEdit,
  formatToKST,
}: ContractViewModalProps) {
  if (!contract) return null

  const handleDownload = () => {
    if (onDownload && contract.id) {
      onDownload(contract.id)
    }
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(contract)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {contract.title || contract.contractName || "계약서"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 계약서 정보 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-sm text-gray-700 mb-2">계약서 정보</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">제목:</span> {contract.title || contract.contractName}</p>
                  <p><span className="font-medium">상태:</span> 
                    <Badge className="ml-2 bg-green-100 text-green-800">
                      {contract.status === "SIGNED" ? "서명완료" : 
                       contract.status === "PENDING" ? "서명대기" : "만료됨"}
                    </Badge>
                  </p>
                  <p><span className="font-medium">생성일:</span> {contract.createdAt ? formatToKST?.(contract.createdAt) : "날짜 없음"}</p>
                  {contract.expiresAt && (
                    <p><span className="font-medium">만료일:</span> {formatToKST?.(contract.expiresAt)}</p>
                  )}
                </div>
              </div>
              
              {contract.petName && (
                <div>
                  <h3 className="font-medium text-sm text-gray-700 mb-2">관련 동물</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">동물명:</span> {contract.petName}</p>
                    <p><span className="font-medium">품종:</span> {contract.petBreed}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 계약서 내용 */}
          <div>
            <h3 className="font-medium text-lg mb-4">계약서 내용</h3>
            {contract.content ? (
              <div className="prose max-w-none">
                <div 
                  className="bg-white border rounded-lg p-6"
                  dangerouslySetInnerHTML={{ __html: contract.content }}
                />
              </div>
            ) : contract.sections ? (
              <div className="space-y-4">
                {contract.sections.map((section: any, index: number) => (
                  <div key={section.id || index} className="border rounded-lg p-4">
                    <h4 className="font-medium text-lg mb-2">{section.title}</h4>
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {section.content}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>계약서 내용이 없습니다.</p>
              </div>
            )}
          </div>

          {/* 서명 정보 */}
          {contract.signatures && contract.signatures.length > 0 && (
            <div>
              <h3 className="font-medium text-lg mb-4">서명 정보</h3>
              <div className="space-y-3">
                {contract.signatures.map((signature: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{signature.signerName}</p>
                        <p className="text-sm text-gray-600">{signature.signerRole}</p>
                        <p className="text-sm text-gray-500">
                          서명일: {signature.signedAt ? formatToKST?.(signature.signedAt) : "날짜 없음"}
                        </p>
                      </div>
                      {signature.signatureImage && (
                        <img 
                          src={signature.signatureImage} 
                          alt="서명" 
                          className="w-20 h-12 object-contain border rounded"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex justify-end space-x-2">
            {onEdit && (
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                수정
              </Button>
            )}
            {onDownload && (
              <Button onClick={handleDownload} className="bg-blue-500 hover:bg-blue-600 text-white">
                <Download className="h-4 w-4 mr-2" />
                PDF 다운로드
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
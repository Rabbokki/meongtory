"use client"

import React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

interface GeneratedContractViewModalProps {
  isOpen: boolean
  onClose: () => void
  selectedContract: any
  onDownloadContract?: (contractId: number) => void
  formatToKST?: (date: string) => string
}

export default function GeneratedContractViewModal({
  isOpen,
  onClose,
  selectedContract,
  onDownloadContract,
  formatToKST,
}: GeneratedContractViewModalProps) {
  const handleDownload = () => {
    if (onDownloadContract && selectedContract?.id) {
      onDownloadContract(selectedContract.id)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            생성된 계약서 상세 보기
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {selectedContract && (
            <div className="space-y-6">
              {/* 계약서 정보 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3 text-gray-800">계약서 정보</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">계약서명:</span>
                    <span className="text-gray-900">{selectedContract.contractName || "계약서"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">생성일:</span>
                    <span className="text-gray-900">{selectedContract.generatedAt ? formatToKST?.(selectedContract.generatedAt) : "날짜 없음"}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-700 w-20">생성자:</span>
                    <span className="text-gray-900">{selectedContract.generatedBy || "관리자"}</span>
                  </div>
                  {selectedContract.template && (
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-20">사용 템플릿:</span>
                      <span className="text-gray-900">{selectedContract.template.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* 계약서 내용 */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">계약서 내용</h4>
                  <div className="flex gap-2">
                    {onDownloadContract && (
                      <Button 
                        size="sm"
                        variant="outline"
                        className="bg-white text-black border border-gray-300 hover:bg-gray-50"
                        onClick={handleDownload}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        PDF 다운로드
                      </Button>
                    )}
                  </div>
                </div>
                <div className="bg-white p-4 rounded border max-h-96 overflow-y-auto">
                  {selectedContract.content ? (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{selectedContract.content}</div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>계약서 내용을 불러올 수 없습니다.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="outline" onClick={onClose}>
                  닫기
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 
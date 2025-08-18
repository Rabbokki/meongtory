"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"

interface ContractEditModalProps {
  isOpen: boolean
  onClose: () => void
  editingContract: any
  onUpdateContract: (contractData: any) => void
  formatToKST?: (date: string) => string
}

export default function ContractEditModal({
  isOpen,
  onClose,
  editingContract,
  onUpdateContract,
  formatToKST,
}: ContractEditModalProps) {
  const [editedContractContent, setEditedContractContent] = useState(editingContract?.content || "")

  // 계약서 데이터 초기화
  React.useEffect(() => {
    if (editingContract) {
      setEditedContractContent(editingContract.content || "")
    }
  }, [editingContract])

  const handleSubmit = () => {
    if (!editedContractContent.trim()) {
      alert("계약서 내용을 입력해주세요.")
      return
    }

    const contractData = {
      content: editedContractContent
    }

    onUpdateContract(contractData)
    handleClose()
  }

  const handleClose = () => {
    setEditedContractContent("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="w-5 h-5" />
            계약서 수정
          </DialogTitle>
        </DialogHeader>
        
        {editingContract && (
          <div className="space-y-6">
            {/* 계약서 기본 정보 */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">계약서 정보</h4>
              <div className="text-sm space-y-1">
                <p><strong>계약서명:</strong> {editingContract.contractName || "계약서"}</p>
                <p><strong>생성일:</strong> {editingContract.generatedAt ? formatToKST?.(editingContract.generatedAt) : "날짜 없음"}</p>
                <p><strong>생성자:</strong> {editingContract.generatedBy || "관리자"}</p>
                {editingContract.template && (
                  <p><strong>사용 템플릿:</strong> {editingContract.template.name}</p>
                )}
              </div>
            </div>

            {/* 계약서 내용 수정 */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">계약서 내용 수정</h4>
              </div>
              <div className="bg-white border rounded-lg p-4">
                <textarea
                  className="w-full h-96 p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editedContractContent}
                  onChange={(e) => setEditedContractContent(e.target.value)}
                  placeholder="계약서 내용을 수정하세요..."
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white"
            disabled={!editedContractContent.trim()}
          >
            <Edit className="h-4 w-4 mr-2" />
            계약서 수정
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
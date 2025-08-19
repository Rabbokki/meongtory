"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Plus, Edit, Trash2, Download, Eye, AlertCircle } from "lucide-react"
import { ContractsTabProps, ContractTemplate, GeneratedContract } from "@/types/admin"

export default function ContractsTab({
  onCreateTemplate,
  onEditTemplate,
  onViewTemplate,
  onViewGeneratedContract,
  onEditContract,
}: ContractsTabProps) {
  const [contractTemplates, setContractTemplates] = useState<ContractTemplate[]>([])
  const [generatedContracts, setGeneratedContracts] = useState<GeneratedContract[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // KST 날짜 포맷팅
  const formatToKST = (dateString: string) => {
    const date = new Date(dateString)
    const kstOffset = 9 * 60 // KST는 UTC+9
    const kstTime = new Date(date.getTime() + kstOffset * 60 * 1000)
    return kstTime.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 계약서 데이터 페칭 (임시로 빈 배열)
  const fetchContracts = async () => {
    try {
      setLoading(true)
      setError(null)
      // TODO: 실제 계약서 API 구현 후 연결
      setContractTemplates([])
      setGeneratedContracts([])
    } catch (error) {
      console.error('Error fetching contracts:', error)
      setError('계약서 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 데이터 페칭
  useEffect(() => {
    fetchContracts()
  }, [])

  const getTemplateStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "INACTIVE":
        return "bg-gray-100 text-gray-800"
      case "DRAFT":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getContractStatusColor = (status: string) => {
    switch (status) {
      case "SIGNED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "EXPIRED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">계약서 데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">계약서 관리</h2>
        <Button onClick={onCreateTemplate} className="bg-yellow-400 hover:bg-yellow-500 text-black">
          <Plus className="h-4 w-4 mr-2" />새 템플릿 생성
        </Button>
      </div>

      <div className="grid gap-4">
        {contractTemplates && contractTemplates.length > 0 ? (
          contractTemplates.map((template, index) => (
            <Card key={template.id || `template-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{template.title}</h3>
                    <p className="text-sm text-gray-600">{template.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getTemplateStatusColor(template.status)}>
                        {template.status === "ACTIVE" ? "활성" : 
                         template.status === "INACTIVE" ? "비활성" : "초안"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        생성일: {template.createdAt ? formatToKST(template.createdAt) : "날짜 없음"}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onViewTemplate && onViewTemplate(template)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onEditTemplate && onEditTemplate(template)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        alert('삭제 기능은 아직 구현되지 않았습니다.')
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p>등록된 템플릿이 없습니다.</p>
          </div>
        )}
      </div>

      <div className="grid gap-4">
        {generatedContracts && generatedContracts.length > 0 ? (
          generatedContracts.map((contract, index) => (
            <Card key={contract.id || `contract-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{contract.title}</h3>
                    <p className="text-sm text-gray-600">
                      템플릿: {contract.templateTitle || "알 수 없음"}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getContractStatusColor(contract.status)}>
                        {contract.status === "SIGNED" ? "서명완료" : 
                         contract.status === "PENDING" ? "서명대기" : "만료됨"}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        생성일: {contract.createdAt ? formatToKST(contract.createdAt) : "날짜 없음"}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onViewGeneratedContract && onViewGeneratedContract(contract)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        alert('다운로드 기능은 아직 구현되지 않았습니다.')
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p>생성된 계약서가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
} 
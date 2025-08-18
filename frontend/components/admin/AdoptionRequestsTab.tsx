"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Phone, Mail, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { AdoptionRequestsTabProps, AdoptionRequest } from "@/types/admin"
import { adoptionRequestApi } from "@/lib/api"

export default function AdoptionRequestsTab({
  onShowContractModal,
}: AdoptionRequestsTabProps) {
  const [adoptionRequests, setAdoptionRequests] = useState<AdoptionRequest[]>([])
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

  // 입양신청 데이터 페칭
  const fetchAdoptionRequests = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await adoptionRequestApi.getAdoptionRequests()
      console.log('Adoption requests response:', response)
      
      // response가 배열인지 확인
      if (!response || !Array.isArray(response)) {
        console.error('입양신청 API 응답이 배열이 아닙니다:', response)
        setAdoptionRequests([])
        return
      }
      
      setAdoptionRequests(response)
    } catch (error) {
      console.error('입양 신청 데이터 페칭 실패:', error)
      setAdoptionRequests([])
    } finally {
      setLoading(false)
    }
  }

  // 입양신청 상태 업데이트
  const updateAdoptionRequestStatus = async (requestId: number, status: "PENDING" | "CONTACTED" | "APPROVED" | "REJECTED") => {
    try {
      await adoptionRequestApi.updateAdoptionRequestStatus(requestId, status)
      
      // 프론트엔드 상태 업데이트
      setAdoptionRequests(prev => prev.map(request => 
        request.id === requestId 
          ? { ...request, status }
          : request
      ))
      
      return true
    } catch (error) {
      console.error('입양신청 상태 업데이트 오류:', error)
      throw new Error('입양신청 상태 업데이트에 실패했습니다.')
    }
  }

  // 컴포넌트 마운트 시 데이터 페칭
  useEffect(() => {
    fetchAdoptionRequests()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "CONTACTED":
        return "bg-blue-100 text-blue-800"
      case "APPROVED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleUpdateStatus = async (requestId: number, newStatus: string) => {
    try {
      await updateAdoptionRequestStatus(requestId, newStatus as "PENDING" | "CONTACTED" | "APPROVED" | "REJECTED")
      const statusText = newStatus === "CONTACTED" ? "연락완료" : 
                        newStatus === "APPROVED" ? "승인" : "거절"
      alert(`입양신청이 ${statusText}로 변경되었습니다.`)
    } catch (error) {
      console.error('입양신청 상태 업데이트 오류:', error)
      alert('입양신청 상태 업데이트에 실패했습니다.')
    }
  }

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">입양신청 데이터를 불러오는 중...</p>
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
      <h2 className="text-2xl font-bold">입양신청 관리</h2>

      <div className="grid gap-4">
        {adoptionRequests && adoptionRequests.length > 0 ? (
          adoptionRequests.map((request, index) => (
            <Card key={request.id || `adoption-request-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <h3 className="font-semibold">{request.petName} ({request.petBreed}) 입양신청</h3>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status === "PENDING" ? "대기중" : 
                         request.status === "CONTACTED" ? "연락완료" :
                         request.status === "APPROVED" ? "승인" : "거절"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">신청자: {request.applicantName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">연락처: {request.contactNumber}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">이메일: {request.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">사용자 ID: {request.userId}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-sm mb-2">입양 동기 및 메시지:</h4>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {request.message}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>신청일: {request.createdAt ? formatToKST(request.createdAt) : "날짜 없음"}</span>
                      <span>수정일: {request.updatedAt ? formatToKST(request.updatedAt) : "날짜 없음"}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(request.id, "CONTACTED")}
                      disabled={request.status === "CONTACTED" || request.status === "APPROVED" || request.status === "REJECTED"}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      연락완료
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(request.id, "APPROVED")}
                      disabled={request.status === "APPROVED" || request.status === "REJECTED"}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      승인
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(request.id, "REJECTED")}
                      disabled={request.status === "APPROVED" || request.status === "REJECTED"}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      거절
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <p>입양신청이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
} 
"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, User, Calendar, DollarSign, Eye, AlertCircle } from "lucide-react"
import { OrdersTabProps, AdminOrder } from "@/types/admin"

export default function OrdersTab({
  onViewOrderDetails,
}: OrdersTabProps) {
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 주문 데이터 페칭 (임시로 빈 배열)
  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      // TODO: 실제 주문 API 구현 후 연결
      setOrders([])
    } catch (error) {
      console.error('Error fetching orders:', error)
      setError('주문 데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 데이터 페칭
  useEffect(() => {
    fetchOrders()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "PROCESSING":
        return "bg-blue-100 text-blue-800"
      case "SHIPPED":
        return "bg-green-100 text-green-800"
      case "DELIVERED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "결제대기"
      case "PROCESSING":
        return "처리중"
      case "SHIPPED":
        return "배송중"
      case "DELIVERED":
        return "배송완료"
      case "CANCELLED":
        return "취소됨"
      default:
        return status
    }
  }

  const calculateTotalAmount = (order: any) => {
    return order.orderItems?.reduce((total: number, item: any) => {
      return total + (item.price * item.quantity)
    }, 0) || 0
  }

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">주문 데이터를 불러오는 중...</p>
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
      <h2 className="text-2xl font-bold">주문 관리</h2>

      <div className="grid gap-4">
        {orders && orders.length > 0 ? (
          orders.map((order, index) => (
            <Card key={order.id || `order-${index}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-3">
                      <h3 className="font-semibold">주문 #{order.id}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">주문자: {order.customerName || order.userName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Package className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">상품 수: {order.orderItems?.length || 0}개</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-semibold">
                          총 금액: {calculateTotalAmount(order).toLocaleString()}원
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">
                          주문일: {order.createdAt ? formatToKST(order.createdAt) : "날짜 없음"}
                        </span>
                      </div>
                    </div>
                    
                    {/* 주문 상품 목록 */}
                    {order.orderItems && order.orderItems.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-2">주문 상품:</h4>
                        <div className="space-y-2">
                          {order.orderItems.map((item: any, itemIndex: number) => (
                            <div key={itemIndex} className="flex items-center space-x-2 text-sm">
                              <img
                                src={item.productImage || "/placeholder.svg"}
                                alt={item.productName}
                                className="w-8 h-8 object-cover rounded"
                              />
                              <span className="flex-1">{item.productName}</span>
                              <span className="text-gray-600">{item.quantity}개</span>
                              <span className="font-medium">{item.price.toLocaleString()}원</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* 배송 정보 */}
                    {order.shippingAddress && (
                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-2">배송지:</h4>
                        <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewOrderDetails(order)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      상세보기
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">주문이 없습니다</h3>
                <p className="text-gray-500">아직 주문이 접수되지 않았습니다.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 
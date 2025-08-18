"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2, AlertCircle } from "lucide-react"
import { ProductsTabProps, AdminProduct } from "@/types/admin"
import { productApi } from "@/lib/api"

export default function ProductsTab({
  onNavigateToStoreRegistration,
  onEditProduct,
}: ProductsTabProps) {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 현재 KST 날짜 가져오기
  const getCurrentKSTDate = () => {
    const now = new Date()
    const kstOffset = 9 * 60 // KST는 UTC+9
    const kstTime = new Date(now.getTime() + kstOffset * 60 * 1000)
    return kstTime.toISOString()
  }

  // 상품 목록 페칭
  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const apiProducts = await productApi.getProducts()
      console.log('API Products response:', apiProducts)

      // apiProducts가 배열인지 확인
      if (!apiProducts || !Array.isArray(apiProducts)) {
        console.error('API 응답이 배열이 아닙니다:', apiProducts)
        setError('상품 데이터 형식이 올바르지 않습니다.')
        return
      }

      const convertedProducts = apiProducts.map((product: any, index: number) => {
        console.log(`Converting product ${index + 1}:`, product)
        return {
          id: product.id || product.productId || 0,
          name: product.name || product.productName || '이름 없음',
          price: product.price || 0,
          imageUrl: product.image_url || product.imageUrl || product.image || '/placeholder.svg',
          category: product.category || '카테고리 없음',
          description: product.description || '',
          tags: product.tags
            ? Array.isArray(product.tags)
              ? product.tags
              : product.tags.split(',').map((tag: string) => tag.trim())
            : [],
          stock: product.stock || 0,
          targetAnimal: product.targetAnimal || 'ALL',
          registrationDate: product.registration_date || product.registrationDate || product.createdAt || getCurrentKSTDate(),
          registeredBy: product.registered_by || product.registeredBy || 'admin',
        }
      })

      console.log('Converted products:', convertedProducts)

      const sortedProducts = convertedProducts.sort((a: AdminProduct, b: AdminProduct) => {
        const dateA = new Date(a.registrationDate).getTime()
        const dateB = new Date(b.registrationDate).getTime()
        return dateB - dateA
      })

      setProducts(sortedProducts)
      console.log('Products state updated:', sortedProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('상품 목록을 불러오는 데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 상품 삭제
  const deleteProduct = async (productId: number) => {
    if (!productId || isNaN(productId)) {
      throw new Error('유효하지 않은 상품 ID입니다.')
    }
    
    try {
      console.log('상품 삭제 요청:', productId)
      await productApi.deleteProduct(productId)
      console.log('삭제 완료')
      setProducts((prev: AdminProduct[]) => prev.filter((p: AdminProduct) => p.id !== productId))
      return true
    } catch (error) {
      console.error('상품 삭제 오류:', error)
      throw new Error('상품 삭제 중 오류가 발생했습니다.')
    }
  }

  const handleDeleteProduct = async (productId: number) => {
    if (window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      try {
        await deleteProduct(productId)
        alert('상품이 성공적으로 삭제되었습니다.')
      } catch (error) {
        console.error('상품 삭제 오류:', error)
        alert('상품 삭제 중 오류가 발생했습니다.')
      }
    }
  }

  // 컴포넌트 마운트 시 데이터 페칭
  useEffect(() => {
    fetchProducts()
  }, [])

  // 로딩 상태
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">상품 데이터를 불러오는 중...</p>
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
        <h2 className="text-2xl font-bold">상품 관리</h2>
        <Button onClick={onNavigateToStoreRegistration} className="bg-yellow-400 hover:bg-yellow-500 text-black">
          <Plus className="h-4 w-4 mr-2" />새 상품 등록
        </Button>
      </div>

      <div className="grid gap-4">
        {products && products.length > 0 ? (
          products.map((product, index) => (
          <Card key={product.id || `product-${index}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.category}</p>
                    <p className="text-lg font-bold text-yellow-600">{product.price.toLocaleString()}원</p>
                    <p className="text-sm text-gray-500">재고: {product.stock}개</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      console.log('Edit button clicked for product:', product);
                      console.log('Product ID:', product.id);
                      onEditProduct(product);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleDeleteProduct(product.id)}
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
            <p>등록된 상품이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  )
} 
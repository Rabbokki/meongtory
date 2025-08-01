import React, { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { ArrowLeft, Save, X } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  tags: string[];
  stock: number;
  petType?: "dog" | "cat" | "all";
  registrationDate: string;
  registeredBy: string;
}

interface StoreProductEditPageProps {
  productId: number;
  onBack: () => void;
  onSave: (product: Product) => void;
}

const categories = [
  { name: "사료", value: "사료" },
  { name: "간식", value: "간식" },
  { name: "장난감", value: "장난감" },
  { name: "용품", value: "용품" },
  { name: "의류", value: "의류" },
  { name: "건강관리", value: "건강관리" },
];

const petTypes = [
  { name: "강아지", value: "dog" },
  { name: "고양이", value: "cat" },
  { name: "모든 동물", value: "all" },
];

export default function StoreProductEditPage({ productId, onBack, onSave }: StoreProductEditPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 상품 데이터 로드
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`);
        
        if (!response.ok) {
          throw new Error('상품을 찾을 수 없습니다.');
        }
        
        const productData = await response.json();
        setProduct(productData);
      } catch (err) {
        setError(err instanceof Error ? err.message : '상품을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleInputChange = (field: keyof Product, value: any) => {
    if (product) {
      setProduct({ ...product, [field]: value });
    }
  };

  const handleSave = async () => {
    if (!product) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: product.name,
          price: product.price,
          category: product.category,
          description: product.description,
          stock: product.stock,
          targetAnimal: product.petType === 'all' ? 'ALL' : product.petType === 'dog' ? 'DOG' : 'CAT',
          tags: JSON.stringify(product.tags),
          imageUrl: product.image,
        }),
      });

      if (!response.ok) {
        throw new Error('상품 수정에 실패했습니다.');
      }

      onSave(product);
      alert('상품이 성공적으로 수정되었습니다.');
      onBack();
    } catch (err) {
      console.error('상품 수정 오류:', err);
      alert('상품 수정 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">상품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">오류 발생</h2>
            <p className="text-gray-600 mb-4">{error || '상품을 찾을 수 없습니다.'}</p>
            <Button onClick={onBack} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            돌아가기
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">상품 수정</h1>
          <div className="w-20"></div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">상품 정보 수정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 상품명 */}
            <div className="space-y-2">
              <Label htmlFor="name">상품명 *</Label>
              <Input
                id="name"
                value={product.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="상품명을 입력하세요"
                required
              />
            </div>

            {/* 가격 */}
            <div className="space-y-2">
              <Label htmlFor="price">가격 *</Label>
              <Input
                id="price"
                type="number"
                value={product.price}
                onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                placeholder="가격을 입력하세요"
                required
              />
            </div>

            {/* 카테고리 */}
            <div className="space-y-2">
              <Label htmlFor="category">카테고리 *</Label>
              <Select value={product.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 반려동물 타입 */}
            <div className="space-y-2">
              <Label htmlFor="petType">반려동물 타입 *</Label>
              <Select value={product.petType || 'all'} onValueChange={(value) => handleInputChange('petType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="반려동물 타입을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {petTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 재고 */}
            <div className="space-y-2">
              <Label htmlFor="stock">재고 *</Label>
              <Input
                id="stock"
                type="number"
                value={product.stock}
                onChange={(e) => handleInputChange('stock', parseInt(e.target.value) || 0)}
                placeholder="재고 수량을 입력하세요"
                required
              />
            </div>

            {/* 상품 설명 */}
            <div className="space-y-2">
              <Label htmlFor="description">상품 설명</Label>
              <textarea
                id="description"
                value={product.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="상품에 대한 설명을 입력하세요"
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                rows={4}
              />
            </div>

            {/* 이미지 URL */}
            <div className="space-y-2">
              <Label htmlFor="image">이미지 URL</Label>
              <Input
                id="image"
                value={product.image}
                onChange={(e) => handleInputChange('image', e.target.value)}
                placeholder="이미지 URL을 입력하세요"
              />
            </div>

            {/* 버튼 */}
            <div className="flex space-x-4 pt-6">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? '저장 중...' : '저장'}
              </Button>
              <Button
                variant="outline"
                onClick={onBack}
                disabled={saving}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                취소
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
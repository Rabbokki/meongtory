"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, X, Upload } from 'lucide-react';
import Image from 'next/image';
import { productApi } from '@/lib/api';
import axios from 'axios';

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
  { name: "의류", value: "의류" },
  { name: "장난감", value: "장난감" },
  { name: "건강관리", value: "건강관리" },
  { name: "용품", value: "용품" },
  { name: "간식", value: "간식" },
  { name: "사료", value: "사료" },
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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  // 상품 데이터 로드
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log('요청할 productId:', productId, '타입:', typeof productId);
        const productData = await productApi.getProduct(productId);
        console.log('로드된 상품 데이터:', productData);
        console.log('상품 이미지 필드:', productData.image);
        console.log('상품 imageUrl 필드:', productData.imageUrl);
        console.log('상품 모든 필드:', Object.keys(productData));
        console.log('백엔드 productId:', productData.productId);
        
        // 백엔드 응답을 프론트엔드 형식으로 변환
        const convertedProduct: Product = {
          id: productData.productId, // productId를 id로 변환
          name: productData.name,
          price: productData.price,
          image: productData.imageUrl, // imageUrl을 image로 변환
          category: productData.category,
          description: productData.description,
          tags: [], // 백엔드에 tags 필드가 없으므로 빈 배열
          stock: productData.stock,
          petType: (productData.targetAnimal === 'ALL' ? 'all' : 
                   productData.targetAnimal === 'DOG' ? 'dog' : 'cat') as "dog" | "cat" | "all",
          registrationDate: productData.registrationDate,
          registeredBy: productData.registeredBy
        };
        
        setProduct(convertedProduct);
        
        // 기존 이미지가 있으면 미리보기에 설정
        const imageUrl = convertedProduct.image;
        if (imageUrl && imageUrl !== "/placeholder.svg") {
          console.log('기존 이미지 발견:', imageUrl);
          setImagePreview(imageUrl);
          
          // 기존 이미지가 있으면 파일명도 설정 (URL에서 파일명 추출)
          console.log('이미지 URL:', imageUrl);
          
          // URL에서 파일명 추출 (여러 방법 시도)
          let fileName = '';
          
          // 1. 마지막 슬래시 이후 부분 추출
          if (imageUrl.includes('/')) {
            fileName = imageUrl.split('/').pop() || '';
            console.log('방법1 - 추출된 파일명:', fileName);
          }
          
          // 2. 파일명이 비어있으면 UUID 형태의 파일명 생성
          if (!fileName && imageUrl.includes('amazonaws.com')) {
            // S3 URL에서 UUID 형태의 파일명 추출
            const urlParts = imageUrl.split('/');
            const lastPart = urlParts[urlParts.length - 1];
            if (lastPart && lastPart.includes('.')) {
              fileName = lastPart;
              console.log('방법2 - S3에서 추출된 파일명:', fileName);
            }
          }
          
          // 3. 여전히 파일명이 없으면 기본값 설정
          if (!fileName) {
            fileName = 'product-image.jpg';
            console.log('방법3 - 기본 파일명 설정:', fileName);
          }
          
          if (fileName) {
            setSelectedFileName(fileName);
            console.log('최종 파일명 설정됨:', fileName);
          }
        } else {
          console.log('기존 이미지 없음 또는 placeholder');
        }
      } catch (err) {
        console.error('상품 조회 오류:', err);
        
        // axios 에러인 경우 더 자세한 정보 출력
        if (axios.isAxiosError(err)) {
          console.error('Axios 에러 상세:', {
            status: err.response?.status,
            statusText: err.response?.statusText,
            data: err.response?.data,
            url: err.config?.url,
            method: err.config?.method
          });
          
          if (err.response?.status === 400) {
            setError(`잘못된 요청입니다. (상품 ID: ${productId})`);
          } else if (err.response?.status === 404) {
            setError('상품을 찾을 수 없습니다.');
          } else {
            setError(`서버 오류가 발생했습니다. (${err.response?.status})`);
          }
        } else {
          setError('상품을 불러오는데 실패했습니다.');
        }
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

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('파일 선택 이벤트:', e.target.files);
    
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      console.log('선택된 파일:', file);
      console.log('파일명:', file.name);
      console.log('파일 크기:', file.size);
      console.log('파일 타입:', file.type);
      
      setImageFile(file);
      setSelectedFileName(file.name);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('파일 읽기 완료');
        setImagePreview(reader.result as string);
      };
      reader.onerror = () => {
        console.error('파일 읽기 오류');
      };
      reader.readAsDataURL(file);
    } else {
      console.log('파일 선택 취소됨');
      setImageFile(null);
      // 파일 선택을 취소해도 기존 이미지가 있으면 파일명 유지
      if (!product?.image || product.image === "/placeholder.svg") {
        setImagePreview(null);
        setSelectedFileName('');
      }
    }
  };

  const handleSave = async () => {
    if (!product) return;

    try {
      setSaving(true);
      
      let imageUrl = product.image;
      
      // 새 이미지가 업로드된 경우 Base64로 변환하여 백엔드로 전송
      if (imageFile) {
        const base64Promise = new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(imageFile);
        });
        imageUrl = await base64Promise;
      }

      console.log('상품 수정 데이터:', {
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description,
        stock: product.stock,
        targetAnimal: product.petType === 'all' ? 'ALL' : product.petType === 'dog' ? 'DOG' : 'CAT',
        imageUrl: imageUrl,
      });

      await productApi.updateProduct(productId, {
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description,
        stock: product.stock,
        targetAnimal: product.petType === 'all' ? 'ALL' : product.petType === 'dog' ? 'DOG' : 'CAT',
        imageUrl: imageUrl,
      });

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

            {/* 이미지 업로드 */}
            <div className="space-y-2">
              <Label htmlFor="image-upload">상품 이미지</Label>
              <div className="space-y-2">
                <div className="relative">
                  <Input 
                    id="image-upload" 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageFileChange}
                    className="cursor-pointer opacity-0 absolute inset-0 w-full h-full"
                  />
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-yellow-500 transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {selectedFileName ? '파일 변경하기' : '이미지 파일 선택하기'}
                    </p>
                  </div>
                </div>
                {selectedFileName ? (
                  <div className="text-sm text-green-600 font-medium bg-green-50 p-2 rounded-md border border-green-200">
                    ✅ {imageFile ? '새로 선택된 파일' : '기존 파일'}: {selectedFileName}
                  </div>
                ) : product?.image && product.image !== "/placeholder.svg" ? (
                  <div className="text-sm text-blue-600 font-medium bg-blue-50 p-2 rounded-md border border-blue-200">
                    📷 기존 이미지가 설정되어 있습니다
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 bg-gray-50 p-2 rounded-md border border-gray-200">
                    📁 파일을 선택해주세요
                  </div>
                )}
              </div>
              {product.image && product.image !== "/placeholder.svg" && !imagePreview && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    현재 이미지가 설정되어 있습니다. 새 이미지를 선택하면 기존 이미지가 교체됩니다.
                  </p>
                </div>
              )}
              {(imagePreview || (product.image && product.image !== "/placeholder.svg")) && (
                <div className="mt-4 w-48 h-48 relative overflow-hidden rounded-md border border-gray-300">
                  <Image
                    src={imagePreview || product.image}
                    alt="상품 이미지"
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('이미지 로딩 실패:', imagePreview || product.image);
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                    }}
                  />
                </div>
              )}
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
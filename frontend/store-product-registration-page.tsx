"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, X } from "lucide-react"
import Image from "next/image"

interface Product {
  id: number
  name: string
  brand: string
  price: number
  image: string
  category: string
  description: string
  tags: string[]
  stock: number
  registrationDate: string
  registeredBy: string
  petType: "dog" | "cat" | "all"
}

interface StoreProductRegistrationPageProps {
  isAdmin?: boolean
  currentUserId?: string
  onBack: () => void
  products: Product[]
  onAddProduct: (product: Product) => void
}

const availableTags = [
  "신상품",
  "베스트셀러",
  "할인",
  "무료배송",
  "강아지용",
  "고양이용",
  "소형견",
  "중형견",
  "대형견",
  "전연령",
  "퍼피",
  "시니어",
]

const categories = ["사료", "간식", "장난감", "용품", "의류", "건강관리"]

export default function StoreProductRegistrationPage({
  isAdmin = false,
  currentUserId,
  onBack,
  products,
  onAddProduct,
}: StoreProductRegistrationPageProps) {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
    category: "",
    description: "",
    stock: "",
    petType: "all", // Add petType to form data
  })
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handleSaveProduct = async () => {
    console.log("=== 상품 등록 시작 ===")
    console.log("Form data:", formData)
    console.log("Selected tags:", selectedTags)

    // 유효성 검사
    if (!formData.name.trim()) {
      alert("상품명을 입력해주세요.")
      return
    }

    if (!formData.brand.trim()) {
      alert("브랜드를 입력해주세요.")
      return
    }

    if (!formData.category) {
      alert("카테고리를 선택해주세요.")
      return
    }

    const price = Number.parseInt(formData.price)
    if (!formData.price || isNaN(price) || price <= 0) {
      alert("올바른 가격을 입력해주세요.")
      return
    }

    const stock = Number.parseInt(formData.stock)
    if (!formData.stock || isNaN(stock) || stock < 0) {
      alert("올바른 재고 수량을 입력해주세요.")
      return
    }

    setIsSubmitting(true)

    try {
      const newProduct: Product = {
        id: Date.now(), // 간단한 ID 생성
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        price: price,
        image: imagePreview || "/placeholder.svg?height=300&width=300", // Use imagePreview
        category: formData.category,
        description: formData.description.trim(),
        tags: selectedTags,
        stock: stock,
        registrationDate: new Date().toISOString(),
        registeredBy: currentUserId || "admin",
        petType: formData.petType as "dog" | "cat" | "all", // Add petType
      }

      console.log("새 상품 데이터:", newProduct)

      // 상품 추가
      onAddProduct(newProduct)

      console.log("상품 등록 완료!")
      alert("상품이 성공적으로 등록되었습니다!")

      // 폼 초기화
      setFormData({
        name: "",
        brand: "",
        price: "",
        category: "",
        description: "",
        stock: "",
        petType: "all", // Reset petType
      })
      setImageFile(null); // Reset image file
      setImagePreview(null); // Reset image preview
      setSelectedTags([]);

      // 스토어 페이지로 돌아가기
      onBack()
    } catch (error) {
      console.error("상품 등록 중 오류:", error)
      alert("상품 등록 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold mb-2">접근 권한이 없습니다</h2>
            <p className="text-gray-600 mb-4">관리자만 상품을 등록할 수 있습니다.</p>
            <Button onClick={onBack}>돌아가기</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack} className="hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            관리자 페이지로 돌아가기
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">상품 등록</h1>
            <p className="text-gray-600">새로운 펫용품을 등록해보세요</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle>상품 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Product Name */}
              <div className="space-y-2">
                <Label htmlFor="name">상품명 *</Label>
                <Input
                  id="name"
                  placeholder="상품명을 입력하세요"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                />
              </div>

              {/* Brand */}
              <div className="space-y-2">
                <Label htmlFor="brand">브랜드 *</Label>
                <Input
                  id="brand"
                  placeholder="브랜드명을 입력하세요"
                  value={formData.brand}
                  onChange={(e) => handleInputChange("brand", e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">카테고리 *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리를 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Pet Type */}
              <div className="space-y-2">
                <Label htmlFor="petType">대상 동물 *</Label>
                <Select value={formData.petType} onValueChange={(value) => handleInputChange("petType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="대상 동물을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">강아지/고양이 (모두)</SelectItem>
                    <SelectItem value="dog">강아지</SelectItem>
                    <SelectItem value="cat">고양이</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">가격 (원) *</Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">재고 수량 *</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange("stock", e.target.value)}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label htmlFor="image-upload">사진 첨부 (선택 사항)</Label>
                <Input id="image-upload" type="file" accept="image/*" onChange={handleImageFileChange} />
                {imagePreview ? (
                  <div className="mt-4 w-48 h-48 relative overflow-hidden rounded-md border border-gray-300">
                    <Image src={imagePreview} alt="Image Preview" layout="fill" objectFit="cover" />
                  </div>
                ) : (
                  <div className="mt-4 w-48 h-48 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center text-gray-400">
                    <Upload className="w-12 h-12" />
                    <p className="text-sm">상품 이미지</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">상품 설명</Label>
                <Textarea
                  id="description"
                  placeholder="상품에 대한 자세한 설명을 입력하세요"
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>태그</Label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">선택된 태그:</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedTags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                          <X className="w-3 h-3 ml-1 cursor-pointer" onClick={() => handleTagToggle(tag)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent">
                  취소
                </Button>
                <Button
                  onClick={handleSaveProduct}
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "등록 중..." : "상품 등록"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-white">
                <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="상품 미리보기"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <Upload className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">상품 이미지</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{formData.name || "상품명"}</h3>
                  <p className="text-sm text-gray-500">{formData.brand || "브랜드"}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-yellow-600">
                      {formData.price ? `${Number.parseInt(formData.price).toLocaleString()}원` : "0원"}
                    </span>
                    {formData.category && (
                      <Badge variant="outline" className="text-xs">
                        {formData.category}
                      </Badge>
                    )}
                  </div>
                  {selectedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedTags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {formData.description && <p className="text-sm text-gray-600 line-clamp-3">{formData.description}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

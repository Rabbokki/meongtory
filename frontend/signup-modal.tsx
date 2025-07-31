"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Eye, EyeOff } from "lucide-react"

interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onSignup: (userData: {
    name: string
    email: string
    password: string
    petType?: string
    petAge?: string
    petBreed?: string
  }) => void
  onSwitchToLogin: () => void
}

export default function SignupModal({ isOpen, onClose, onSignup, onSwitchToLogin }: SignupModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [petType, setPetType] = useState<string | undefined>(undefined)
  const [petAge, setPetAge] = useState("")
  const [petBreed, setPetBreed] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name || !email || !password || !confirmPassword) {
      setError("모든 필수 정보를 입력해주세요.")
      return
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }

    if (password.length < 4) {
      setError("비밀번호는 최소 4자 이상이어야 합니다.")
      return
    }

    setIsLoading(true)

    try {
      // 간단한 회원가입 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onSignup({ name, email, password, petType, petAge, petBreed })
    } catch (err) {
      setError("회원가입 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="relative">
          <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
          <CardTitle className="text-2xl font-bold text-center">회원가입</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="signup-name">이름</Label>
              <Input
                id="signup-name"
                type="text"
                placeholder="이름을 입력하세요"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">이메일</Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">비밀번호</Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="비밀번호를 입력하세요 (최소 4자)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">비밀번호 확인</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="비밀번호를 다시 입력하세요"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* 반려동물 정보 */}
            <div className="space-y-2">
              <Label htmlFor="pet-type">반려동물 종류 (선택 사항)</Label>
              <Select onValueChange={setPetType} value={petType}>
                <SelectTrigger id="pet-type">
                  <SelectValue placeholder="반려동물 종류를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="강아지">강아지</SelectItem>
                  <SelectItem value="고양이">고양이</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 반려동물 나이 및 품종 (항상 표시) */}
            <div className="space-y-2">
              <Label htmlFor="pet-age">반려동물 나이 (선택 사항)</Label>
              <Input
                id="pet-age"
                type="text"
                placeholder="예: 2살, 5개월"
                value={petAge}
                onChange={(e) => setPetAge(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pet-breed">반려동물 품종 (선택 사항)</Label>
              <Input
                id="pet-breed"
                type="text"
                placeholder="예: 푸들, 코리안 숏헤어"
                value={petBreed}
                onChange={(e) => setPetBreed(e.target.value)}
              />
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "회원가입 중..." : "회원가입"}
            </Button>
          </form>

          <div className="text-center">
            <div className="text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
              <button onClick={onSwitchToLogin} className="text-blue-600 hover:underline">
                로그인
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

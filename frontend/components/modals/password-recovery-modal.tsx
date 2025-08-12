"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail } from "lucide-react"

interface PasswordRecoveryModalProps {
  isOpen: boolean
  onClose: () => void
  onBackToLogin: () => void
}

export default function PasswordRecoveryModal({ isOpen, onClose, onBackToLogin }: PasswordRecoveryModalProps) {
  const [email, setEmail] = useState("")
  const [isEmailSent, setIsEmailSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle password recovery logic here
    console.log("Password recovery for:", email)
    setIsEmailSent(true)
  }

  const handleReset = () => {
    setEmail("")
    setIsEmailSent(false)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleReset}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <button onClick={onBackToLogin} className="p-1 hover:bg-gray-100 rounded">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <DialogTitle className="text-xl font-bold">비밀번호 찾기</DialogTitle>
          </div>
        </DialogHeader>

        {!isEmailSent ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8 text-yellow-600" />
              </div>
              <p className="text-gray-600">
                가입하신 이메일 주소를 입력해주세요.
                <br />
                비밀번호 재설정 링크를 보내드립니다.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recovery-email">이메일 주소</Label>
              <Input
                id="recovery-email"
                type="email"
                placeholder="이메일을 입력하세요"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium">
              재설정 링크 보내기
            </Button>
          </form>
        ) : (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">이메일을 확인해주세요</h3>
              <p className="text-gray-600">
                <span className="font-medium">{email}</span>로
                <br />
                비밀번호 재설정 링크를 보내드렸습니다.
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={onBackToLogin}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
              >
                로그인으로 돌아가기
              </Button>
              <Button variant="outline" onClick={() => setIsEmailSent(false)} className="w-full">
                다시 보내기
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

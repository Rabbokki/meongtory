"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Send, Shield, MessageCircle } from "lucide-react"
import axios from "axios"
import { getBackendUrl } from "@/lib/api";

interface ChatMessage {
  id: number
  message: string
  isUser: boolean
  timestamp: Date
}

interface InsuranceChatbotProps {
  initialQuery?: string
  onClose?: () => void
}

export default function InsuranceChatbot({ initialQuery, onClose }: InsuranceChatbotProps) {
  const [isOpen, setIsOpen] = useState(!!initialQuery)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      message: "안녕하세요! 🛡️ 멍토리 펫보험 전문가입니다. 보험 관련 궁금한 점이 있으시면 언제든 물어보세요!",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 메시지 추가 시 스크롤을 맨 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 초기 쿼리가 있으면 자동으로 전송
  useEffect(() => {
    if (initialQuery && isOpen) {
      sendMessage(initialQuery)
    }
  }, [initialQuery, isOpen])

  // 보험 관련 추천 질문들
  const suggestedQuestions = [
    "펫보험 가입 조건이 궁금해요",
    "어떤 보험사가 좋을까요?",
    "보장 내역을 알려주세요",
    "보험료는 얼마나 나올까요?",
    "가입 방법을 알려주세요"
  ]

  const sendMessage = async (message?: string) => {
    const textToSend = message || inputMessage.trim()
    if (!textToSend) return

    // 사용자 메시지 즉시 추가
    const userMessage: ChatMessage = {
      id: Date.now(),
      message: textToSend,
      isUser: true,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputMessage("") // 입력창 즉시 비우기
    setIsLoading(true)

    // 비동기적으로 챗봇 응답 처리
    try {
      const response = await axios.post(`${getBackendUrl()}/api/chatbot/insurance`,
        { query: textToSend },
        { headers: { "Content-Type": "application/json" } }
      )
      const botResponse: ChatMessage = {
        id: Date.now() + 1,
        message: response.data.answer || "응답이 비어 있습니다. 서버를 확인해주세요.",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, botResponse])
    } catch (error: any) {
      console.error("보험 챗봇 요청 실패:", error.message, error.response?.data)
      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        message: `죄송합니다. 서버 오류가 발생했습니다: ${error.message}`,
        isUser: false,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  // 링크를 클릭 가능한 버튼으로 변환하는 함수
  const formatMessageWithLinks = (message: string) => {
    // 긴 텍스트를 적절히 줄바꿈
    const formatLongText = (text: string) => {
      // 문장 단위로 줄바꿈 (마침표, 느낌표, 물음표 기준)
      const sentences = text.split(/(?<=[.!?])\s+/);
      return sentences.map((sentence, index) => (
        <span key={index}>
          {sentence}
          {index < sentences.length - 1 && <br />}
        </span>
      ));
    };

    // URL 패턴을 찾아서 클릭 가능한 링크로 변환
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const parts = message.split(urlPattern);
    
    if (parts.length === 1) {
      // URL이 없으면 일반 텍스트 반환 (줄바꿈 적용)
      return <div className="whitespace-pre-wrap break-words">{formatLongText(message)}</div>;
    }
    
    return (
      <div className="space-y-2">
        {parts.map((part, index) => {
          if (urlPattern.test(part)) {
            // URL 부분 - 하이퍼링크와 바로가기 버튼 모두 제공
            return (
              <div key={index} className="space-y-1">
                <a 
                  href={part} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {part}
                </a>
                <button
                  onClick={() => window.open(part, '_blank')}
                  className="inline-flex items-center space-x-1 bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 rounded-lg transition-colors"
                >
                  <span>🔗</span>
                  <span>바로가기</span>
                </button>
              </div>
            );
          } else {
            // 일반 텍스트 부분 (줄바꿈 적용)
            return <div key={index} className="whitespace-pre-wrap break-words">{formatLongText(part)}</div>;
          }
        })}
      </div>
    );
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      sendMessage()
    }
  }

  const handleSuggestedQuestion = (question: string) => {
    sendMessage(question)
  }

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 z-50"
          title="펫보험 전문가와 상담하기"
        >
          <Shield className="w-6 h-6 text-white" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <div>
                <h3 className="font-bold text-sm">펫보험 전문가</h3>
                <p className="text-xs opacity-90">온라인 상담</p>
              </div>
            </div>
            <button onClick={() => {
              setIsOpen(false)
              onClose?.()
            }} className="hover:bg-white/20 p-1 rounded transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.isUser 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" 
                      : "bg-gray-100 text-gray-800 border border-gray-200"
                  }`}
                  style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                >
                  {formatMessageWithLinks(message.message)}
                </div>
              </div>
            ))}
            
            {/* 로딩 인디케이터 */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 border border-gray-200 px-3 py-2 rounded-lg text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    <span>답변을 준비하고 있습니다...</span>
                  </div>
                </div>
              </div>
            )}

            {/* 추천 질문들 (첫 메시지 이후에만 표시하고 초기 쿼리가 없을 때만) */}
            {messages.length === 1 && !isLoading && !initialQuery && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 text-center">💡 이런 질문들을 해보세요:</p>
                <div className="grid grid-cols-1 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-left text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg transition-colors border border-blue-200"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="보험 관련 질문을 입력하세요..."
                className="flex-1 text-sm"
                disabled={isLoading}
              />
              <Button 
                onClick={() => sendMessage()} 
                size="sm" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-3"
                disabled={isLoading || !inputMessage.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 
// 서비스 관련 타입들

// 챗봇
export interface ChatMessage {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

// 펫 네이밍 서비스
export interface PetNamingServiceProps {
  onClose: () => void
}

// AI 연구소
export interface BreedIdentificationResult {
  breed: string
  confidence: number
  description: string
}

export interface BreedingResult {
  parent1: string
  parent2: string
  possibleOffspring: string[]
  recommendations: string[]
}

export interface MoodAnalysisResult {
  mood: string
  confidence: number
  recommendations: string[]
} 
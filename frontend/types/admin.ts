// 관리자 관련 타입들

export interface User {
  id: number
  email: string
  name: string
  role: string
}

export interface AdoptionInquiry {
  id: number
  petId: number
  petName: string
  inquirerName: string
  phone: string
  email: string
  message: string
  status: "대기중" | "연락완료" | "승인" | "거절"
  date: string
}

export interface AdoptionRequest {
  id: number
  petId: number
  petName: string
  petBreed: string
  userId: number
  userName: string
  applicantName: string
  contactNumber: string
  email: string
  message: string
  status: "PENDING" | "CONTACTED" | "APPROVED" | "REJECTED"
  createdAt: string
  updatedAt: string
}

export interface ContractTemplate {
  id: number
  name: string
  description: string
  sections: ContractSection[]
  createdAt: string
  updatedAt: string
}

export interface ContractSection {
  id: number
  title: string
  content: string
  order: number
  templateId: number
}

export interface ContractGenerationRequest {
  templateId: number
  petId: number
  userId: number
  customFields: {
    [key: string]: string
  }
}

export interface ContractGenerationResponse {
  contractId: number
  content: string
  downloadUrl: string
}

export interface AISuggestion {
  id: number
  sectionId: number
  suggestion: string
  createdAt: string
}

// 관리자 페이지 Props
export interface AdminPageProps {
  isAdmin: boolean
  currentUser: User | null
  onClose: () => void
} 
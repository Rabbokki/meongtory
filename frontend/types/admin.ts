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

export interface ContractTemplate {
  id: number
  name: string
  category: string
  description: string
  content: string
  isDefault: boolean
  sections: ContractSection[]
}

export interface ContractSection {
  id: string
  title: string
  aiSuggestion?: string
} 
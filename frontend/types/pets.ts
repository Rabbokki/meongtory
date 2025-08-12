// 입양용 반려동물 (보호소에서 보호 중인 동물)
export interface Pet {
  id: number
  name: string
  breed: string
  age: string
  gender: string
  size: string
  personality: string[]  // 배열로 통일 (여러 성격 특성을 가질 수 있음)
  healthStatus: string
  description: string
  images: string[]
  location: string
  contact: string
  adoptionFee: number
  isNeutered: boolean
  isVaccinated: boolean
  specialNeeds?: string
  dateRegistered: string
  adoptionStatus: "available" | "pending" | "adopted"
  ownerEmail?: string
  weight?: number
  microchipId?: string
  medicalHistory?: string
  vaccinations?: string
  notes?: string
  rescueStory?: string
  aiBackgroundStory?: string
  status?: string
  type?: string
}

// 사용자가 소유한 반려동물
export interface MyPet {
  id: number
  name: string
  breed: string
  age: number
  gender: 'MALE' | 'FEMALE' | 'UNKNOWN'
  type: string
  weight?: number
  imageUrl?: string
  userId: number
  createdAt: string
  updatedAt: string
}

export interface AnimalRecord {
  id: string
  name: string
  breed: string
  age: number
  gender: "수컷" | "암컷"
  weight: number
  registrationDate: Date
  medicalHistory: string[]
  vaccinations: string[]
  microchipId?: string
  notes: string
  contractGenerated: boolean
  aiBackgroundStory?: string
  images?: string[]
} 
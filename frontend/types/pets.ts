export interface Pet {
  id: number
  name: string
  breed: string
  age: string
  gender: string
  size: string
  personality: string
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
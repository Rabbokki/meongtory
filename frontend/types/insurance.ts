// 보험 관련 타입들

export interface Insurance {
  id: number
  company: string
  planName: string
  monthlyPremium: number
  coverage: string[]
  deductible: number
  maxPayout: number
  ageLimit: string
  description: string
  rating: number
  isPopular?: boolean
}

export interface InsuranceProduct {
  id: number
  company: string
  planName: string
  monthlyPremium: number
  coverage: string[]
  deductible: number
  maxPayout: number
  ageLimit: string
  description: string
  rating: number
  isPopular?: boolean
}

// 보험 페이지 Props
export interface PetInsurancePageProps {
  insurances: Insurance[]
  onViewInsurance: (insurance: Insurance) => void
  onClose: () => void
  isLoggedIn: boolean
  onNavigateToFavorites: () => void
}

export interface InsuranceDetailPageProps {
  insurance: Insurance
  onBack: () => void
  onApply: (insuranceId: number) => void
  isLoggedIn: boolean
}

export interface InsuranceFavoritesPageProps {
  favoriteInsurances: Insurance[]
  onRemoveFromFavorites: (insuranceId: number) => void
  onViewInsurance: (insurance: Insurance) => void
  onBack: () => void
  isLoggedIn: boolean
} 
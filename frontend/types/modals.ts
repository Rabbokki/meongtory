// 모달 관련 타입들

export interface FormField {
  id: string
  label: string
  type: "text" | "email" | "tel" | "textarea"
  required: boolean
  placeholder: string
}

export interface UserInfo {
  id: number
  email: string
  name: string
  phone?: string
  address?: string
}

// 로그인 모달
export interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (user: UserInfo) => void
}

// 회원가입 모달
export interface SignupModalProps {
  isOpen: boolean
  onClose: () => void
  onSignupSuccess: (user: UserInfo) => void
}

// 비밀번호 복구 모달
export interface PasswordRecoveryModalProps {
  isOpen: boolean
  onClose: () => void
  onRecoverySuccess: () => void
}

// 입양 요청 모달
export interface AdoptionRequestModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPet: Pet | null
  onSubmit: (requestData: {
    petId: number
    [key: string]: any
  }) => void
  isAdmin?: boolean
  customFields?: FormField[]
  onUpdateCustomFields?: (fields: FormField[]) => void
}

// 동물 편집 모달
export interface AnimalEditModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPet: Pet | null
  onUpdatePet: (pet: Pet) => void
}

// 로그아웃 버튼
export interface LogoutButtonProps {
  onLogout: () => void
  className?: string
} 
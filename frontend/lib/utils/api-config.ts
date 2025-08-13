// API 설정을 위한 공통 유틸리티
export const getBackendUrl = () => {
  return process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
}

export const getApiBaseUrl = () => {
  return `${getBackendUrl()}/api`
}
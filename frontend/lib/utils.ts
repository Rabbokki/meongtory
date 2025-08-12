import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// KST로 날짜를 포맷팅하는 함수
export function formatToKST(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // KST 시간대로 변환 (UTC+9)
  const kstDate = new Date(dateObj.getTime() + (9 * 60 * 60 * 1000))
  
  return kstDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul'
  })
}

// KST로 날짜와 시간을 포맷팅하는 함수
export function formatToKSTWithTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  // KST 시간대로 변환 (UTC+9)
  const kstDate = new Date(dateObj.getTime() + (9 * 60 * 60 * 1000))
  
  return kstDate.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul'
  })
}

// 현재 KST 날짜를 ISO 문자열로 반환하는 함수
export function getCurrentKSTDate(): string {
  const now = new Date()
  const kstDate = new Date(now.getTime() + (9 * 60 * 60 * 1000))
  return kstDate.toISOString().split('T')[0]
}

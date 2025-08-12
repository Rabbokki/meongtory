import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 날짜 관련 유틸리티 함수들
export function formatToKST(date: string | Date): string {
  if (!date) return "날짜 없음"
  
  try {
    const d = new Date(date)
    
    // Invalid Date 체크
    if (isNaN(d.getTime())) {
      console.warn("Invalid date:", date)
      return "날짜 없음"
    }
    
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Seoul'
    })
  } catch (error) {
    console.error("Date formatting error:", error, "for date:", date)
    return "날짜 없음"
  }
}

export function formatToKSTWithTime(date: string | Date): string {
  if (!date) return "날짜 없음"
  
  try {
    const d = new Date(date)
    
    // Invalid Date 체크
    if (isNaN(d.getTime())) {
      console.warn("Invalid date:", date)
      return "날짜 없음"
    }
    
    return d.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Seoul'
    })
  } catch (error) {
    console.error("Date formatting error:", error, "for date:", date)
    return "날짜 없음"
  }
}

export function getCurrentKSTDate(): string {
  const now = new Date()
  return now.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul'
  })
}

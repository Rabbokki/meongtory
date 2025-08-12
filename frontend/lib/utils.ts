import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 날짜 관련 유틸리티 함수들
export function formatToKST(date: string | Date | number[]): string {
  if (!date) return "날짜 없음"
  
  // 디버깅을 위해 원본 날짜 데이터 로그
  console.log("formatToKST input:", date, "type:", typeof date)
  
  try {
    let d: Date
    
    // 배열 형태의 LocalDateTime 처리 (백엔드에서 오는 형식)
    if (Array.isArray(date)) {
      const [year, month, day, hour, minute, second, nano] = date
      // LocalDateTime 배열을 Date 객체로 변환
      d = new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1000000))
    } else {
      // 기존 문자열/Date 처리
      let dateString = date.toString()
      
      // ISO 형식이 아닌 경우 처리
      if (dateString.includes('T') && !dateString.includes('Z')) {
        dateString = dateString + 'Z'
      }
      
      d = new Date(dateString)
    }
    
    // Invalid Date 체크
    if (isNaN(d.getTime())) {
      console.warn("Invalid date:", date, "parsed as:", d)
      return "날짜 없음"
    }
    
    const result = d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Asia/Seoul'
    })
    
    console.log("formatToKST result:", result)
    return result
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

import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const parent1 = formData.get('parent1') as File
    const parent2 = formData.get('parent2') as File
    
    if (!parent1 || !parent2) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_IMAGES', message: '두 개의 이미지가 필요합니다.' } },
        { status: 400 }
      )
    }

    // Create FormData for backend API
    const backendFormData = new FormData()
    backendFormData.append('parent1', parent1)
    backendFormData.append('parent2', parent2)

    // Call Spring Boot backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    const response = await axios.post(`${backendUrl}/api/ai/predict-breeding`, backendFormData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })

    if (response.status !== 200) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    return NextResponse.json(response.data)

  } catch (error) {
    console.error('Breeding prediction error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'PREDICTION_ERROR', 
          message: '교배 예측 중 오류가 발생했습니다.' 
        } 
      },
      { status: 500 }
    )
  }
}

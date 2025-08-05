import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const image = formData.get('image') as File
    
    if (!image) {
      return NextResponse.json(
        { success: false, error: { code: 'NO_IMAGE', message: '이미지가 필요합니다.' } },
        { status: 400 }
      )
    }

    // Create FormData for backend API
    const backendFormData = new FormData()
    backendFormData.append('image', image)

    // Call Spring Boot backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080'
    const response = await fetch(`${backendUrl}/api/ai/predict-breed`, {
      method: 'POST',
      body: backendFormData,
    })

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`)
    }

    const result = await response.json()
    return NextResponse.json(result)

  } catch (error) {
    console.error('AI prediction error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: 'PREDICTION_ERROR', 
          message: '품종 분석 중 오류가 발생했습니다.' 
        } 
      },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await axios.post('http://localhost:8080/api/ai/generate-background-story', body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        story: response.data.data.story
      }
    });
  } catch (error) {
    console.error('AI 스토리 생성 오류:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'AI 스토리 생성에 실패했습니다.' 
      },
      { status: 500 }
    );
  }
} 
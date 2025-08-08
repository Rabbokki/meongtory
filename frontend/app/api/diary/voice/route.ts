import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');
    
    if (!audioFile) {
      return NextResponse.json({ error: '음성 파일이 없습니다.' }, { status: 400 });
    }

    // 서버로 전송할 FormData 생성
    const serverFormData = new FormData();
    serverFormData.append('audio', audioFile);
    
    const response = await fetch(`${BACKEND_URL}/api/diary/voice`, {
      method: 'POST',
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: serverFormData,
    });

    if (!response.ok) {
      let errorText = '';
      
      try {
        // 먼저 JSON으로 파싱 시도
        const errorData = await response.json();
        errorText = errorData.error || errorData.message || JSON.stringify(errorData);
      } catch {
        // JSON 파싱 실패 시 텍스트로 읽기
        errorText = await response.text();
      }
      
      return NextResponse.json({ error: errorText }, { status: response.status });
    }

    const responseText = await response.text();
    return NextResponse.json({ transcript: responseText });
    
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : '알 수 없는 오류' }, { status: 500 });
  }
}

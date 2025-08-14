import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: '파일이 없습니다.' },
        { status: 400 }
      );
    }

    // 백엔드 S3 업로드 API 호출
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';
    const backendFormData = new FormData();
    backendFormData.append('file', file);

    const response = await fetch(`${backendUrl}/api/s3/upload`, {
      method: 'POST',
      body: backendFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('S3 업로드 실패:', errorText);
      return NextResponse.json(
        { error: 'S3 업로드에 실패했습니다.' },
        { status: response.status }
      );
    }

    const uploadedUrl = await response.text();
    return NextResponse.json({ url: uploadedUrl });

  } catch (error) {
    console.error('S3 업로드 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 
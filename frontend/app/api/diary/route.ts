import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    console.log('Frontend API route called');
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    const url = userId 
      ? `${BACKEND_URL}/api/diary/user/${userId}`
      : `${BACKEND_URL}/api/diary`;

    console.log('Backend URL:', url);
    console.log('Access Token:', request.headers.get('Access_Token'));
    console.log('All headers:', Object.fromEntries(request.headers.entries()));

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Access_Token': request.headers.get('Access_Token') || '',
        'Content-Type': 'application/json',
      },
    });

    console.log('Backend response status:', response.status);
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', errorText);
      return NextResponse.json({ error: 'Failed to fetch diaries' }, { status: response.status });
    }

    const data = await response.json();
    console.log('Backend response data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/diary`, {
      method: 'POST',
      headers: {
        'Access_Token': request.headers.get('Access_Token') || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', errorText);
      return NextResponse.json({ error: 'Failed to create diary' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
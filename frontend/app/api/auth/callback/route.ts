import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  console.log("OAuth Callback - Code:", code, "State:", state);

  // --- 실제로는 여기서 백엔드로 code/state를 넘겨서 유저정보 & 토큰 받아와야 함 ---
  // 지금은 임시 Mock Response
  const mockResponse = {
    userId: 1,
    accessToken: "mock_access_token",
    refreshToken: "mock_refresh_token",
  };

  return NextResponse.json(mockResponse);
}

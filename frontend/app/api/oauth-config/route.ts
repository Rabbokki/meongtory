import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
    },
    kakao: {
      clientId: process.env.KAKAO_CLIENT_ID,
    },
    naver: {
      clientId: process.env.NAVER_CLIENT_ID,
    },
  })
}

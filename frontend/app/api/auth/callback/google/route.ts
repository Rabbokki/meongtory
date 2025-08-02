import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(new URL("/?error=oauth_error", request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", request.url))
  }

  try {
    // 여기서 실제로는 토큰을 교환하고 사용자 정보를 가져와야 합니다
    // 지금은 간단히 성공 페이지로 리다이렉트합니다
    return NextResponse.redirect(new URL("/?success=google_login", request.url))
  } catch (error) {
    console.error("Google OAuth error:", error)
    return NextResponse.redirect(new URL("/?error=oauth_failed", request.url))
  }
}

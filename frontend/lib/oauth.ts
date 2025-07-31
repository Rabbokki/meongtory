// OAuth 로그인 유틸리티 함수들

let oauthConfig: any = null

async function getOAuthConfig() {
  if (!oauthConfig) {
    try {
      const response = await fetch('/api/oauth-config')
      oauthConfig = await response.json()
    } catch (error) {
      console.error('Failed to load OAuth config:', error)
      // 폴백 설정
      oauthConfig = {
        google: { clientId: "test-google-client-id" },
        kakao: { clientId: "test-kakao-client-id" },
        naver: { clientId: "test-naver-client-id" }
      }
    }
  }
  return oauthConfig
}

export async function getOAuthProviders() {
  const config = await getOAuthConfig()
  
  return {
    google: {
      name: "Google",
      authUrl: "https://accounts.google.com/oauth/authorize",
      clientId: config.google.clientId,
      redirectUri: "http://localhost:3001/api/auth/callback/google",
      scope: "email",
    },
    kakao: {
      name: "Kakao",
      authUrl: "https://kauth.kakao.com/oauth/authorize",
      clientId: config.kakao.clientId,
      redirectUri: "http://localhost:3001/api/auth/callback/kakao",
      scope: "",
    },
    naver: {
      name: "Naver",
      authUrl: "https://nid.naver.com/oauth2.0/authorize",
      clientId: config.naver.clientId,
      redirectUri: "http://localhost:3001/api/auth/callback/naver",
      scope: "openid profile",
    },
  }
}

export async function getOAuthUrl(provider: "google" | "kakao" | "naver") {
  const providers = await getOAuthProviders()
  const config = providers[provider]
  
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    response_type: "code",
  })
  
  return `${config.authUrl}?${params.toString()}`
}

export async function handleOAuthLogin(provider: "google" | "kakao" | "naver") {
  const authUrl = await getOAuthUrl(provider)
  window.location.href = authUrl
}

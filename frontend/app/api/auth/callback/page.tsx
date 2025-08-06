"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function OAuthCallbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const processOAuth = async () => {
            const code = searchParams.get("code");
            const state = searchParams.get("state");

            if (!code) {
                alert("로그인 코드가 없습니다.");
                return;
            }

            try {
                const res = await fetch(`/api/auth/callback?code=${code}&state=${state}`);
                const data = await res.json();
                console.log("로그인 응답:", data); 

                if (data.userId && data.accessToken && data.refreshToken) {
                    localStorage.setItem("userId", data.userId.toString());  // 이거 반드시 있어야 해
                    localStorage.setItem("accessToken", data.accessToken);
                    localStorage.setItem("refreshToken", data.refreshToken);

                    console.log("userId 저장됨:", localStorage.getItem("userId"));  // 추가 디버그
                    router.push("/diary");
                } else {
                    alert("로그인 처리 실패");
                }
            } catch (err) {
                console.error("OAuth 처리 실패", err);
                alert("로그인 중 오류가 발생했습니다.");
            }
        };

        processOAuth();
    }, [searchParams, router]);

    return <div>로그인 처리 중...</div>;
}

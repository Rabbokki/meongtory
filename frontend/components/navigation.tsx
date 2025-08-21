// components/navigation.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Image from "next/image";
import LoginModal from "@/components/modals/login-modal";
import SignupModal from "@/components/modals/signup-modal";
import PasswordRecoveryModal from "@/components/modals/password-recovery-modal";
import { getBackendUrl } from "@/lib/api";

// NavigationHeader 컴포넌트 정의
interface NavigationHeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

function NavigationHeader({
  currentPage,
  onNavigate,
  isLoggedIn,
  isAdmin,
  onLogin,
  onLogout,
}: NavigationHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button onClick={() => onNavigate("home")} className="flex items-center space-x-2">
            <Image src="/KakaoTalk_20250729_160046076.png" alt="멍토리 로고" width={100} height={40} className="h-auto" />
          </button>
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => onNavigate("adoption")}
              className={`text-sm font-medium transition-colors ${
                currentPage === "adoption" ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
              }`}
            >
              입양
            </button>
            <button
              onClick={() => onNavigate("insurance")}
              className={`text-sm font-medium transition-colors ${
                currentPage === "insurance" ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
              }`}
            >
              펫보험
            </button>
            <button
              onClick={() => onNavigate("diary")}
              className={`text-sm font-medium transition-colors ${
                currentPage === "diary" ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
              }`}
            >
              성장일기
            </button>
            <button
              onClick={() => onNavigate("community")}
              className={`text-sm font-medium transition-colors ${
                currentPage === "community" ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
              }`}
            >
              커뮤니티
            </button>
            <button
              onClick={() => onNavigate("store")}
              className={`text-sm font-medium transition-colors ${
                currentPage === "store" ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
              }`}
            >
              스토어
            </button>
            <button
              onClick={() => onNavigate("research")}
              className={`text-sm font-medium transition-colors ${
                currentPage === "research" ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
              }`}
            >
              강아지 연구소
            </button>
            {isLoggedIn && (
              <button
                onClick={() => onNavigate("my")}
                className={`text-sm font-medium transition-colors ${
                  currentPage === "my" ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
                }`}
              >
                마이페이지
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => onNavigate("admin")}
                className={`text-sm font-medium transition-colors ${
                  currentPage === "admin" ? "text-red-600" : "text-red-700 hover:text-red-600"
                }`}
              >
                관리자
              </button>
            )}
          </nav>
          <div className="flex items-center space-x-3">
            {isLoggedIn ? (
              <Button onClick={onLogout} variant="outline" size="sm" className="text-sm bg-transparent">
                로그아웃
              </Button>
            ) : (
              <Button onClick={() => { console.log("로그인 버튼 클릭"); onLogin(); }} variant="outline" size="sm" className="text-sm bg-transparent">
                <User className="w-4 h-4 mr-1" />
                로그인
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Refresh Token Function
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      console.error("리프레시 토큰이 없습니다.");
      return null;
    }
    const response = await axios.post(`${getBackendUrl()}/api/accounts/refresh`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );
    const { accessToken } = response.data.data;
    localStorage.setItem("accessToken", accessToken);
    console.log("토큰 갱신 성공");
    return accessToken;
  } catch (err) {
    console.error("토큰 갱신 실패:", err);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    return null;
  }
};

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentPage, setCurrentPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: number; email: string; name: string } | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 현재 페이지 결정
  useEffect(() => {
    const getCurrentPage = () => {
      if (pathname === "/") return "home";
      const path = pathname.split("/")[2] || pathname.split("/")[1];
      return path || "home";
    };
    setCurrentPage(getCurrentPage());
  }, [pathname]);

  // 로딩 타임아웃
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log("로딩 타임아웃, 강제 해제");
        setIsLoading(false);
        toast.error("서버 응답이 느립니다. 다시 시도해주세요.", { duration: 5000 });
      }
    }, 3000);
    return () => clearTimeout(timeout);
  }, [isLoading]);

  // 로그인 상태 확인
  useEffect(() => {
    let isRefreshing = false;
    const checkLoginStatus = async () => {
      if (typeof window === "undefined" || isRefreshing) return;
      setIsLoading(true);
      let accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        setIsLoading(false);
        return;
      }
      try {
        const response = await axios.get(`${getBackendUrl()}/api/accounts/me`, {
          headers: { "Access_Token": accessToken },
          timeout: 5000,
        });
        const { id, email, name, role } = response.data.data;
        setCurrentUser({ id, email, name });
        setIsAdmin(role === "ADMIN");
        setIsLoggedIn(true);
        console.log("Initial login check successful:", { id, email, name, role });
      } catch (err: any) {
        console.error("사용자 정보 조회 실패:", err);
        if (err.code === "ECONNABORTED" || err.code === "ERR_NETWORK" || !err.response) {
          console.log("백엔드 서버 연결 실패, 로그아웃 처리");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setIsLoggedIn(false);
          setCurrentUser(null);
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }
        if (err.response?.status === 401) {
          isRefreshing = true;
          accessToken = await refreshAccessToken();
          if (accessToken) {
            try {
              const response = await axios.get(`${getBackendUrl()}/api/accounts/me`, {
                headers: { "Access_Token": accessToken },
                timeout: 5000,
              });
              const { id, email, name, role } = response.data.data;
              setCurrentUser({ id, email, name });
              setIsLoggedIn(true);
              setIsAdmin(role === "ADMIN");
              console.log("Retry login check successful:", { id, email, name, role });
            } catch (retryErr) {
              console.error("재시도 실패:", retryErr);
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              setIsLoggedIn(false);
              setCurrentUser(null);
              setIsAdmin(false);
            }
          } else {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            setIsLoggedIn(false);
            setCurrentUser(null);
            setIsAdmin(false);
          }
        } else {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          setIsLoggedIn(false);
          setCurrentUser(null);
          setIsAdmin(false);
        }
      } finally {
        isRefreshing = false;
        setIsLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        await axios.post(`${getBackendUrl()}/api/accounts/logout`,
          { headers: { "Content-Type": "application/json", "Access_Token": accessToken } }
        );
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setIsLoggedIn(false);
      setIsAdmin(false);
      setCurrentUser(null);
      toast.success("로그아웃 되었습니다", { duration: 5000 });
      router.push("/");
    } catch (err: any) {
      console.error("로그아웃 실패:", err.response?.data?.message || err.message);
      toast.error("로그아웃 실패", { duration: 5000 });
    }
  };

  // 회원가입 핸들러
  const handleSignup = async (userData: any) => {
    try {
      const response = await axios.post(`${getBackendUrl()}/api/accounts/register`,
        userData,
        { headers: { "Content-Type": "application/json" } }
      );
      const { id, email, name, role } = response.data.data;
      setCurrentUser({ id, email, name });
      setIsLoggedIn(true);
      setIsAdmin(role === "ADMIN");
      setShowSignupModal(false);
      toast.success("회원가입 및 로그인이 완료되었습니다", { duration: 5000 });
      router.push("/");
    } catch (err: any) {
      console.error("회원가입 실패:", err.response?.data?.message || err.message);
      toast.error("회원가입에 실패했습니다", { duration: 5000 });
    }
  };

  return (
    <>
      <NavigationHeader
        currentPage={currentPage}
        onNavigate={(page) => {
          if (page === "home") {
            router.push("/");
          } else {
            router.push(`/${page}`);
          }
        }}
        isLoggedIn={isLoggedIn}
        isAdmin={isAdmin}
        onLogin={() => {
          console.log("onLogin 호출됨");
          setShowLoginModal(true);
        }}
        onLogout={handleLogout}
      />
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSwitchToSignup={() => {
            setShowLoginModal(false);
            setShowSignupModal(true);
          }}
          onLoginSuccess={async () => {
            setShowLoginModal(false);
            setIsLoggedIn(true);
            try {
              const accessToken = localStorage.getItem("accessToken");
              if (accessToken) {
                const response = await axios.get(`${getBackendUrl()}/api/accounts/me`, {
                  headers: { "Access_Token": accessToken },
                });
                const { id, email, name, role } = response.data.data;
                setCurrentUser({ id, email, name });
                setIsAdmin(role === "ADMIN");
                router.push(role === "ADMIN" ? "/admin" : "/");
              }
            } catch (err) {
              console.error("로그인 후 사용자 정보 조회 실패:", err);
              toast.error("사용자 정보 조회 실패", { duration: 5000 });
            }
          }}
        />
      )}
      {showSignupModal && (
        <SignupModal
          isOpen={showSignupModal}
          onClose={() => setShowSignupModal(false)}
          onSignup={handleSignup}
          onSwitchToLogin={() => {
            setShowSignupModal(false);
            setShowLoginModal(true);
          }}
        />
      )}
      {showPasswordRecovery && (
        <PasswordRecoveryModal
          onClose={() => setShowPasswordRecovery(false)}
          onRecover={(email) => {
            console.log("비밀번호 복구:", email);
            toast.success("비밀번호 복구 이메일이 전송되었습니다", { duration: 5000 });
            setShowPasswordRecovery(false);
          }}
        />
      )}
    </>
  );
}
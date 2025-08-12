"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, Home, RefreshCw, AlertTriangle, HelpCircle, ArrowLeft } from "lucide-react";

function PaymentFailContent() {
  const searchParams = useSearchParams();
  const [errorInfo, setErrorInfo] = useState<any>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const message = searchParams.get("message");
    const orderId = searchParams.get("orderId");

    if (code || message || orderId) {
      setErrorInfo({
        code,
        message,
        orderId,
      });
    }
  }, [searchParams]);

  const getErrorMessage = (code: string) => {
    const errorMessages: { [key: string]: string } = {
      "PAY_PROCESS_CANCELED": "결제가 취소되었습니다.",
      "PAY_PROCESS_ABORTED": "결제가 중단되었습니다.",
      "INVALID_CARD": "유효하지 않은 카드입니다.",
      "INSUFFICIENT_FUNDS": "잔액이 부족합니다.",
      "CARD_EXPIRED": "만료된 카드입니다.",
      "INVALID_PIN": "잘못된 PIN 번호입니다.",
      "CARD_NOT_SUPPORTED": "지원되지 않는 카드입니다.",
      "NETWORK_ERROR": "네트워크 오류가 발생했습니다.",
      "TIMEOUT": "결제 시간이 초과되었습니다.",
    };
    return errorMessages[code] || "결제 중 문제가 발생했습니다.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-28 h-28 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen p-6">
        <div className="max-w-md w-full">
          <Card className="border-0 shadow-2xl bg-white/90 backdrop-blur-sm overflow-hidden">
            {/* 실패 헤더 */}
            <div className="bg-gradient-to-r from-red-400 to-orange-500 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                    <XCircle className="h-12 w-12 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold text-white mb-2">
                  결제 실패
                </CardTitle>
                <p className="text-white/90 text-lg">
                  결제 중 문제가 발생했습니다
                </p>
              </div>
              
              {/* 장식 요소들 */}
              <div className="absolute top-4 left-4">
                <AlertTriangle className="h-6 w-6 text-white/60 animate-pulse" />
              </div>
              <div className="absolute top-4 right-4">
                <HelpCircle className="h-6 w-6 text-white/60 animate-pulse animation-delay-1000" />
              </div>
              <div className="absolute bottom-4 left-4">
                <XCircle className="h-6 w-6 text-white/60 animate-pulse animation-delay-2000" />
              </div>
              <div className="absolute bottom-4 right-4">
                <AlertTriangle className="h-6 w-6 text-white/60 animate-pulse animation-delay-3000" />
              </div>
            </div>

            <CardContent className="p-8">
              {/* 에러 정보 */}
              {errorInfo && (
                <div className="space-y-4 mb-8">
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border border-red-200">
                    <div className="space-y-3">
                      {errorInfo.orderId && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">주문 ID</span>
                          <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                            {errorInfo.orderId}
                          </span>
                        </div>
                      )}
                      {errorInfo.code && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600">에러 코드</span>
                          <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                            {errorInfo.code}
                          </span>
                        </div>
                      )}
                      {errorInfo.message && (
                        <div className="pt-3 border-t border-red-200">
                          <p className="text-sm text-red-700 font-medium">
                            {getErrorMessage(errorInfo.code)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 안내 메시지 */}
              <div className="text-center mb-8">
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-center gap-2 text-orange-700">
                    <HelpCircle className="h-5 w-5" />
                    <span className="font-medium">다시 시도해보세요</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  문제가 지속되면 고객센터로 문의해주세요
                </p>
              </div>

              {/* 액션 버튼들 */}
              <div className="space-y-3">
                <Button 
                  onClick={() => window.location.href = "/"}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Home className="w-5 h-5 mr-2" />
                  홈으로
                </Button>
                <Button 
                  onClick={() => window.history.back()}
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 rounded-xl"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  다시 시도
                </Button>
              </div>

              {/* 도움말 */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">결제 문제 해결 방법</p>
                    <ul className="text-blue-700 space-y-1">
                      <li>• 카드 정보를 다시 확인해주세요</li>
                      <li>• 인터넷 연결을 확인해주세요</li>
                      <li>• 다른 결제 수단을 시도해보세요</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 추가 안내 */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  고객센터: 1588-0000 (평일 09:00-18:00)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-3000 {
          animation-delay: 3s;
        }
      `}</style>
    </div>
  );
}

export default function PaymentFail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentFailContent />
    </Suspense>
  );
} 
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, ShoppingBag, Sparkles, Gift, PartyPopper } from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amount = searchParams.get("amount");

    if (paymentKey && orderId && amount) {
      setPaymentInfo({
        paymentKey,
        orderId,
        amount: parseInt(amount),
      });
    }

    // 성공 애니메이션 시작
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 relative overflow-hidden">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* 성공 애니메이션 */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 2 + 2}s`,
              }}
            >
              <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
            </div>
          ))}
        </div>
      )}

      <div className="relative container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
            {/* 성공 헤더 */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-white/10"></div>
              <div className="relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                    <CheckCircle className="h-12 w-12 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold text-white mb-2">
                  결제 성공!
                </CardTitle>
                <p className="text-white/90 text-lg">
                  주문이 성공적으로 완료되었습니다
                </p>
              </div>
              
              {/* 장식 요소들 */}
              <div className="absolute top-4 left-4">
                <Sparkles className="h-6 w-6 text-white/60 animate-pulse" />
              </div>
              <div className="absolute top-4 right-4">
                <Gift className="h-6 w-6 text-white/60 animate-pulse animation-delay-1000" />
              </div>
              <div className="absolute bottom-4 left-4">
                <PartyPopper className="h-6 w-6 text-white/60 animate-pulse animation-delay-2000" />
              </div>
              <div className="absolute bottom-4 right-4">
                <Sparkles className="h-6 w-6 text-white/60 animate-pulse animation-delay-3000" />
              </div>
            </div>

            <CardContent className="p-8">
              {/* 주문 정보 */}
              {paymentInfo && (
                <div className="space-y-4 mb-8">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">주문 ID</span>
                        <span className="font-mono text-sm bg-gray-200 px-2 py-1 rounded">
                          {paymentInfo.orderId}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">결제 금액</span>
                        <span className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                          {paymentInfo.amount.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 성공 메시지 */}
              <div className="text-center mb-8">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">안전한 결제가 완료되었습니다</span>
                  </div>
                </div>
             
              </div>

              {/* 액션 버튼들 */}
              <div className="space-y-3">
                <Button 
                  onClick={() => window.location.href = "/"}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Home className="w-5 h-5 mr-2" />
                  홈으로
                </Button>
               
              </div>

              {/* 추가 안내 */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  문의사항이 있으시면 고객센터로 연락해주세요
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear infinite;
        }
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
} 
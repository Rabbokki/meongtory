"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, Home, RefreshCw } from "lucide-react";

export default function PaymentFail() {
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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center space-x-2">
              <XCircle className="h-8 w-8 text-red-500" />
              <CardTitle className="text-2xl font-bold text-center">
                결제 실패
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              결제 중 문제가 발생했습니다.
            </p>
            
            {errorInfo && (
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                {errorInfo.orderId && (
                  <p><strong>주문 ID:</strong> {errorInfo.orderId}</p>
                )}
                {errorInfo.code && (
                  <p><strong>에러 코드:</strong> {errorInfo.code}</p>
                )}
                {errorInfo.message && (
                  <p><strong>에러 메시지:</strong> {errorInfo.message}</p>
                )}
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button 
                onClick={() => window.location.href = "/"}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black"
              >
                <Home className="w-4 h-4 mr-2" />
                홈으로
              </Button>
              <Button 
                onClick={() => window.history.back()}
                variant="outline"
                className="flex-1"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                다시 시도
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
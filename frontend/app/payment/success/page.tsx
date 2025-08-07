"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home } from "lucide-react";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState<any>(null);

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
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <CardTitle className="text-2xl font-bold text-center">
                결제 성공!
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              주문이 성공적으로 완료되었습니다.
            </p>
            
            {paymentInfo && (
              <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                <p><strong>주문 ID:</strong> {paymentInfo.orderId}</p>
                <p><strong>결제 금액:</strong> {paymentInfo.amount.toLocaleString()}원</p>
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
                onClick={() => window.location.href = "/store"}
                variant="outline"
                className="flex-1"
              >
                쇼핑 계속하기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
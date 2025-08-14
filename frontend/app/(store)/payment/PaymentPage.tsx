"use client"

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, ShoppingBag } from "lucide-react";

interface PaymentItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface PaymentPageProps {
  items: PaymentItem[];
  onBack: () => void;
  onSuccess: (paymentInfo: any) => void;
  onFail: (error: any) => void;
}

declare global {
  interface Window {
    TossPayments: any;
  }
}

export default function PaymentPage({ items, onBack, onSuccess, onFail }: PaymentPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const orderId = `order_${Date.now()}`;

  useEffect(() => {
    // Toss Payments 스크립트가 로드되었는지 확인
    if (window.TossPayments) {
      console.log("TossPayments 로드됨");
    } else {
      console.log("TossPayments 로딩 중...");
    }
  }, []);

  const handlePayment = async () => {
    if (!window.TossPayments) {
      alert("결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const tossPayments = window.TossPayments("test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq");
      
      await tossPayments.requestPayment(paymentMethod, {
        amount: totalAmount,
        orderId: orderId,
        orderName: items.length === 1 ? items[0].name : `${items[0].name} 외 ${items.length - 1}개`,
        customerName: "고객명",
        customerEmail: "customer@example.com",
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      });
    } catch (error) {
      console.error("결제 요청 실패:", error);
      setIsLoading(false);
      onFail(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <Button 
            onClick={onBack}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로 가기
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                결제 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 주문 상품 목록 */}
              <div>
                <h3 className="font-semibold mb-3">주문 상품</h3>
                <div className="space-y-3">
                  {items.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-gray-600">수량: {item.quantity}개</p>
                        </div>
                      </div>
                      <p className="font-semibold">{(item.price * item.quantity).toLocaleString()}원</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 결제 수단 선택 */}
              <div>
                <h3 className="font-semibold mb-3">결제 수단</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>신용카드</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transfer"
                      checked={paymentMethod === "transfer"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>계좌이체</span>
                  </label>
                </div>
              </div>

              {/* 결제 금액 */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>총 결제 금액</span>
                  <span className="text-2xl text-blue-600">{totalAmount.toLocaleString()}원</span>
                </div>
              </div>

              {/* 결제 버튼 */}
              <Button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
              >
                {isLoading ? "결제 처리 중..." : "결제하기"}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                결제는 Toss Payments를 통해 안전하게 처리됩니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";

declare global {
  interface Window {
    TossPayments: any;
  }
}

interface PaymentItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface PaymentPageProps {
  items: PaymentItem[];
  onBack?: () => void;
  onSuccess?: (paymentInfo: any) => void;
  onFail?: (error: any) => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ 
  items, 
  onBack, 
  onSuccess, 
  onFail 
}) => {
  const [orderId, setOrderId] = useState<string>(`ORDER_${Date.now()}`);
  const [loading, setLoading] = useState<boolean>(false);
  const [sdkLoaded, setSdkLoaded] = useState<boolean>(false);

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const orderName = items.length === 1 
    ? items[0].name 
    : `${items[0].name} 외 ${items.length - 1}개`;

  // SDK 로딩 확인
  useEffect(() => {
    const checkSDK = () => {
      if (window.TossPayments) {
        console.log("토스페이먼츠 SDK 로드됨");
        setSdkLoaded(true);
      } else {
        console.log("토스페이먼츠 SDK 로딩 대기 중...");
        setTimeout(checkSDK, 100);
      }
    };
    checkSDK();
  }, []);

  const handlePayment = async () => {
    console.log("결제 버튼 클릭됨");
    console.log("items:", items);
    console.log("orderId:", orderId);
    console.log("totalAmount:", totalAmount);
    
    if (!items.length || !orderId) {
      alert("결제할 상품과 주문 ID를 확인해주세요.");
      return;
    }

    setLoading(true);

    try {
      console.log("window.TossPayments 확인:", window.TossPayments);
      const { TossPayments } = window;
      if (!TossPayments) {
        alert("토스페이먼츠 SDK가 로드되지 않았습니다.");
        return;
      }

      console.log("TossPayments 인스턴스 생성");
      // 환경 변수에서 클라이언트 키 가져오기
      const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY || "test_ck_4yKeq5bgrp2mdOw6yOYJ3GX0lzW6";
      console.log("클라이언트 키:", clientKey);
      console.log("키 타입:", clientKey.startsWith("test_") ? "테스트 모드" : "실제 운영 모드");
      const tossPayments = new TossPayments(clientKey);

      const paymentData = {
        amount: totalAmount,
        orderId: orderId,
        orderName: orderName,
        customerName: "홍길동",
        customerEmail: "test@test.com",
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      };
      
      console.log("결제 데이터:", paymentData);

      // 결제 요청
      const response = await tossPayments.requestPayment("카드", paymentData);

      if (response.status === "SUCCESS") {
        // 결제 승인 요청
        try {
          console.log("결제 승인 요청 시작");
          const confirmResponse = await axios.post("/api/payments/confirm", {
            paymentKey: response.paymentKey,
            orderId: orderId,
            amount: totalAmount,
            items: items,
          });

          console.log("결제 승인 응답:", confirmResponse.data);

          if (confirmResponse.status === 200) {
            alert("결제가 성공했습니다!");
            console.log("결제 정보:", confirmResponse.data);
            onSuccess?.(confirmResponse.data);
          }
        } catch (error) {
          console.error("결제 승인 실패:", error);
          alert("결제 승인에 실패했습니다.");
          onFail?.(error);
        }
      } else {
        alert(`결제 실패: ${response.message}`);
        onFail?.(response);
      }
    } catch (error) {
      console.error("결제 오류:", error);
      alert("결제 중 오류가 발생했습니다.");
      onFail?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              {onBack && (
                <Button variant="ghost" onClick={onBack} size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  돌아가기
                </Button>
              )}
              <CardTitle className="text-2xl font-bold">
                결제하기
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 주문 상품 목록 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">주문 상품</h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.price.toLocaleString()}원 × {item.quantity}개
                        </p>
                      </div>
                    </div>
                    <p className="font-bold">
                      {(item.price * item.quantity).toLocaleString()}원
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">총 결제 금액</span>
                  <span className="text-2xl font-bold text-yellow-600">
                    {totalAmount.toLocaleString()}원
                  </span>
                </div>
              </div>
            </div>

            {/* 주문 ID 입력 */}
            <div className="space-y-2">
              <Label htmlFor="orderId">주문 ID</Label>
              <Input
                id="orderId"
                type="text"
                placeholder="주문 ID를 입력하세요"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>

            <Button
              onClick={handlePayment}
              disabled={loading || !sdkLoaded}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black"
            >
              {loading ? "결제 처리 중..." : !sdkLoaded ? "SDK 로딩 중..." : "결제하기"}
            </Button>

            <div className="text-sm text-gray-500 text-center">
              <p>실제 결제 시스템입니다.</p>
              <p>결제 시 실제 금액이 청구됩니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage; 
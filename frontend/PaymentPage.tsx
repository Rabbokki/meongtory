"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, ShoppingCart, Shield, Sparkles, Package, CheckCircle } from "lucide-react";

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
  items?: PaymentItem[];
  onBack?: () => void;
  onSuccess?: (paymentInfo: any) => void;
  onFail?: (error: any) => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ 
  items = [], 
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
    : items.length > 1 
      ? `${items[0].name} 외 ${items.length - 1}개`
      : '상품 없음';

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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      {/* 배경 장식 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <CreditCard className="w-8 h-8 text-yellow-600" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                안전한 결제
              </h1>
            </div>
            <p className="text-gray-600 text-lg">토스페이먼츠로 안전하고 간편하게 결제하세요</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* 주문 상품 정보 */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="w-6 h-6 text-yellow-600" />
                    <CardTitle className="text-xl font-bold">주문 상품</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300"
                      >
                        <div className="flex items-center gap-4">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-16 h-16 object-cover rounded-lg shadow-sm"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg flex items-center justify-center">
                              <Package className="w-8 h-8 text-yellow-600" />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-800">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              {item.price.toLocaleString()}원 × {item.quantity}개
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-800">
                            {(item.price * item.quantity).toLocaleString()}원
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* 총 금액 */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-700">총 결제 금액</span>
                      <div className="text-right">
                        <span className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                          {totalAmount.toLocaleString()}원
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 결제 정보 */}
            <div className="lg:col-span-1">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-yellow-600" />
                    <CardTitle className="text-xl font-bold">결제 정보</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* 주문 ID */}
                  <div className="space-y-2">
                    <Label htmlFor="orderId" className="text-sm font-medium text-gray-700">
                      주문 ID
                    </Label>
                    <Input
                      id="orderId"
                      type="text"
                      placeholder="주문 ID를 입력하세요"
                      value={orderId}
                      onChange={(e) => setOrderId(e.target.value)}
                      className="border-gray-300 focus:border-yellow-500 focus:ring-yellow-500"
                    />
                  </div>

                  {/* 결제 버튼 */}
                  <Button
                    onClick={handlePayment}
                    disabled={loading || !sdkLoaded}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        결제 처리 중...
                      </div>
                    ) : !sdkLoaded ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        SDK 로딩 중...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        결제하기
                      </div>
                    )}
                  </Button>

                  {/* 안전 결제 안내 */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-green-800">
                        <p className="font-medium mb-1">안전한 결제</p>
                        <p className="text-green-700">토스페이먼츠의 보안 시스템으로 안전하게 결제됩니다.</p>
                      </div>
                    </div>
                  </div>

                  {/* 뒤로가기 버튼 */}
                  {onBack && (
                    <Button 
                      variant="outline" 
                      onClick={onBack} 
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      돌아가기
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 하단 안내 */}
          <div className="mt-8 text-center">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">
                💳 실제 결제 시스템입니다. 결제 시 실제 금액이 청구됩니다.
              </p>
              <p className="text-xs text-gray-500">
                토스페이먼츠는 한국의 대표적인 결제 서비스입니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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
};

export default PaymentPage; 
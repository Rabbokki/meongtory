"use client"

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CreditCard, ShoppingBag } from "lucide-react";
import axios from 'axios';
import { loadTossPayments } from '@tosspayments/tosspayments-sdk';

const API_BASE_URL = 'http://localhost:8080/api';
const CLIENT_KEY = `test_ck_4yKeq5bgrp2mdOw6yOYJ3GX0lzW6`;
console.log("CLIENT_KEY:", CLIENT_KEY);


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
  interface Window {}
}

export default function PaymentPage({ items, onBack, onSuccess, onFail }: PaymentPageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("CARD");
  const [tossPayments, setTossPayments] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const [orderId, setOrderId] = useState<string>('');

  // 주문 생성
  const createOrder = async (userData: any) => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }

      // 첫 번째 아이템으로 주문 생성 (단일 상품 주문)
      const firstItem = items[0];
      const orderData = {
        accountId: userData.id,
        productId: firstItem.id,
        quantity: firstItem.quantity
      };

      console.log('주문 생성 요청:', orderData);

      const response = await axios.post(`${API_BASE_URL}/orders`, orderData, {
        headers: {
          'Access_Token': accessToken
        }
      });

      console.log('주문 생성 응답:', response.data);
      
      // 백엔드에서 직접 OrderResponseDto를 반환하므로 success 필드가 없음
      const createdOrder = response.data;
      setOrderId(createdOrder.merchantOrderId);
      console.log('주문 ID 설정:', createdOrder.merchantOrderId);
    } catch (error) {
      console.error('주문 생성 오류:', error);
      throw error;
    }
  };

  // 사용자 정보 가져오기
  const fetchUserInfo = async () => {
    try {
      // 메인 웹사이트와 동일한 토큰 저장 방식 사용
      const accessToken = localStorage.getItem('accessToken');
      
      console.log('토큰 확인:', accessToken ? '토큰 존재' : '토큰 없음');

      if (!accessToken) {
        console.error('No access token found. Please login first.');
        console.log('Current page URL:', window.location.href);
        console.log('Available localStorage keys:', Object.keys(localStorage));
        console.log('Available sessionStorage keys:', Object.keys(sessionStorage));
        throw new Error('로그인이 필요합니다.');
      }

      const response = await axios.get(`${API_BASE_URL}/accounts/me`, {
        headers: {
          'Access_Token': accessToken
        }
      });

      console.log('API Response:', response.data);

      // 백엔드에서 ResponseDto.success()로 감싸서 반환
      if (response.data.success) {
        const userData = response.data.data;
        setUserInfo(userData);
        console.log('User info set:', userData);
        
        // 사용자 정보를 가져온 후 주문 생성
        await createOrder(userData);
      } else {
        throw new Error('사용자 정보를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      const err = error as any;
      if (err && err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
      }
      alert('로그인이 필요합니다. 로그인 페이지로 이동합니다.');
      onFail(err);
    }
  };

  useEffect(() => {
    // 사용자 정보 불러오기
    fetchUserInfo();

    // SDK 로드 및 초기화 (공식 패키지 방식)
    (async () => {
      try {
        console.log("Using clientKey:", CLIENT_KEY);
        if (!CLIENT_KEY || CLIENT_KEY.trim().length === 0) {
          console.error('환경변수 NEXT_PUBLIC_TOSS_CLIENT_KEY 가 설정되지 않았습니다. .env.local 에 테스트 클라이언트 키를 설정하고 dev 서버를 재시작하세요.');
          return;
        }
        const tp = await loadTossPayments(CLIENT_KEY);
        let tpNormalized: any = tp as any;
        // 방어: 혹시 함수 형태로 반환되는 경우 초기화 시도
        if (typeof tpNormalized === 'function') {
          try {
            tpNormalized = tpNormalized(CLIENT_KEY);
          } catch (e) {
            console.warn('tossPayments function-like instance init failed:', e);
          }
        }
        if (!tpNormalized || typeof tpNormalized.payment !== 'function') {
          console.error('Invalid TossPayments instance. Shape:', tpNormalized);
          // Fallback: CDN 스크립트 태그로 로드 시도
          await new Promise<void>((resolve, reject) => {
            const existing = document.querySelector('script[src="https://js.tosspayments.com/v2/standard"]');
            if (existing) existing.remove();
            const script = document.createElement('script');
            script.src = 'https://js.tosspayments.com/v2/standard';
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('TossPayments CDN script load failed'));
            document.head.appendChild(script);
          });
          const globalTP: any = (window as any).TossPayments;
          if (typeof globalTP === 'function') {
            const tpFromCdn = globalTP(CLIENT_KEY);
            if (tpFromCdn && typeof tpFromCdn.payment === 'function') {
              console.log('TossPayments loaded via CDN fallback');
              setTossPayments(tpFromCdn);
              return;
            } else {
              console.error('CDN TossPayments invalid:', tpFromCdn);
            }
          } else {
            console.error('Global TossPayments not available after CDN load:', globalTP);
          }
        } else {
          console.log("TossPayments loaded via SDK:", tpNormalized);
          setTossPayments(tpNormalized);
        }
      } catch (error) {
        console.error("TossPayments v2 SDK 로드 실패:", error);
        onFail(error);
      }
    })();
  }, [onFail]);

  // tossPayments와 userInfo가 준비되면 payment 인스턴스를 미리 생성
  useEffect(() => {
    if (!tossPayments || !userInfo) return;
    try {
      const customerKey = `customer_${userInfo.id}`;
      if (typeof tossPayments.payment === 'function') {
        const p = tossPayments.payment({ customerKey });
        if (p && typeof p.requestPayment === 'function') {
          setPayment(p);
          console.log('Payment instance prepared');
        } else {
          console.error('payment instance invalid:', p);
        }
      } else {
        console.error('tossPayments.payment is not a function. keys:', Object.keys(tossPayments || {}));
      }
    } catch (e) {
      console.error('Failed to create payment instance:', e);
    }
  }, [tossPayments, userInfo]);

  const handlePayment = async () => {
    if (!tossPayments) {
      alert("결제 모듈을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (!payment) {
      console.error('Payment instance not ready. tp keys:', Object.keys(tossPayments || {}));
      alert("결제 준비 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (!userInfo) {
      alert("사용자 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    if (!orderId) {
      alert("주문 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem('accessToken');
      
      if (!accessToken) {
        throw new Error('로그인이 필요합니다.');
      }
      
      console.log('결제 요청 정보:', {
        orderId,
        totalAmount,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        }))
      });

      // 결제 요청 전 준비 완료
      console.log("결제 요청 준비 완료");
      
      console.log("결제창 요청 시작...");
      console.log("TossPayments instance:", tossPayments);
      console.log("Payment instance:", payment);
      
      // 필수 파라미터 검증
      if (!orderId || !totalAmount || totalAmount <= 0) {
        throw new Error("결제 금액이나 주문번호가 올바르지 않습니다.");
      }

      // 결제 정보 (개별 연동 v2 최소 파라미터)
      const paymentConfig: any = {
        method: "CARD", // 먼저 카드 결제만 테스트
        amount: {
          currency: "KRW",
          value: totalAmount, // 실제 상품 금액 사용
        },
        orderId: orderId,
        orderName: items.length > 0 ? items[0].name : "상품",
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerEmail: userInfo?.email || "customer123@gmail.com",
        customerName: userInfo?.name || userInfo?.nickname || "고객",
        customerMobilePhone: userInfo?.phoneNumber || "01012341234",
      };

      // 카드 결제 설정 (허용 필드만 사용)
      paymentConfig.card = {
        useEscrow: false,
        useCardPoint: false,
        useAppCardOnly: false,
      };
      
      // v2 API 사용법으로 결제창 요청
      console.log("=== 결제 요청 정보 ===");
      console.log("Payment config:", JSON.stringify(paymentConfig, null, 2));
      console.log("User info:", userInfo);
      console.log("========================");
      
      await payment.requestPayment(paymentConfig);
    } catch (error) {
      console.error("결제 요청 실패:", error);
      setIsLoading(false);
      onFail(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* 헤더 */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            뒤로가기
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">결제하기</h1>
        </div>

        <div className="grid gap-6">
          {/* 주문 상품 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2" />
                주문 상품
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.price.toLocaleString()}원 × {item.quantity}개
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {(item.price * item.quantity).toLocaleString()}원
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 결제 수단 선택 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                결제 수단
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={paymentMethod === "CARD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-blue-600"
                  />
                  <span>신용카드</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="TRANSFER"
                    checked={paymentMethod === "TRANSFER"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-blue-600"
                  />
                  <span>계좌이체</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VIRTUAL_ACCOUNT"
                    checked={paymentMethod === "VIRTUAL_ACCOUNT"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-blue-600"
                  />
                  <span>가상계좌</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* 결제 금액 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>결제 금액</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>상품 금액</span>
                  <span>{totalAmount.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span>배송비</span>
                  <span>0원</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>총 결제 금액</span>
                  <span>{totalAmount.toLocaleString()}원</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 결제 버튼 */}
          <Button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full py-3 text-lg font-medium"
          >
            {isLoading ? "결제 처리 중..." : `${totalAmount.toLocaleString()}원 결제하기`}
          </Button>
        </div>
      </div>
    </div>
  );
}

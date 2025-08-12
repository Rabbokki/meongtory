"use client"

import React from 'react';
import { useSearchParams } from 'next/navigation';
import PaymentPage from "./PaymentPage";

export default function Payment() {
  const searchParams = useSearchParams();
  
  // URL 파라미터에서 결제 정보를 가져오거나 기본값 설정
  const items = [
    {
      id: 1,
      name: "상품명",
      price: 10000,
      quantity: 1,
      image: "/placeholder.svg"
    }
  ];

  const handleBack = () => {
    // 이전 페이지로 돌아가기 (referrer가 있으면 사용, 없으면 장바구니로)
    if (document.referrer && document.referrer.includes(window.location.origin)) {
      window.history.back();
    } else {
      window.location.href = "/store/cart";
    }
  };

  const handleSuccess = (paymentInfo: any) => {
    console.log("결제 성공:", paymentInfo);
    window.location.href = "/payment/success";
  };

  const handleFail = (error: any) => {
    console.log("결제 실패:", error);
    window.location.href = "/payment/fail";
  };

  return (
    <PaymentPage 
      items={items}
      onBack={handleBack}
      onSuccess={handleSuccess}
      onFail={handleFail}
    />
  );
} 
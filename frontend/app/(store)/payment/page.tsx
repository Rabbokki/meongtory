"use client"

import React from 'react';
import { useSearchParams } from 'next/navigation';
import PaymentPage from "./PaymentPage";

export default function Payment() {
  const searchParams = useSearchParams();
  
  // URL 파라미터에서 결제 정보를 가져오거나 기본값 설정
  const orderId = searchParams.get('orderId');
  const productId = searchParams.get('productId');
  const quantity = parseInt(searchParams.get('quantity') || '1');
  const price = parseInt(searchParams.get('price') || '0');
  const productName = searchParams.get('productName') || '상품명';
  const imageUrl = searchParams.get('imageUrl') || '/placeholder.svg';
  
  const items = [
    {
      id: parseInt(productId || '1'),
      name: productName,
      price: price,
      quantity: quantity,
      image: imageUrl
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
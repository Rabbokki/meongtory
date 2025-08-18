'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Home, Receipt } from "lucide-react";
import axios from 'axios';
import { getBackendUrl } from '@/lib/api';

const API_BASE_URL = `${getBackendUrl()}/api`;

interface PaymentInfo {
  paymentKey: string;
  orderId: string;
  amount: number;
  status: string;
  method: string;
  approvedAt: string;
  totalAmount: number;
  receipt?: {
    url: string;
  };
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        const paymentKey = searchParams.get('paymentKey');
        const orderId = searchParams.get('orderId');
        const amount = searchParams.get('amount');

        if (!paymentKey || !orderId || !amount) {
          setError('결제 정보가 올바르지 않습니다.');
          setIsLoading(false);
          return;
        }

        console.log('결제 승인 요청:', { paymentKey, orderId, amount });

        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          throw new Error('인증 토큰이 없습니다.');
        }

        const response = await axios.post(
          `${API_BASE_URL}/confirm`,
          {
            paymentKey,
            orderId,
            amount: parseInt(amount)
          },
          {
            headers: {
              'Access_Token': accessToken,
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }
        );

        console.log('결제 승인 성공:', response.data);
        setPaymentInfo(response.data);
      } catch (error: any) {
        console.error('결제 승인 실패:', error);
        if (axios.isAxiosError(error)) {
          console.error('Axios error details:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data,
            url: error.config?.url,
          });
          setError(error.response?.data?.message || '결제 승인 중 네트워크 오류가 발생했습니다.');
        } else {
          setError('결제 승인 중 오류가 발생했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    confirmPayment();
  }, [searchParams]);

  const handleGoHome = () => {
    router.push('/');
  };

  const handleViewReceipt = () => {
    if (paymentInfo?.receipt?.url) {
      window.open(paymentInfo.receipt.url, '_blank');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">결제를 확인하는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 text-center">결제 오류</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-center mb-6">{error}</p>
            <Button onClick={handleGoHome} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              홈으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-600">결제가 완료되었습니다!</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentInfo && (
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">주문번호</p>
                      <p className="font-medium">{paymentInfo.orderId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">결제수단</p>
                      <p className="font-medium">{paymentInfo.method}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">결제금액</p>
                      <p className="font-medium">{paymentInfo.totalAmount?.toLocaleString()}원</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <Button onClick={handleGoHome} className="flex-1">
                <Home className="h-4 w-4 mr-2" />
                홈으로 돌아가기
              </Button>
              {paymentInfo?.receipt?.url && (
                <Button onClick={handleViewReceipt} variant="outline" className="flex-1">
                  <Receipt className="h-4 w-4 mr-2" />
                  영수증 보기
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩 중...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
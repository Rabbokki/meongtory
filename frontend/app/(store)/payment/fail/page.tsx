"use client"

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function PaymentFailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const code = searchParams.get('code');
  const message = searchParams.get('message');
  const orderId = searchParams.get('orderId');

  const handleGoHome = () => {
    router.push('/');
  };

  const handleRetry = () => {
    router.back();
  };

  const getErrorMessage = (code: string | null) => {
    switch (code) {
      case 'PAY_PROCESS_CANCELED':
        return '결제가 취소되었습니다.';
      case 'PAY_PROCESS_ABORTED':
        return '결제가 중단되었습니다.';
      case 'INVALID_CARD':
        return '유효하지 않은 카드입니다.';
      case 'INSUFFICIENT_BALANCE':
        return '잔액이 부족합니다.';
      case 'CARD_EXPIRED':
        return '만료된 카드입니다.';
      case 'INVALID_PASSWORD':
        return '카드 비밀번호가 올바르지 않습니다.';
      case 'EXCEED_DAILY_LIMIT':
        return '일일 결제 한도를 초과했습니다.';
      case 'EXCEED_MONTHLY_LIMIT':
        return '월 결제 한도를 초과했습니다.';
      case 'INVALID_ACCOUNT':
        return '유효하지 않은 계좌입니다.';
      case 'ACCOUNT_CLOSED':
        return '폐쇄된 계좌입니다.';
      case 'INSUFFICIENT_ACCOUNT_BALANCE':
        return '계좌 잔액이 부족합니다.';
      case 'INVALID_PHONE_NUMBER':
        return '유효하지 않은 휴대폰 번호입니다.';
      case 'INVALID_EMAIL':
        return '유효하지 않은 이메일입니다.';
      case 'INVALID_ORDER_ID':
        return '유효하지 않은 주문번호입니다.';
      case 'DUPLICATE_ORDER_ID':
        return '중복된 주문번호입니다.';
      case 'INVALID_AMOUNT':
        return '유효하지 않은 결제 금액입니다.';
      case 'INVALID_PAYMENT_KEY':
        return '유효하지 않은 결제 키입니다.';
      case 'PAYMENT_NOT_FOUND':
        return '결제 정보를 찾을 수 없습니다.';
      case 'PAYMENT_ALREADY_PROCESSED':
        return '이미 처리된 결제입니다.';
      case 'PAYMENT_EXPIRED':
        return '결제 유효기간이 만료되었습니다.';
      case 'PAYMENT_CANCELED':
        return '결제가 취소되었습니다.';
      case 'PAYMENT_FAILED':
        return '결제에 실패했습니다.';
      case 'PAYMENT_ABORTED':
        return '결제가 중단되었습니다.';
      case 'PAYMENT_TIMEOUT':
        return '결제 시간이 초과되었습니다.';
      case 'PAYMENT_NETWORK_ERROR':
        return '네트워크 오류가 발생했습니다.';
      case 'PAYMENT_SYSTEM_ERROR':
        return '시스템 오류가 발생했습니다.';
      case 'PAYMENT_UNKNOWN_ERROR':
        return '알 수 없는 오류가 발생했습니다.';
      default:
        return message || '결제 중 오류가 발생했습니다.';
    }
  };

  const getErrorDescription = (code: string | null) => {
    switch (code) {
      case 'PAY_PROCESS_CANCELED':
        return '사용자가 결제를 취소했습니다. 다시 시도해주세요.';
      case 'PAY_PROCESS_ABORTED':
        return '결제 과정이 중단되었습니다. 다시 시도해주세요.';
      case 'INVALID_CARD':
        return '카드 정보를 다시 확인해주세요.';
      case 'INSUFFICIENT_BALANCE':
        return '카드 잔액을 확인하고 다시 시도해주세요.';
      case 'CARD_EXPIRED':
        return '유효한 카드로 다시 시도해주세요.';
      case 'INVALID_PASSWORD':
        return '카드 비밀번호를 다시 입력해주세요.';
      case 'EXCEED_DAILY_LIMIT':
      case 'EXCEED_MONTHLY_LIMIT':
        return '결제 한도를 확인하고 다시 시도해주세요.';
      case 'INVALID_ACCOUNT':
      case 'ACCOUNT_CLOSED':
      case 'INSUFFICIENT_ACCOUNT_BALANCE':
        return '계좌 정보를 확인하고 다시 시도해주세요.';
      case 'INVALID_PHONE_NUMBER':
        return '휴대폰 번호를 다시 확인해주세요.';
      case 'INVALID_EMAIL':
        return '이메일 주소를 다시 확인해주세요.';
      case 'INVALID_ORDER_ID':
      case 'DUPLICATE_ORDER_ID':
        return '주문 정보를 다시 확인해주세요.';
      case 'INVALID_AMOUNT':
        return '결제 금액을 다시 확인해주세요.';
      case 'PAYMENT_EXPIRED':
        return '결제 시간이 만료되었습니다. 다시 시도해주세요.';
      case 'PAYMENT_TIMEOUT':
        return '결제 시간이 초과되었습니다. 다시 시도해주세요.';
      case 'PAYMENT_NETWORK_ERROR':
        return '네트워크 연결을 확인하고 다시 시도해주세요.';
      case 'PAYMENT_SYSTEM_ERROR':
        return '시스템 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      default:
        return '잠시 후 다시 시도해주세요. 문제가 지속되면 고객센터로 문의해주세요.';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-md w-full px-4">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <AlertTriangle className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-2xl text-red-600">결제 실패</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 font-medium mb-2">
                  {getErrorMessage(code)}
                </p>
                <p className="text-sm text-red-600">
                  {getErrorDescription(code)}
                </p>
              </div>

              {orderId && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">주문번호</p>
                  <p className="font-mono text-sm">{orderId}</p>
                </div>
              )}

              {code && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500 mb-1">오류 코드</p>
                  <p className="font-mono text-sm">{code}</p>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button onClick={handleRetry} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                다시 시도
              </Button>
              <Button onClick={handleGoHome} variant="outline" className="flex-1">
                <Home className="h-4 w-4 mr-2" />
                홈으로
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                문의사항이 있으시면 고객센터로 연락해주세요
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
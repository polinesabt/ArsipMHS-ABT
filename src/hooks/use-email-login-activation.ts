import { useCallback, useState } from 'react';
import {
  requestEmailLoginVerification,
  verifyEmailLogin,
  verifyEmailLoginToken,
  type EmailLoginRequestPayload,
  type EmailLoginRequestResponse,
  type EmailLoginVerifyResponse,
} from '@/services/api-auth.service';
import type { ApiResponse } from '@/lib/api-client';

export function useEmailLoginActivation() {
  const [isRequesting, setIsRequesting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const requestVerification = useCallback(
    async (payload: EmailLoginRequestPayload): Promise<ApiResponse<EmailLoginRequestResponse>> => {
      setIsRequesting(true);
      try {
        return await requestEmailLoginVerification(payload);
      } finally {
        setIsRequesting(false);
      }
    },
    []
  );

  const verifyToken = useCallback(
    async (token: string): Promise<ApiResponse<EmailLoginVerifyResponse>> => {
      setIsVerifying(true);
      try {
        return await verifyEmailLoginToken(token);
      } finally {
        setIsVerifying(false);
      }
    },
    []
  );

  const verifyWithOtp = useCallback(
    async (otp: string): Promise<ApiResponse<EmailLoginVerifyResponse>> => {
      setIsVerifying(true);
      try {
        return await verifyEmailLogin({ otp: otp.trim() });
      } finally {
        setIsVerifying(false);
      }
    },
    []
  );

  return {
    isRequesting,
    isVerifying,
    requestVerification,
    verifyToken,
    verifyWithOtp,
  };
}


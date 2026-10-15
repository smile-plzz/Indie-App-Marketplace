import type { Currency } from "../types";

export interface CreateSessionParams {
  orderId: string;
  orderReference: string;
  customerEmail: string;
  productTitle: string;
  amount: number; // In lowest currency unit (e.g. Poisha or Cents)
  currency: Currency;
  returnUrl: string;
  cancelUrl: string;
  webhookUrl: string;
}

export interface PaymentSessionResult {
  gateway: string;
  sessionId: string;
  redirectUrl: string;
  gatewayReference?: string;
  metadata?: Record<string, unknown>;
}

export interface VerifyPaymentParams {
  orderId: string;
  orderReference: string;
  queryOnly?: boolean;
  expectedAmount: number;
  expectedCurrency: Currency;
  gatewayReference?: string;
  payload?: Record<string, unknown>;
}

export interface PaymentVerificationResult {
  success: boolean;
  gateway: string;
  gatewayReference: string;
  amount: number;
  currency: Currency;
  paidAt?: string;
  failureReason?: string;
  rawResponse?: Record<string, unknown>;
}

export interface RefundParams {
  orderId: string;
  gatewayReference: string;
  amount: number;
  currency: Currency;
  reason?: string;
}

export interface RefundResult {
  success: boolean;
  refundReference?: string;
  failureReason?: string;
}

export interface PaymentGatewayAdapter {
  readonly name: string;
  createSession(params: CreateSessionParams): Promise<PaymentSessionResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<PaymentVerificationResult>;
  refund(params: RefundParams): Promise<RefundResult>;
}

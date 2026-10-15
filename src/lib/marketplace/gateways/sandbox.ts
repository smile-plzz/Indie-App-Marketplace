import type { PaymentGatewayAdapter, CreateSessionParams, PaymentSessionResult, VerifyPaymentParams, PaymentVerificationResult, RefundParams, RefundResult, } from "./types";
export class SandboxGateway implements PaymentGatewayAdapter {
    readonly name = "sandbox";
    private assertEnabled() {
        if (process.env.NODE_ENV === "production" && process.env.ALLOW_SANDBOX_PAYMENTS !== "true")
            throw new Error("Sandbox payments are disabled in production");
    }
    async createSession(params: CreateSessionParams): Promise<PaymentSessionResult> {
        this.assertEnabled();
        const sessionId = `sbx_sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const gatewayRef = `sbx_txn_${Date.now()}`;
        // Direct user to interactive sandbox checkout simulator
        const access = new URL(params.returnUrl).searchParams.get("access") || "";
        const redirectUrl = `/store/sandbox-checkout?orderId=${encodeURIComponent(params.orderId)}&sessionId=${encodeURIComponent(sessionId)}&ref=${encodeURIComponent(gatewayRef)}&access=${encodeURIComponent(access)}`;
        return {
            gateway: this.name,
            sessionId,
            redirectUrl,
            gatewayReference: gatewayRef,
            metadata: {
                amount: params.amount,
                currency: params.currency,
                orderReference: params.orderReference,
            },
        };
    }
    async verifyPayment(params: VerifyPaymentParams): Promise<PaymentVerificationResult> {
        this.assertEnabled();
        // In sandbox, check if simulated failure was requested via payload
        if (params.payload?.simulateFailure === true || params.payload?.status === "failed") {
            return {
                success: false,
                gateway: this.name,
                gatewayReference: (params.gatewayReference || params.payload?.txnId || "sbx_failed") as string,
                amount: params.expectedAmount,
                currency: params.expectedCurrency,
                failureReason: "Simulated sandbox payment failure",
                rawResponse: params.payload,
            };
        }
        // Verify amount and currency
        if (params.payload?.amount !== undefined) {
            const providedAmount = Number(params.payload.amount);
            if (providedAmount !== params.expectedAmount) {
                return {
                    success: false,
                    gateway: this.name,
                    gatewayReference: (params.gatewayReference || "sbx_mismatch") as string,
                    amount: providedAmount,
                    currency: params.expectedCurrency,
                    failureReason: `Amount mismatch: expected ${params.expectedAmount}, got ${providedAmount}`,
                    rawResponse: params.payload,
                };
            }
        }
        if (params.payload?.currency !== undefined && params.payload.currency !== params.expectedCurrency) {
            return {
                success: false,
                gateway: this.name,
                gatewayReference: (params.gatewayReference || "sbx_currency_mismatch") as string,
                amount: params.expectedAmount,
                currency: (params.payload.currency as any) || params.expectedCurrency,
                failureReason: `Currency mismatch: expected ${params.expectedCurrency}, got ${params.payload.currency}`,
                rawResponse: params.payload,
            };
        }
        const gatewayReference = params.gatewayReference ||
            (params.payload?.txnId as string) ||
            `sbx_verified_${Date.now()}`;
        return {
            success: true,
            gateway: this.name,
            gatewayReference,
            amount: params.expectedAmount,
            currency: params.expectedCurrency,
            paidAt: new Date().toISOString(),
            rawResponse: {
                status: "Completed",
                gatewayReference,
                verifiedAt: new Date().toISOString(),
            },
        };
    }
    async refund(_params: RefundParams): Promise<RefundResult> {
        return {
            success: true,
            refundReference: `sbx_ref_${Date.now()}`,
        };
    }
}

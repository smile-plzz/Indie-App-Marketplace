import type { PaymentGatewayAdapter, CreateSessionParams, PaymentSessionResult, VerifyPaymentParams, PaymentVerificationResult, RefundParams, RefundResult, } from "./types";
interface SSLCommerzConfig {
    storeId: string;
    storePasswd: string;
    isSandbox: boolean;
}
export class SSLCommerzGateway implements PaymentGatewayAdapter {
    readonly name = "sslcommerz";
    private config: SSLCommerzConfig;
    constructor(config?: Partial<SSLCommerzConfig>) {
        this.config = {
            storeId: config?.storeId || process.env.SSLCOMMERZ_STORE_ID || "",
            storePasswd: config?.storePasswd || process.env.SSLCOMMERZ_STORE_PASSWD || "",
            isSandbox: config?.isSandbox ?? (process.env.SSLCOMMERZ_IS_SANDBOX !== "false"),
        };
    }
    private isConfigured(): boolean {
        return Boolean(this.config.storeId && this.config.storePasswd);
    }
    private getBaseUrl(): string {
        return this.config.isSandbox
            ? "https://sandbox.sslcommerz.com"
            : "https://securepay.sslcommerz.com";
    }
    async createSession(params: CreateSessionParams): Promise<PaymentSessionResult> {
        if (!this.isConfigured()) {
            throw new Error("sslcommerz payment gateway is not configured");
        }
        const callbackUrl = new URL("/api/payments/sslcommerz/callback", params.returnUrl);
        callbackUrl.searchParams.set("orderId", params.orderId);
        callbackUrl.searchParams.set("access", new URL(params.returnUrl).searchParams.get("access") || "");
        const amountDecimal = (params.amount / 100).toFixed(2);
        const body = new URLSearchParams({
            store_id: this.config.storeId,
            store_passwd: this.config.storePasswd,
            total_amount: amountDecimal,
            currency: params.currency,
            tran_id: params.orderReference,
            success_url: callbackUrl.toString(),
            fail_url: callbackUrl.toString(),
            cancel_url: callbackUrl.toString(),
            ipn_url: params.webhookUrl,
            cus_name: "Customer",
            cus_email: params.customerEmail,
            cus_add1: "Dhaka",
            cus_city: "Dhaka",
            cus_country: "Bangladesh",
            cus_phone: "01700000000",
            shipping_method: "NO",
            product_name: params.productTitle,
            product_category: "Digital Software",
            product_profile: "non-physical-goods",
        });
        const res = await fetch(`${this.getBaseUrl()}/gwprocess/v4/api.php`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: body.toString(),
        });
        const data = (await res.json()) as {
            status?: string;
            failedreason?: string;
            sessionkey?: string;
            GatewayPageURL?: string;
        };
        if (data.status !== "SUCCESS" || !data.GatewayPageURL) {
            throw new Error(`SSLCommerz session creation failed: ${data.failedreason || "unknown error"}`);
        }
        return {
            gateway: this.name,
            sessionId: data.sessionkey || params.orderReference,
            redirectUrl: data.GatewayPageURL,
            gatewayReference: data.sessionkey,
        };
    }
    async verifyPayment(params: VerifyPaymentParams): Promise<PaymentVerificationResult> {
        if (!this.isConfigured()) {
            throw new Error("sslcommerz payment gateway is not configured");
        }
        let valId = (params.payload?.val_id || params.gatewayReference) as string;
        if (params.queryOnly) {
            const query = new URLSearchParams({ tran_id: params.orderReference, store_id: this.config.storeId, store_passwd: this.config.storePasswd, format: "json" });
            const response = await fetch(`${this.getBaseUrl()}/validator/api/merchantTransIDvalidationAPI.php?${query}`);
            if (!response.ok) throw new Error("SSLCommerz transaction query unavailable");
            const result = await response.json() as { element?: { val_id?: string; tran_id?: string; status?: string }[] };
            const transaction = result.element?.find(item => item.tran_id === params.orderReference && (item.status === "VALID" || item.status === "VALIDATED"));
            valId = transaction?.val_id || "";
        }
        if (!valId) {
            return {
                success: false,
                gateway: this.name,
                gatewayReference: "unknown",
                amount: params.expectedAmount,
                currency: params.expectedCurrency,
                failureReason: "val_id missing for SSLCommerz verification",
            };
        }
        try {
            const queryUrl = `${this.getBaseUrl()}/validator/api/validationserverAPI.php?val_id=${encodeURIComponent(valId)}&store_id=${encodeURIComponent(this.config.storeId)}&store_passwd=${encodeURIComponent(this.config.storePasswd)}&format=json`;
            const res = await fetch(queryUrl);
            const data = (await res.json()) as {
                status?: string;
                tran_id?: string;
                amount?: string;
                currency?: string;
                bank_tran_id?: string;
                error?: string;
            };
            if (data.status === "VALID" || data.status === "VALIDATED") {
                const verifiedAmount = Math.round(parseFloat(data.amount || "0") * 100);
                if (data.tran_id !== params.orderReference) {
                    return { success: false, gateway: this.name, gatewayReference: data.bank_tran_id || valId, amount: verifiedAmount, currency: params.expectedCurrency, failureReason: "Payment reference does not match order", rawResponse: data };
                }
                if (verifiedAmount !== params.expectedAmount) {
                    return {
                        success: false,
                        gateway: this.name,
                        gatewayReference: data.bank_tran_id || valId,
                        amount: verifiedAmount,
                        currency: (data.currency as any) || params.expectedCurrency,
                        failureReason: `Amount mismatch: expected ${params.expectedAmount}, received ${verifiedAmount}`,
                        rawResponse: data as any,
                    };
                }
                if (data.currency !== params.expectedCurrency) {
                    return {
                        success: false,
                        gateway: this.name,
                        gatewayReference: data.bank_tran_id || valId,
                        amount: verifiedAmount,
                        currency: data.currency as any,
                        failureReason: `Currency mismatch: expected ${params.expectedCurrency}, received ${data.currency}`,
                        rawResponse: data as any,
                    };
                }
                return {
                    success: true,
                    gateway: this.name,
                    gatewayReference: data.bank_tran_id || valId,
                    amount: verifiedAmount,
                    currency: params.expectedCurrency,
                    paidAt: new Date().toISOString(),
                    rawResponse: data as any,
                };
            }
            return {
                success: false,
                gateway: this.name,
                gatewayReference: valId,
                amount: params.expectedAmount,
                currency: params.expectedCurrency,
                failureReason: data.error || `SSLCommerz status is ${data.status}`,
                rawResponse: data as any,
            };
        }
        catch (err: any) {
            return {
                success: false,
                gateway: this.name,
                gatewayReference: valId,
                amount: params.expectedAmount,
                currency: params.expectedCurrency,
                failureReason: err?.message || "SSLCommerz verification network error",
            };
        }
    }
    async refund(params: RefundParams): Promise<RefundResult> {
        if (!this.isConfigured()) {
            throw new Error("sslcommerz payment gateway is not configured");
        }
        // SSLCommerz merchant refund initiation
        try {
            const amountDecimal = (params.amount / 100).toFixed(2);
            const url = `${this.getBaseUrl()}/validator/api/merchantTransIDvalidationAPI.php?refund_amount=${encodeURIComponent(amountDecimal)}&refund_remarks=${encodeURIComponent(params.reason || "Customer refund")}&bank_tran_id=${encodeURIComponent(params.gatewayReference)}&store_id=${encodeURIComponent(this.config.storeId)}&store_passwd=${encodeURIComponent(this.config.storePasswd)}&format=json`;
            const res = await fetch(url);
            const data = (await res.json()) as {
                status?: string;
                refund_ref_id?: string;
                errorReason?: string;
            };
            if (data.status === "success" || data.refund_ref_id) {
                return {
                    success: true,
                    refundReference: data.refund_ref_id,
                };
            }
            return {
                success: false,
                failureReason: data.errorReason || "SSLCommerz refund declined",
            };
        }
        catch (err: any) {
            return {
                success: false,
                failureReason: err?.message || "SSLCommerz refund network error",
            };
        }
    }
}

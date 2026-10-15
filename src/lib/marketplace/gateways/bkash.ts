import { getGatewaySessionReference } from "../db";
import type { PaymentGatewayAdapter, CreateSessionParams, PaymentSessionResult, VerifyPaymentParams, PaymentVerificationResult, RefundParams, RefundResult, } from "./types";
interface BKashConfig {
    appKey: string;
    appSecret: string;
    username: string;
    password: string;
    baseUrl: string;
}
export class BKashGateway implements PaymentGatewayAdapter {
    readonly name = "bkash";
    private config: BKashConfig;
    constructor(config?: Partial<BKashConfig>) {
        this.config = {
            appKey: config?.appKey || process.env.BKASH_APP_KEY || "",
            appSecret: config?.appSecret || process.env.BKASH_APP_SECRET || "",
            username: config?.username || process.env.BKASH_USERNAME || "",
            password: config?.password || process.env.BKASH_PASSWORD || "",
            baseUrl: config?.baseUrl ||
                process.env.BKASH_BASE_URL ||
                "https://tokenized.sandbox.bka.sh/v1.2.0-beta",
        };
    }
    private isConfigured(): boolean {
        return Boolean(this.config.appKey &&
            this.config.appSecret &&
            this.config.username &&
            this.config.password);
    }
    private async getAuthToken(): Promise<string> {
        const res = await fetch(`${this.config.baseUrl}/tokenized/checkout/token/grant`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                username: this.config.username,
                password: this.config.password,
            },
            body: JSON.stringify({
                app_key: this.config.appKey,
                app_secret: this.config.appSecret,
            }),
        });
        if (!res.ok) {
            throw new Error(`bKash auth failed: HTTP ${res.status}`);
        }
        const data = (await res.json()) as {
            id_token?: string;
            statusMessage?: string;
        };
        if (!data.id_token) {
            throw new Error(`bKash auth token missing: ${data.statusMessage || "unknown error"}`);
        }
        return data.id_token;
    }
    async createSession(params: CreateSessionParams): Promise<PaymentSessionResult> {
        if (!this.isConfigured()) {
            throw new Error("bkash payment gateway is not configured");
        }
        if (params.currency !== "BDT")
            throw new Error("bKash supports BDT checkout only");
        const token = await this.getAuthToken();
        const callbackUrl = new URL("/api/payments/bkash/callback", params.returnUrl);
        callbackUrl.searchParams.set("orderId", params.orderId);
        callbackUrl.searchParams.set("access", new URL(params.returnUrl).searchParams.get("access") || "");
        const amountInBDT = (params.amount / 100).toFixed(2);
        const res = await fetch(`${this.config.baseUrl}/tokenized/checkout/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: token,
                "X-APP-Key": this.config.appKey,
            },
            body: JSON.stringify({
                mode: "0011",
                payerReference: params.customerEmail,
                callbackURL: callbackUrl.toString(),
                amount: amountInBDT,
                currency: "BDT",
                intent: "sale",
                merchantInvoiceNumber: params.orderReference,
            }),
        });
        const data = (await res.json()) as {
            paymentID?: string;
            bkashURL?: string;
            statusMessage?: string;
            statusCode?: string;
        };
        if (!data.paymentID || !data.bkashURL) {
            throw new Error(`bKash create payment failed: ${data.statusMessage || data.statusCode}`);
        }
        return {
            gateway: this.name,
            sessionId: data.paymentID,
            redirectUrl: data.bkashURL,
            gatewayReference: data.paymentID,
        };
    }
    async verifyPayment(params: VerifyPaymentParams): Promise<PaymentVerificationResult> {
        if (!this.isConfigured()) {
            throw new Error("bkash payment gateway is not configured");
        }
        const paymentID = params.gatewayReference || (params.payload?.paymentID as string);
        if (!paymentID) {
            return {
                success: false,
                gateway: this.name,
                gatewayReference: "unknown",
                amount: params.expectedAmount,
                currency: "BDT",
                failureReason: "Payment ID missing for bKash verification",
            };
        }
        try {
            const token = await this.getAuthToken();
            // Execute or query status
            const res = await fetch(`${this.config.baseUrl}/tokenized/checkout/${params.queryOnly ? "payment/status" : "execute"}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "X-APP-Key": this.config.appKey,
                },
                body: JSON.stringify({ paymentID }),
            });
            let data = (await res.json()) as {
                transactionStatus?: string;
                trxID?: string;
                amount?: string;
                currency?: string;
                statusMessage?: string;
                paymentID?: string;
                merchantInvoiceNumber?: string;
            };
            if (!params.queryOnly && data.transactionStatus !== "Completed") {
                const query = await fetch(`${this.config.baseUrl}/tokenized/checkout/payment/status`, {
                    method: "POST", headers: { "Content-Type": "application/json", Authorization: token, "X-APP-Key": this.config.appKey },
                    body: JSON.stringify({ paymentID }),
                });
                if (query.ok) data = await query.json();
            }
            if (data.transactionStatus === "Completed" && data.trxID) {
                const verifiedAmountPoisha = Math.round(parseFloat(data.amount || "0") * 100);
                if (data.merchantInvoiceNumber !== params.orderReference || data.paymentID !== paymentID || data.currency !== params.expectedCurrency || params.expectedCurrency !== "BDT") {
                    return { success: false, gateway: this.name, gatewayReference: data.trxID, amount: verifiedAmountPoisha, currency: params.expectedCurrency, failureReason: "Payment identity or currency does not match order", rawResponse: data };
                }
                if (verifiedAmountPoisha !== params.expectedAmount) {
                    return {
                        success: false,
                        gateway: this.name,
                        gatewayReference: data.trxID,
                        amount: verifiedAmountPoisha,
                        currency: "BDT",
                        failureReason: `Amount mismatch: expected ${params.expectedAmount}, received ${verifiedAmountPoisha}`,
                        rawResponse: data as any,
                    };
                }
                return {
                    success: true,
                    gateway: this.name,
                    gatewayReference: data.trxID,
                    amount: verifiedAmountPoisha,
                    currency: "BDT",
                    paidAt: new Date().toISOString(),
                    rawResponse: data as any,
                };
            }
            return {
                success: false,
                gateway: this.name,
                gatewayReference: paymentID,
                amount: params.expectedAmount,
                currency: "BDT",
                failureReason: data.statusMessage || `bKash status is ${data.transactionStatus}`,
                rawResponse: data as any,
            };
        }
        catch (err: any) {
            return {
                success: false,
                gateway: this.name,
                gatewayReference: paymentID,
                amount: params.expectedAmount,
                currency: "BDT",
                failureReason: err?.message || "bKash verification network error",
            };
        }
    }
    async refund(params: RefundParams): Promise<RefundResult> {
        if (!this.isConfigured()) {
            throw new Error("bkash payment gateway is not configured");
        }
        try {
            const token = await this.getAuthToken();
            const paymentID = await getGatewaySessionReference(params.orderId);
            if (!paymentID) return { success: false, failureReason: "Original payment session is unavailable; refund through the merchant dashboard" };
            const amountBDT = (params.amount / 100).toFixed(2);
            const res = await fetch(`${this.config.baseUrl}/tokenized/checkout/payment/refund`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: token,
                    "X-APP-Key": this.config.appKey,
                },
                body: JSON.stringify({
                    paymentID,
                    amount: amountBDT,
                    trxID: params.gatewayReference,
                    sku: params.orderId,
                    reason: params.reason || "Customer refund request",
                }),
            });
            const data = (await res.json()) as {
                refundTrxID?: string;
                statusMessage?: string;
            };
            if (data.refundTrxID) {
                return {
                    success: true,
                    refundReference: data.refundTrxID,
                };
            }
            return {
                success: false,
                failureReason: data.statusMessage || "bKash refund request rejected",
            };
        }
        catch (err: any) {
            return {
                success: false,
                failureReason: err?.message || "bKash refund network error",
            };
        }
    }
}

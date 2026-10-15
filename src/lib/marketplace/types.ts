export type OrderStatus = "pending" | "paid" | "failed" | "refunded";
export type Currency = "BDT" | "USD";
export interface Order {
    id: string;
    reference: string;
    customerEmail: string;
    productId: string;
    productName: string;
    releaseVersion: string;
    amount: number; // Smallest unit: Poisha for BDT, Cents for USD
    currency: Currency;
    gateway: string;
    gatewayReference?: string;
    status: OrderStatus;
    createdAt: string;
    paidAt?: string;
    refundedAt?: string;
}
export interface Download {
    id: string;
    orderId: string;
    tokenHash: string; // SHA-256 hash of plaintext token
    expiresAt: string;
    downloadCount: number;
    maxDownloads: number;
    lastUsedAt?: string;
}
export interface Refund {
    id: string;
    orderId: string;
    amount: number;
    currency: Currency;
    reason?: string;
    createdAt: string;
}
export interface WebhookEvent {
    id: string;
    gateway: string;
    eventId: string;
    payload: string;
    processedAt: string;
}
export interface ProductFeature {
    title: string;
    description: string;
}
export interface ProductFaq {
    question: string;
    answer: string;
}
export interface MarketplaceProduct {
    id: string;
    slug: string;
    title: string;
    tagline: string;
    shot?: {
        url: string;
        alt: string;
        assetId?: string;
    } | null;
    summary: string;
    description: string;
    category: string;
    priceBDT: number; // e.g. 35000 = 350 BDT
    priceUSD: number; // e.g. 400 = $4.00 USD
    status: "draft" | "published" | "archived";
    featured: boolean;
    repoUrl: string;
    license: string;
    minOS: string;
    systemRequirements: string[];
    features: ProductFeature[];
    faq: ProductFaq[];
    currentVersion: string;
    installerFileKey: string;
    sha256Checksum: string;
    installerSize?: string;
    releaseDate: string;
    changelog: string[];
}

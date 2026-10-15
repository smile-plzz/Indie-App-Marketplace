import { adminReadClient } from "@/lib/sanity";
import type { MarketplaceProduct } from "./types";
export type LicenseReview = { licenseType: string; notes: string; licenseApproved: boolean; dependencyReviewCompleted: boolean; contentLegalityChecked: boolean; safetyReviewCompleted: boolean; trademarkReviewCompleted: boolean; gplComplianceChecked: boolean; reviewedAt?: string };
export type AdminProduct = Omit<MarketplaceProduct, "currentVersion" | "installerFileKey" | "sha256Checksum" | "releaseDate" | "changelog"> & {review?: LicenseReview | null};
export async function adminProducts(): Promise<AdminProduct[]> {
    const client = adminReadClient();
    if (!client)
        return [];
    return client.fetch<AdminProduct[]>(`*[_type == "product" && !(_id in path("drafts.**"))] | order(title asc){"id":_id,"slug":slug.current,title,tagline,summary,description,category,priceBDT,priceUSD,status,featured,repoUrl,license,minOS,systemRequirements,features,faq,"review":*[_type=="licenseRecord" && product._ref==^._id && !(_id in path("drafts.**"))] | order(reviewedAt desc, _updatedAt desc, _id asc)[0]{licenseType,notes,licenseApproved,dependencyReviewCompleted,contentLegalityChecked,safetyReviewCompleted,trademarkReviewCompleted,gplComplianceChecked,reviewedAt},shot{"url":asset->url,alt,"assetId":asset->_id}}`, {}, { cache: "no-store" });
}

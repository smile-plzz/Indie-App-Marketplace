import { publishedReadClient } from "@/lib/sanity";
import type { MarketplaceProduct } from "./types";
const client = publishedReadClient();
// This sample exercises checkout locally. It is never a production listing.
export const BUILTIN_PRODUCTS: MarketplaceProduct[] = [{
        id: "prod_localflix", slug: "localflix", title: "Demo app", tagline: "Try the sandbox purchase flow.",
        summary: "Sample listing for testing. No real installer is offered.",
        description: "This demo lets you try checkout without spending money. Product features, prices and release information are examples only.",
        category: "Developer Tools", priceBDT: 45000, priceUSD: 450, status: "published", featured: true,
        repoUrl: "https://github.com/smile-plzz/Indie-App-Marketplace", license: "Not reviewed",
        minOS: "Demo only", systemRequirements: ["No installation available"], features: [],
        faq: [{ question: "Is this a real product?", answer: "No. This is a sandbox listing for testing the store." }],
        currentVersion: "demo", installerFileKey: "releases/demo/sandbox-download.txt", sha256Checksum: "cb1be3eeacbec042dfb7bd5f2062bbcb51c68387126a1a5ddef779a55fb2811e", releaseDate: "", changelog: [],
    }];
const catalogQuery = `*[_type == "product" && status == "published" && !(_id in path("drafts.**"))] {
 "id": _id, "slug": slug.current, title, tagline, summary, description, category,
 priceBDT, priceUSD, status, featured, repoUrl, license, minOS, systemRequirements, features, faq,
 shot {"url": asset->url, alt, "assetId": asset->_id},
 "review": *[_type == "licenseRecord" && product._ref == ^._id && !(_id in path("drafts.**"))] | order(reviewedAt desc, _updatedAt desc, _id asc)[0] {
 "approved": dependencyReviewCompleted == true && contentLegalityChecked == true && licenseApproved == true && safetyReviewCompleted == true && trademarkReviewCompleted == true && (!(licenseType match "*GPL*") || gplComplianceChecked == true) && defined(reviewedAt)
 },
 "release": *[_type == "release" && product._ref == ^._id && isSigned == true && malwareScanPassed == true && !(_id in path("drafts.**"))] | order(releaseDate desc, _createdAt desc)[0] {
 version, installerFileKey, sha256Checksum, installerSize, releaseDate, changelog
 }
}[review.approved == true]`;
export async function getAllProducts(): Promise<MarketplaceProduct[]> {
    if (!client)
        return process.env.NODE_ENV === "production" ? [] : BUILTIN_PRODUCTS;
    const documents = await client.withConfig({ useCdn: false }).fetch<Array<Omit<MarketplaceProduct, "currentVersion" | "installerFileKey" | "sha256Checksum" | "releaseDate" | "changelog"> & {
        release: {
            version: string;
            installerFileKey: string;
            sha256Checksum: string;
            installerSize?: string;
            releaseDate: string;
            changelog?: string | string[];
        } | null;
    }>>(catalogQuery, {}, { next: { revalidate: 60, tags: ["content"] } });
    return documents.flatMap(({ release, ...product }) => {
        if (!release || !Number.isSafeInteger(product.priceBDT) || product.priceBDT < 0 || !Number.isSafeInteger(product.priceUSD) || product.priceUSD < 0 || !/^[a-f0-9]{64}$/i.test(release.sha256Checksum) || !release.installerFileKey || !product.slug)
            return [];
        return [{ ...product, summary: product.summary || "", description: product.description || "", features: product.features || [], faq: product.faq || [], systemRequirements: product.systemRequirements || [], currentVersion: release.version,
                installerFileKey: release.installerFileKey, sha256Checksum: release.sha256Checksum, installerSize: release.installerSize,
                releaseDate: release.releaseDate, changelog: Array.isArray(release.changelog) ? release.changelog : (release.changelog || "").split("\n").filter(Boolean) }];
    });
}
export async function getProductBySlug(slug: string): Promise<MarketplaceProduct | null> {
    return (await getAllProducts()).find((product) => product.slug === slug) || null;
}
export function formatPrice(amount: number, currency: "BDT" | "USD"): string {
    return currency === "BDT" ? `BDT ${(amount / 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}` : `$${(amount / 100).toFixed(2)} USD`;
}
/** Resolve the purchased version, rather than silently changing an order's artifact. */
export async function getReleaseForProduct(slug: string, version: string): Promise<{
    installerFileKey: string;
    sha256Checksum: string;
} | null> {
    if (!client) {
        if (process.env.NODE_ENV === "production")
            return null;
        const demo = BUILTIN_PRODUCTS.find((product) => product.slug === slug);
        return demo ? { installerFileKey: demo.installerFileKey, sha256Checksum: demo.sha256Checksum } : null;
    }
    return client.withConfig({ useCdn: false }).fetch(`*[_type == "release" && product->slug.current == $slug && version == $version && isSigned == true && malwareScanPassed == true && !(_id in path("drafts.**"))][0]{installerFileKey, sha256Checksum}`, { slug, version });
}

"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MarketplaceLayout } from "@/components/marketplace/MarketplaceLayout";
import styles from "@/components/store/store.module.css";
function ReturnContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get("orderId");
    const [orderData, setOrderData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchOrder = () => {
        if (!orderId) {
            setError("No order reference provided in return URL");
            setLoading(false);
            return;
        }
        fetch(`/api/orders/${orderId}?access=${encodeURIComponent(searchParams.get("access") || "")}`)
            .then((res) => res.json())
            .then((data) => {
            if (data.error)
                throw new Error(data.error);
            setOrderData(data);
        })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };
    useEffect(() => {
        fetchOrder();
    }, [orderId]);
    if (loading) {
        return (<div style={{ textAlign: "center", padding: "64px 0" }}>
        <p style={{ color: "var(--color-meta)" }}>Verifying payment status with the server...</p>
      </div>);
    }
    if (error || !orderData) {
        return (<div style={{ maxWidth: "540px", margin: "40px auto", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", color: "#ef4444" }}>Order Verification Failed</h1>
        <p style={{ color: "var(--color-meta)", margin: "16px 0 24px" }}>{error || "Could not retrieve order details."}</p>
        <Link href="/store" className={styles.secondaryBtn}>
          Return to App Store
        </Link>
      </div>);
    }
    const { order, product, download } = orderData;
    if (order.status === "paid") {
        return (<div style={{ maxWidth: "600px", margin: "40px auto", background: "var(--color-surface)", padding: "36px", borderRadius: "8px", border: "1px solid var(--color-divider)", boxShadow: "var(--shadow-md)" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ display: "inline-flex", width: "48px", height: "48px", borderRadius: "50%", background: "#dcfce7", color: "#15803d", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "12px" }}>
            ✓
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", margin: "0 0 8px", color: "var(--color-text)" }}>
            Payment Successful!
          </h1>
          <p style={{ fontSize: "15px", color: "var(--color-meta)", margin: 0 }}>
            Thank you for supporting independent open-source software development.
          </p>
        </div>

        <div style={{ background: "var(--color-bg)", padding: "16px 20px", borderRadius: "6px", marginBottom: "24px", border: "1px solid var(--color-divider)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
            <span style={{ color: "var(--color-meta)" }}>Application:</span>
            <strong style={{ color: "var(--color-text)" }}>{order.productName} ({order.releaseVersion})</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
            <span style={{ color: "var(--color-meta)" }}>Order Reference:</span>
            <span style={{ fontFamily: "monospace", color: "var(--color-text)" }}>{order.reference}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "14px" }}>
            <span style={{ color: "var(--color-meta)" }}>Recipient Email:</span>
            <span style={{ color: "var(--color-text)" }}>{order.customerEmail}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
            <span style={{ color: "var(--color-meta)" }}>Downloads Remaining:</span>
            <span style={{ color: "var(--color-text)" }}>
              {download ? `${download.maxDownloads - download.downloadCount} of ${download.maxDownloads}` : "5"}
            </span>
          </div>
        </div>

        {product?.sha256Checksum && (<div style={{ marginBottom: "24px" }}>
            <span style={{ fontSize: "12px", color: "var(--color-meta)", display: "block", marginBottom: "6px" }}>
              SHA-256 Checksum:
            </span>
            <div className={styles.checksumBox}>
              <span>{product.sha256Checksum}</span>
            </div>
          </div>)}

        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          {/* Direct download link via the order API */}
          <a href={`/api/orders/${order.id}`} onClick={async (e) => {
                e.preventDefault();
                window.location.href = `/api/orders/${order.id}/download?access=${encodeURIComponent(searchParams.get("access") || "")}`;
            }} className={styles.primaryBtn} style={{ display: "inline-block", width: "100%", padding: "14px 24px" }}>
            Download {order.productName} Installer
          </a>
        </div>

        <p style={{ fontSize: "13px", color: "var(--color-meta)", textAlign: "center", lineHeight: "1.6", margin: 0 }}>
          A confirmation receipt and re-download link have been emailed to <strong>{order.customerEmail}</strong>.
          You can also look up this order anytime using our <Link href="/store/orders" style={{ color: "var(--color-accent-prose)", textDecoration: "underline" }}>order lookup tool</Link>.
        </p>
      </div>);
    }
    if (order.status === "failed") {
        return (<div style={{ maxWidth: "540px", margin: "40px auto", textAlign: "center", background: "var(--color-surface)", padding: "32px", borderRadius: "8px", border: "1px solid var(--color-divider)" }}>
        <h1 style={{ fontFamily: "var(--font-heading)", color: "#ef4444", fontSize: "26px", margin: "0 0 12px" }}>
          Payment Incomplete or Cancelled
        </h1>
        <p style={{ color: "var(--color-meta)", fontSize: "15px", lineHeight: "1.6", margin: "0 0 24px" }}>
          The payment transaction was not completed. No funds were captured and no download was generated.
        </p>
        <Link href={`/store/${order.productId}`} className={styles.primaryBtn} style={{ display: "inline-block", width: "auto" }}>
          Try Again
        </Link>
      </div>);
    }
    // Pending
    return (<div style={{ maxWidth: "540px", margin: "40px auto", textAlign: "center", background: "var(--color-surface)", padding: "32px", borderRadius: "8px", border: "1px solid var(--color-divider)" }}>
      <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "26px", margin: "0 0 12px", color: "var(--color-text)" }}>
        Payment Processing
      </h1>
      <p style={{ color: "var(--color-meta)", fontSize: "15px", lineHeight: "1.6", margin: "0 0 24px" }}>
        We are waiting for final confirmation from the payment provider. This usually takes just a few seconds.
      </p>
      <button onClick={fetchOrder} className={styles.secondaryBtn} style={{ display: "inline-block", width: "auto" }}>
        Check Status Again
      </button>
    </div>);
}
export default function ReturnPage() {
    return (<MarketplaceLayout>
      <div className={styles.container}>
        <Suspense fallback={<div style={{ textAlign: "center", padding: "64px 0" }}>Loading...</div>}>
          <ReturnContent />
        </Suspense>
      </div>
    </MarketplaceLayout>);
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { PublicLayout } from "@/components/PublicLayout";
import { getProductBySlug, getAllProducts } from "@/lib/marketplace/catalog";
import { ProductDetailClient } from "@/components/store/ProductDetailClient";
import styles from "@/components/store/store.module.css";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: `${product.title}: ${product.tagline}`,
    description: product.summary,
    openGraph: {
      title: product.title,
      description: product.summary,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <PublicLayout>
      <div className={styles.container}>
        <div style={{ marginBottom: "24px" }}>
          <Link
            href="/store"
            style={{
              fontSize: "13px",
              color: "var(--color-meta)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ← Back to App Store
          </Link>
        </div>

        <ProductDetailClient product={product} />
      </div>
    </PublicLayout>
  );
}

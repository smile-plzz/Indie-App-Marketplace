"use client";

import { useState } from "react";
import Link from "next/link";
import type { MarketplaceProduct } from "@/lib/marketplace/types";
import { formatPrice } from "@/lib/marketplace/catalog";
import styles from "./store.module.css";

interface StoreCatalogProps {
  products: MarketplaceProduct[];
}

export function StoreCatalog({ products }: StoreCatalogProps) {
  const [currency, setCurrency] = useState<"BDT" | "USD">("BDT");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = ["All", ...Array.from(new Set(products.map(product => product.category).filter(Boolean))).sort()];

  const filtered = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      product.title.toLowerCase().includes(query) ||
      product.tagline.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`${styles.filterBtn} ${
                selectedCategory === cat ? styles.filterBtnActive : ""
              }`}
              aria-pressed={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className={styles.controls}>
          <input
            type="text"
            className={styles.searchBox}
            aria-label="Search apps" placeholder="Search apps"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className={styles.currencyToggle}>
            <button
              className={`${styles.currencyBtn} ${
                currency === "BDT" ? styles.currencyBtnActive : ""
              }`}
              onClick={() => setCurrency("BDT")}
            >
              BDT
            </button>
            <button
              className={`${styles.currencyBtn} ${
                currency === "USD" ? styles.currencyBtnActive : ""
              }`}
              onClick={() => setCurrency("USD")}
            >
              USD
            </button>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {filtered.map((product) => {
          const priceFormatted = formatPrice(
            currency === "USD" ? product.priceUSD : product.priceBDT,
            currency
          );

          return (
            <Link
              key={product.id}
              href={`/store/${product.slug}`}
              className={styles.card}
            >
              {product.shot?.url ? <img src={product.shot.url} alt={product.shot.alt || product.title} style={{width:"100%",height:180,objectFit:"cover",borderRadius:12,marginBottom:20}}/> : null}
              <div className={styles.cardHeader}>
                <span className={styles.cardCategory}>{product.category}</span>
                <span className={styles.versionBadge}>{product.currentVersion}</span>
              </div>

              <h2 className={styles.cardTitle}>{product.title}</h2>
              <p className={styles.cardTagline}>{product.tagline}</p>

              <div className={styles.cardFooter}>
                <span className={styles.price}>{priceFormatted}</span>
                <span className={styles.freeRouteTag}>Free on GitHub</span>
              </div>
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--color-meta)" }}>
          No applications match your filter.
        </div>
      )}
    </div>
  );
}

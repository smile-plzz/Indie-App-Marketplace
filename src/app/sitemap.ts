import type { MetadataRoute } from "next";
import { getAllProducts } from "@/lib/marketplace/catalog";
import { absolute } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();

  const routes: MetadataRoute.Sitemap = [
    { url: absolute("/"), priority: 1.0 },
    { url: absolute("/store"), priority: 0.9 },
    { url: absolute("/license"), priority: 0.7 },
    { url: absolute("/refund-policy"), priority: 0.6 },
    { url: absolute("/terms-of-sale"), priority: 0.6 },
    { url: absolute("/privacy-policy"), priority: 0.6 },
    { url: absolute("/contact"), priority: 0.6 },
    { url: absolute("/store/orders"), priority: 0.5 },
  ];

  for (const product of products) {
    routes.push({
      url: absolute(`/store/${product.slug}`),
      priority: product.featured ? 0.9 : 0.8,
    });
  }

  return routes;
}

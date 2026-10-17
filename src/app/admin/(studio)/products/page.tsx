import { CatalogImport } from "@/components/admin/CatalogImport";
import { adminProducts } from "@/lib/marketplace/admin-catalog";
import { studioWritable } from "@/lib/admin";
import { ReleaseReviewManager } from "@/components/admin/ReleaseReviewManager";
import { ProductManager } from "@/components/admin/ProductManager";
import styles from "@/components/admin/admin.module.css";
export default async function ProductsPage() {
    const products = await adminProducts();
    return <><div className={styles.pageHead}><div><div className="kick">Store catalog</div><h1 className={styles.pageTitle}>Apps, thoughtfully presented.</h1><p>Manage listings, pricing, screenshots and publication. Approved license reviews and signed, scanned releases are required before an app appears in the store.</p></div></div><CatalogImport writable={studioWritable()}/><ProductManager products={products} writable={studioWritable()}/><ReleaseReviewManager products={products} writable={studioWritable()}/></>;
}

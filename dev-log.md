# Development Log

## [2026-10-14 15:17:30 +06:00] - Task Initiation: Indie App Marketplace Build
- Task: Complete the full build for Indie-App-Marketplace repository.
- Baseline check: Checked documentation files (README.md, context.md, CHANGELOG.md, dev-log.md).
- Status: Initialized missing documentation and identified base codebase (portfolio-cms-ismail).
- Planned Steps:
  1. Port base portfolio-cms-ismail architecture into Indie-App-Marketplace.
  2. Implement Sanity schemas for Product, Release, and LicenseRecord.
  3. Implement Orders, Downloads, Refunds, and WebhookEvents database layer with transactional migrations.
  4. Implement Payment Gateway abstraction layer with Sandbox, bKash, and SSLCommerz adapters.
  5. Implement secure download service with rate-limiting, token verification, and quota limits.
  6. Implement Storefront pages: catalog, product details, guest checkout, post-purchase success, and order lookup.
  7. Implement Admin operations for order management, manual refunds, and download resets.
  8. Implement legal pages and complete test suite verifying order lifecycle and idempotency.
  9. Configure GitHub Actions release pipeline.

## [2026-10-14 15:39:30 +06:00] - Build Completion & Verification
- Database Layer: Implemented transactional SQLite / Node 22 DatabaseSync engine with automatic migrations and PostgreSQL compatibility (`src/lib/marketplace/db.ts`).
- Content & Catalog: Extended Sanity schema with `product`, `release`, and `licenseRecord` (`sanity/schema.ts`). Built rich offline catalog with 5 open-source Windows tools: LocalFlix, HDDCacheWarmer, Safe-Gaming-Optimizer, PhotoManagementApp, and dedupe-light (`src/lib/marketplace/catalog.ts`).
- Gateways & Idempotency: Implemented `PaymentGatewayAdapter` interface with Sandbox, bKash tokenized, and SSLCommerz adapters. Enforced server-side verification and idempotent webhook event tracking in `webhook_events` (`src/lib/marketplace/gateways/`, `src/app/api/webhooks/[gateway]/route.ts`).
- Delivery & Security: Implemented time-limited cryptographically signed downloads, 5-download quota tracking, and magic link authentication for order history lookup (`src/lib/marketplace/delivery.ts`).
- Storefront UI: Created `/store` catalog with category filters and BDT/USD toggle, `/store/[slug]` product pages with dual CTA (paid installer vs free GitHub build), `/store/sandbox-checkout`, `/store/return`, and `/store/orders`.
- Admin Studio: Built `/admin/orders` dashboard with live sales metrics, download reset, refund recording, and receipt resending.
- Legal & Compliance: Created `/terms-of-sale`, `/refund-policy`, `/privacy-policy`, `/license`, and `/contact`.
- Release CI/CD: Created `.github/workflows/release-app.yml` matrix pipeline for building, testing, code signing, and release registration.
- Testing: Automated test suite with 8 tests passed in 307ms (`npm test`).
- Typecheck: Full repository TypeScript compilation passed with 0 errors (`npm run typecheck`).
- Production Build: Next.js production build (`next build`) compiled 53 static pages and all dynamic routes successfully with code 0.
- Guidelines Check: Confirmed zero em-dashes exist anywhere in documentation, UI text, or code comments.

## [2026-10-14 21:09:00 +06:00] - Vercel Showcase Re-architecting
- User Request: Vercel picked up the portfolio home page at `/`; the marketplace should be a dedicated software showcase and marketplace rather than a personal portfolio.
- Root Cause Identified: The repository root route (`src/app/(public)/page.tsx`) previously rendered the developer's resume/portfolio with sidebar frame `PublicLayout`, placing the marketplace on a subroute `/store`. When Vercel built the repo, visiting the domain served the portfolio home page.
- Showcase Re-architecting:
  1. Converted root path `/` into the primary Indie App Marketplace Showcase and digital storefront, with interactive catalog, app spotlights, open-source transparency notices, and order lookup.
  2. Created clean `MarketplaceLayout` with modern top navigation, theme toggle, and legal footer, removing personal portfolio sidebar and mobile drawer.
  3. Removed legacy portfolio routes (`/credentials`, `/film`, `/projects`, `/writing`) so the deployment is 100% focused on software applications.
  4. Replaced remote `next/font/google` fetches with reliable local/system font fallbacks to eliminate build-time font download timeouts.
  5. Updated `package.json` name to `indie-app-marketplace` and SEO metadata to "Indie App Marketplace: Open-Source Windows Software by Ismail".
- Verification:
  - `npm test`: 8/8 tests passed in 334ms.
  - `npm run typecheck`: Passed with 0 errors.
  - `npm run build`: Compiled 35 static/SSG pages with 0 errors.
  - Zero em-dashes confirmed across the repository.

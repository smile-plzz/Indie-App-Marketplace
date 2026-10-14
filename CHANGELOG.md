# Changelog

All notable changes to the Indie App Marketplace project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-10-14

### Changed
- Converted root home page (`/`) into a dedicated Indie App Marketplace Showcase and digital storefront.
- Created standalone `MarketplaceLayout` with modern top navigation, app links, order recovery, and legal footer, replacing personal portfolio layout.
- Removed legacy personal resume/portfolio routes (`/credentials`, `/film`, `/projects`, `/writing`) to ensure Vercel builds strictly the App Marketplace.
- Removed network-blocking `next/font/google` remote font downloads to prevent build timeouts and ensure offline-first build stability.
- Updated root SEO metadata to "Indie App Marketplace: Open-Source Windows Software by Ismail".
- Renamed project in `package.json` to `indie-app-marketplace`.

## [1.0.0] - 2026-10-14

### Added
- Complete Indie App Marketplace digital storefront and portfolio extension.
- Sanity CMS schema extensions for `product`, `release`, and `licenseRecord`.
- Built-in rich product catalog for Ismail's open-source Windows tools: LocalFlix, HDDCacheWarmer, Safe-Gaming-Optimizer, PhotoManagementApp, and dedupe-light.
- Relational transactional database layer (`orders`, `downloads`, `refunds`, `webhook_events`) with zero-config SQLite support via Node 22 `DatabaseSync` and PostgreSQL compatibility.
- Payment gateway abstraction layer with `SandboxGateway` (deterministic testing simulator), `BKashGateway` (Bangladesh mobile tokenized flow), and `SSLCommerzGateway` (cards and net banking).
- Idempotent webhook processing preventing duplicate orders, chargebacks, and double fulfillment.
- Time-limited signed file delivery service with download quotas (default 5 downloads) and instant revocation upon refund.
- Magic link token authentication for order recovery and lookup without forced user account creation.
- Transactional email service (`ConsoleEmailService` in development, `ResendEmailService` in production) for order receipts and magic links.
- Public storefront pages: `/store` (catalog with category filter, search, and BDT/USD toggle) and `/store/[slug]` (dual CTA for paid convenience vs free GitHub build).
- Interactive checkout simulator (`/store/sandbox-checkout`), post-purchase verification (`/store/return`), order lookup (`/store/orders`), and error handler (`/store/download-error`).
- Admin operations dashboard (`/admin/orders`) for tracking sales metrics, resetting download quotas, issuing refunds, and resending receipts.
- Compliance and legal pages: `/terms-of-sale`, `/refund-policy`, `/privacy-policy`, `/license`, and `/contact`.
- GitHub Actions release pipeline (`.github/workflows/release-app.yml`) for automated testing, packaging, code signing, SHA-256 calculation, GitHub Release creation, and marketplace API registration.
- Automated test suite (`npm test`) covering order state machine transitions, webhook idempotency, download quotas, token expiry, refund revocation, and gateway adapters.
- Complete documentation: `context.md`, `dev-log.md`, and updated `README.md`.

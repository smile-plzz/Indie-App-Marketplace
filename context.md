# Context: Indie App Marketplace

## 1. Project Goals
- Provide a personal portfolio and digital storefront to showcase open-source Windows applications built by Ismail.
- Enable visitors to purchase pre-built, verified, ready-to-run installers for a modest fee, while keeping the free "build from GitHub source" route permanently prominent.
- Provide secure time-limited downloads, order recovery (magic links), and code-signed builds with verifiable SHA-256 checksums.
- Provide an admin operations interface for managing orders, refunds, download count resets, and product catalog.
- Support both local (Bangladesh: bKash, cards) and international payment flows through clean gateway adapters.

## 2. Tech Stack
- Frontend & Server: Next.js (App Router) + TypeScript + React 19.
- Content Management: Sanity CMS (extended with `product`, `release`, and `licenseRecord` schemas) + fallback seed catalog.
- Order & Transactional DB: Relational storage (supporting SQLite for zero-config offline dev/testing and PostgreSQL for production) with migrations and transactional integrity.
- Payment Gateway Abstraction: Pluggable adapter interface (`PaymentGatewayAdapter`) supporting Sandbox simulation, SSLCommerz, and bKash with server-side validation and webhook idempotency.
- File Delivery: Signed URL adapter (Cloudflare R2 / S3 / local secure stream) with rate limiting and download quotas (default 5 downloads).
- Email Service: Transactional email interface (Resend / SMTP / Console logger in development).
- Styling & Theme: Semantic CSS tokens, responsive layout, dark/light theme support.
- Testing: Automated test suite verifying order lifecycle, payment validation, webhook idempotency, and download quota enforcement.
- CI/CD: GitHub Actions workflow for building, testing, signing, calculating SHA-256 checksums, and publishing releases.

## 3. Constraints & Guidelines
- Do not use em-dashes in documentation, UI text, or comments.
- Never trust client-side browser redirects for order fulfillment; always verify server-side with gateway APIs.
- Webhook endpoints must be strictly idempotent to prevent duplicate order processing.
- Files are private and never exposed via public static URLs; access is controlled via single-purpose, time-limited, cryptographically hashed tokens.
- All monetary amounts stored as integers in the lowest currency unit (e.g., Poisha for BDT, Cents for USD).
- Do not list or build anything that streams or fetches content from unlicensed sources.

# Run and operate the marketplace

The README remains the product specification. This guide describes the implemented build and its setup boundaries.

## Local preview

Use Node 22.14 or newer. Run `npm ci`, `npm run setup:demo`, then `npm run dev`.
Open `/store` to try the clearly labeled sandbox catalog. The download is a harmless text fixture, never a fabricated installer. The generated admin password is in ignored `.env.local`. Open `/admin` to sign in. Existing environment configuration is preserved.

Without Sanity, content administration is read-only. Local orders use SQLite. Production requires PostgreSQL and does not silently fall back to a local database. Database tables and indexes are created additively on first connection; existing orders are preserved. Back up the database before upgrades.

## Admin workspace

- `/admin/products`: create and edit apps, prices, screenshots, requirements, features and FAQs; draft, publish or archive listings; complete and save license/dependency/content/safety/trademark/GPL reviews; register verified releases.
- `/admin/orders`: search and filter purchases, view currency-separated revenue, resend receipts, reset download allowances and request full refunds through the payment adapter. Confirmation dialogs explain each action. A durable per-order claim prevents duplicate external refund requests; uncertain outcomes require merchant-dashboard review. Use Record external refund with the merchant reference and evidence to record a confirmed full refund without another gateway request.
- `/admin/operations`: service configuration checks, recent payment events, receipt delivery states, CSV export (up to 10,000 orders), and manual reconciliation.
- Existing projects, writing, media and site settings remain editable through the CMS-backed studio. Public `/about`, `/projects`, `/writing` and their detail pages retain portfolio content.

One password-protected owner account is supported. Customer accounts, subscriptions, multiple sellers and staff permission roles are outside v1.

## Production setup

Configure `.env.example` values in your hosting provider, never in source control:

1. Sanity project/dataset and a server-only write token; import `sanity/schema.ts` into the project schema. A product is visible only when published, reviewed, and backed by a signed/scanned release.
2. `DATABASE_URL` for managed PostgreSQL. Transactions bind unique gateway transactions to orders, serialize state/refund/download writes, and persist receipt retry state.
3. A private R2/S3 bucket, endpoint, region and restricted credentials. Delivery checks the exact purchased version and generates an actual S3 presigned URL. No public bucket is needed.
4. Resend API key, verified sender and `EMAIL_SERVICE=resend`.
5. Random `DOWNLOAD_SECRET` and `ADMIN_SESSION_SECRET`, a strong `ADMIN_PASSWORD`, canonical HTTPS `NEXT_PUBLIC_SITE_URL`, random `RELEASE_PUBLISH_SECRET` and `CRON_SECRET`. Replace every example secret. Configure the Sanity revalidation webhook if used.
6. Approved merchant sandbox credentials. Only configured gateways appear in checkout. Sandbox simulation is disabled in production unless explicitly enabled with `ALLOW_SANDBOX_PAYMENTS=true`. Use provider sandbox credentials to pass acceptance tests before selecting live endpoints.

Checkout stays closed if production database, private storage or transactional email settings are missing. Readiness indicators confirm configuration presence, not provider connectivity or merchant approval.

## Payments and recovery

Orders are created before gateway redirects. Both callback and webhook routes verify server-side; browser query values do not grant paid status. Payment amount, currency and merchant order identity must match. Duplicate notifications cannot revive refunds or bind one transaction to multiple orders. Receipt retries use a durable delivery lease and a stable Resend idempotency key. Resend's idempotency retention window is provider-controlled; inspect delayed failures before manually replaying old messages.

Configure your hosting scheduler to POST `/api/jobs/reconcile` with `Authorization: Bearer <CRON_SECRET>`. This rechecks pending gateway orders older than 15 minutes and retries unsent receipts. No scheduler or automation is provisioned by the code build. The admin Operations action invokes the same handler.

Order receipts contain secure purchase access. Magic links expire after an hour; individual download tokens expire after 30 days; storage URLs expire after two minutes. Quotas are shared across all download tokens for an order, including recovered links. An admin reset explicitly resets the allowance. A refunded order cannot generate new downloads; already-issued short-lived storage URLs can remain usable until expiry.

The CSV export contains customer email addresses. Store it privately. Raw callback payloads are retained for successful payment events; no card data is collected.

## Release workflow

The reusable `.github/workflows/release-app.yml` consumes a real app artifact produced by the app repository's build/sign workflow. It verifies Authenticode, scans the binary, computes SHA-256, uploads privately, publishes a GitHub Release and registers metadata with the store. It does not invent an executable or acquire a signing certificate. The app repository must supply its build/test/sign job and suitable signing credentials.

An owner can also register an already-uploaded installer in the admin form. Signing and scan flags are attestations of completed checks, not a claim that the web application independently signs or scans the file. Reusing a version with different metadata is rejected. Catalog changes revalidate cached storefront pages.

## Verification

`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, and `npm audit` are the required checks. Tests include the purchase route, failed and duplicate callbacks, currency and amount checks, wrong order identities, expiry, concurrent download limits, refund revocation, and production PostgreSQL SQL through an embedded PostgreSQL runtime. Provider HTTP responses are mocked in gateway tests. A real provider sandbox purchase, actual signed installer verification, live email delivery and hosted storage access require configured services and remain launch acceptance checks.

Before taking real payments, complete merchant onboarding, replace sample policies with owner-approved policies, review licenses and dependency terms, test backups/restoration, verify support contact details, and complete a low-value live purchase. The build does not establish legal or tax approval, or certify a product for sale.

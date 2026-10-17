# Indie App Marketplace (working title): Project Plan

A personal portfolio and storefront where I showcase my open-source Windows apps and sell the convenient, ready-to-install version for a small fee, with the free "build it from GitHub" route always remaining available.

- Owner: Ismail
- Document status: v1.0, planning
- Date: 2026-10-14
- Intended readers: the owner, and any AI coding assistant or developer implementing the site

---

## 1. Summary

I build small, useful tools and apps, and publish the source on public GitHub repositories. Most people who would benefit from them will never open a repository, find the Releases page, or build anything. They want to click a button, get an installer, and use the app.

This project is a personal marketplace that closes that gap:

- A portfolio-style site that presents each app properly (screenshots, what it does, who it is for, version history).
- A simple checkout where a visitor pays a small fee, set by me per app, and gets a verified, signed, ready-to-run download.
- A clear "Free: get it from GitHub" link on every product page. The fee is for convenience, trust, updates and support, not for locking up the code.

The marketplace is for my own apps only. It is not a multi-vendor platform.

---

## 1.1 Quickstart, Setup & Usage

### Prerequisites
- Node.js 22.14+ (required for development SQLite)
- npm 9+

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/smile-plzz/Indie-App-Marketplace.git
   cd Indie-App-Marketplace
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment configuration:
   ```bash
   cp .env.example .env.local
   ```
   (For a complete local demo, run `npm run setup:demo`. It creates local secrets and a clearly labeled text download fixture. Content editing requires Sanity. Production requires PostgreSQL and configured private storage/email.)

### Usage & Running
- **Start development server:**
  ```bash
  npm run dev
  ```
  Open [http://localhost:3000](http://localhost:3000) for the portfolio and [http://localhost:3000/store](http://localhost:3000/store) for the app marketplace.
- **Run automated test suite:**
  ```bash
  npm test
  ```
- **Typecheck & Lint:**
  ```bash
  npm run typecheck
  npm run lint
  ```
- **Build for production:**
  ```bash
  npm run build
  ```

---

## 2. Context

### Prepared owner content

The admin Products page includes **Import editable entities**. With Sanity configured,
this saves eight GitHub product drafts at US$2 / BDT 246.90, eight pending license reviews,
three unsigned release candidates, six original Medium article summaries with source links,
and a hidden ElementShot portfolio project. It also fills missing or unchanged scaffold
profile copy. Existing records and owner edits are preserved when the import is repeated.

Run `npm run content:preview` to inspect the counts without saving. For a direct import,
provide the Sanity environment variables to the process and run `npm run content:import`.
The command saves a local ignored backup before importing. Never commit tokens or backups.

Importing content does not publish an app for sale. Release signing, malware scanning,
license reviews, private storage, database, payment and email configuration still apply.

### 2.1 The situation

- My apps are public and open source. Anyone can read, build and run them.
- Building from source needs developer tools and patience, so non-technical users rarely do it.
- Downloading raw files from a repo can also feel unsafe: unsigned executables, SmartScreen warnings, no clear versioning, no support.
- I am an independent developer based in Bangladesh, so payment options, payouts and tax treatment differ from the typical Stripe-and-Gumroad advice online.

### 2.2 What already exists

- `portfolio-cms-ismail`: my current portfolio, built with Next.js (App Router), Sanity CMS, TypeScript, hosted on Vercel, with an admin studio, SEO setup and light/dark themes. This is the natural base to extend, rather than starting a new site.
- Several app repos on GitHub (for example LocalFlix, once built, plus tools such as HDDCacheWarmer, dedupe-light, Safe-Gaming-Optimizer, PhotoManagementApp and others). Each will need a product page, a release pipeline and a license check before being listed.

### 2.3 Why this is worth doing

- It turns the effort already spent on polishing apps into a small, repeatable income.
- It gives my work a professional home that is more convincing than a list of repositories, which also helps my career direction (product and business-analysis roles).
- It forces good habits: versioned releases, signed installers, changelogs, documentation and support.
- It tests a real product-and-payments flow end to end, which is valuable portfolio material in itself.

---

## 3. Business model

### 3.1 What the customer is actually paying for

Because the code is free, the product has to be the convenience and the confidence:

| Value | What the buyer gets |
|---|---|
| Ready to run | One download, a proper installer, no tooling required |
| Trust | Code-signed installer, checksum shown, scanned for malware before every release |
| Updates | Access to new builds and release notes, and an update feed if the app supports it |
| Support | A direct contact path and a response commitment |
| Support the developer | A clear, honest "buy me the build" framing |

### 3.2 Pricing ideas (to decide per app)

- Fixed low price per app (for example a few hundred BDT or a few USD).
- "Pay what you want" with a small minimum.
- Bundles (all current apps for one price).
- Free tier for the very smallest tools, so the store always has something free and builds goodwill.
- Show local currency (BDT) and USD, since buyers will be both local and international.

Keep it simple at launch: one fixed price per app, in BDT and USD, no subscriptions.

### 3.3 The free route stays

Every product page links to the GitHub repository and says plainly that building from source is free. This is important for three reasons:

1. It is honest and matches the open-source spirit.
2. Many open-source licenses require source availability anyway.
3. It makes the fee feel fair, which improves conversion and reduces refund requests.

### 3.4 Honest expectations

Since the source is public, anyone can also rehost builds or fork the project. Revenue will stay modest unless the apps are genuinely useful and the convenience is real. The goal for v1 is to prove the flow works and covers its own costs, not to replace a salary. Success metrics are in section 11.

---

## 4. Goals and non-goals

### Goals

1. Present each app as a polished product page (what, why, screenshots, requirements, changelog).
2. Let a visitor pay a small fee with local and international payment methods.
3. Deliver the purchased file securely and let the buyer re-download later.
4. Make releases repeatable: push a tag on GitHub and the new signed build appears on the store.
5. Keep the legal and tax position clean and documented.
6. Reuse the existing portfolio stack and keep running costs near zero at launch.

### Non-goals (v1)

- No third-party sellers, no user-generated listings.
- No subscriptions, licensing servers or DRM. (A simple license key may come later.)
- No in-app purchases inside the apps themselves.
- No mobile app stores, macOS or Linux builds at launch.
- No attempt to hide or restrict the source code.

---

## 5. Catalog policy: what I will and will not sell

Before any app is listed, it must pass this checklist:

1. **License check:** the repo has an explicit license that allows selling copies (MIT, Apache-2.0, BSD, and GPL family all allow it, with different obligations). If there is no license file, add one before listing.
2. **GPL obligations:** if an app is GPL, the buyer must be told where the source is and receive the license text. The "Free: GitHub" link covers this.
3. **Dependency check:** every dependency, API and asset must allow commercial distribution. Examples that need attention:
   - Metadata APIs such as TMDB and OMDb have their own terms. TMDB's free API is for non-commercial use and commercial use needs a separate agreement. OMDb has its own key and usage terms. An app that depends on them (like LocalFlix) must be checked before it is sold, or must let the user bring their own API key.
   - Media libraries such as libVLC (LGPL) are fine if used correctly, with notices included.
   - Fonts, icons, images and sounds need compatible licenses.
4. **Content legality:** I will not sell apps whose main function is to stream or fetch content from unlicensed sources, including apps that embed such sources. Offline tools that work with the user's own files are fine. This protects me from takedowns, payment-account closure and legal exposure, and is easier to explain to a payment gateway.
5. **Safety check:** no telemetry or hidden network calls without disclosure, no bundled adware, a malware scan on every release build.
6. **Trademarks and names:** do not use names or logos of other products in a way that suggests affiliation.

Each product gets a short internal record of this checklist (stored with the product in the CMS) so the decision is documented.

---

## 6. Users and key scenarios

| # | Scenario | Expected result |
|---|---|---|
| S1 | A visitor finds the site from a search or a link | Sees a clear value pitch, screenshots and price within seconds |
| S2 | Visitor buys with bKash or a card | Pays, is returned to a success page, gets the download and an emailed receipt |
| S3 | Visitor prefers the free way | Finds the GitHub link easily and no pressure is applied |
| S4 | Buyer loses the file later | Can re-download using an emailed secure link, no account needed |
| S5 | A new version is released | Product page and download update automatically, past buyers are told |
| S6 | Payment succeeds but the buyer closes the tab | Order still completes through the gateway callback and the email is sent |
| S7 | Payment fails or is abandoned | Clear message, easy retry, no file released |
| S8 | Buyer wants a refund | Simple documented policy and a way to request it |
| S9 | I add a new app | Fill a CMS form and connect a repo, no code changes needed |

---

## 7. Functional requirements

### 7.1 Public site

- FR-1: Home page with a short pitch, featured apps and a clear route to the store.
- FR-2: Product page per app: headline, description, features, screenshots or short video, system requirements, version and release date, changelog, license, price, buy button, free GitHub link, FAQ, support contact.
- FR-3: Store listing with search and simple filters (category, price, free or paid).
- FR-4: Portfolio sections (about, projects, writing) retained from the existing site.
- FR-5: Legal pages: terms of sale, refund policy, privacy policy, license information, contact. Payment gateways usually require these to be live.
- FR-6: SEO: sitemap, structured data for software applications, social preview images.
- FR-7: Light and dark themes consistent with the existing design tokens.

### 7.2 Checkout and payments

- FR-8: Guest checkout with just an email address. Accounts are optional and not in v1.
- FR-9: At least one local method (bKash and cards through a Bangladesh gateway) and, if feasible, one international method.
- FR-10: Price shown in BDT and USD, with the chosen currency recorded on the order.
- FR-11: Server-side order creation before redirecting to the gateway. The order has a unique ID and status (pending, paid, failed, refunded).
- FR-12: Payment confirmation only through server-side verification with the gateway (never trusting the browser redirect alone).
- FR-13: Idempotent processing of gateway callbacks, so duplicate notifications never create duplicate orders or emails.
- FR-14: Email receipt with the download link and order ID.
- FR-15: Refund recording and revoking of download access when refunded.

### 7.3 Delivery

- FR-16: Files are stored privately and served only through time-limited signed URLs.
- FR-17: Each order allows a sensible number of downloads (for example 5) and can be reset by me.
- FR-18: Buyers can request a new link by entering their email, which sends a magic link to their orders.
- FR-19: SHA-256 checksum displayed for each file, and the installer is code-signed.
- FR-20: Release notes and the latest version always visible. Older versions available to buyers where sensible.

### 7.4 Admin (me)

- FR-21: Create and edit products in the CMS: copy, media, price, status, repo link, license record, release files.
- FR-22: Orders dashboard: search by email or order ID, status, resend email, issue refund record, reset downloads.
- FR-23: Basic sales and download stats.
- FR-24: Draft, published and archived states per product.

### 7.5 Release pipeline

- FR-25: A GitHub Actions workflow builds each app on a version tag, runs tests, signs the installer, generates the checksum and release notes, and uploads the artifacts.
- FR-26: A publish step registers the new version with the store (storage upload plus a version record), triggered automatically or by one approval click.
- FR-27: The public GitHub Release is still created, so the free route stays in sync.

---

## 8. Non-functional requirements

| Area | Requirement |
|---|---|
| Security | No payment card data touches my servers. All secrets in environment variables. Webhook signatures or server-to-server verification on every payment event. Rate limiting on checkout and download endpoints. |
| Reliability | Orders survive browser closure, duplicate callbacks and gateway delays. A reconciliation job compares gateway records with my orders. |
| Performance | Product pages are statically generated and load fast on mobile connections common in Bangladesh. Images optimized. |
| Privacy | Collect only email and order data. No ad trackers. Clear privacy policy. Use privacy-friendly analytics. |
| Cost | Near-zero fixed cost at launch: free-tier hosting, pay-per-use storage, gateway fees only on sales. |
| Accessibility | Keyboard use, contrast, readable text, works without heavy JavaScript where possible. |
| Maintainability | Adding a product is a content task, not a code task. |
| Legal | Records kept for orders, refunds and license checks. |

---

## 9. Technical approach

### 9.1 Recommended stack

Extend the existing portfolio rather than starting over.

| Layer | Choice | Reason |
|---|---|---|
| Web app | **Next.js (App Router) + TypeScript** (existing) | Already in use, good SEO, server routes for checkout and webhooks |
| Content | **Sanity** (existing) with new `product`, `release` and `licenseRecord` schemas | Admin studio already exists, editors for copy and media |
| Orders database | **Postgres on a managed free tier** (for example Neon or Supabase), with Drizzle or Prisma | Orders and downloads need transactional storage, which a CMS is not designed for |
| File storage | **Cloudflare R2 or S3-compatible storage** with signed URLs, or Vercel Blob | Private files, time-limited links, cheap egress on R2 |
| Email | **Resend** or similar transactional email | Receipts and magic links |
| Hosting | **Vercel** (existing) | Simple deploys, preview environments |
| CI/CD | **GitHub Actions** | Build, sign, publish |
| Code signing | A certificate or a managed signing service, eligibility to be verified for Bangladesh | Removes most SmartScreen friction, which directly affects conversion and trust |
| Analytics | Plausible or a similar privacy-friendly tool | Lightweight and clean |

### 9.2 Payment options

This area changes often and my research could not confirm current onboarding rules or fees, so every item below is a **to-verify** list, not a decision.

**Local (Bangladesh) gateways:**

- **bKash:** most familiar to local buyers. Offers merchant payment APIs (tokenized checkout style flows). Merchant onboarding usually involves business documents, so confirm whether a sole proprietorship with a trade license is enough.
- **SSLCommerz, aamarPay, ShurjoPay, Portwallet and similar aggregators:** one integration that can expose cards, bKash, Nagad, Rocket and net banking. These are the practical route for a solo developer because one contract covers many methods. SSLCommerz's own guidance for merchants mentions a legal entity such as a sole proprietorship, a trade license, tax registration and a Digital Business ID (DBID). Fees and exact onboarding requirements must be confirmed directly with each provider.
- **Nagad and Rocket:** usually reached through the aggregators.

**International options:**

- **Merchant-of-record platforms** (Lemon Squeezy, Paddle, Gumroad and similar) handle global sales tax and VAT and are easy to integrate, but they depend on seller-country support for payouts. In my research, Bangladesh was not listed as a supported payout country for Lemon Squeezy, so this must be confirmed for each platform before relying on one. Typical fees on such platforms are several percent plus a fixed amount per sale, which is heavy for very low prices.
- **Stripe:** availability for Bangladesh-based businesses has historically been limited. Verify before planning around it.
- **PayPal and Payoneer:** can help receive international payments, with their own fees and rules for Bangladesh. Verify current status.

**Recommended path for v1:**

1. Start with one local aggregator that supports bKash and cards, and integrate it properly with server-side verification.
2. Use BDT as the primary currency. Offer USD display with conversion for foreign buyers if the gateway supports it.
3. Add an international method only after the local flow is stable and the payout path is confirmed.
4. Because fees take a larger share of low prices, set a sensible minimum price per app (the fixed per-transaction cost matters more than the percentage).

### 9.3 Checkout flow (generic, works for any gateway)

1. Buyer clicks Buy and enters an email.
2. Server creates an `Order` (status `pending`, product, price, currency, email, unique reference).
3. Server calls the gateway to create a payment session and returns the redirect URL.
4. Buyer pays on the gateway's hosted page.
5. Gateway redirects the buyer back, and separately sends a server-to-server notification (IPN or webhook).
6. Server verifies the payment by calling the gateway's validation or query API with the order reference and checks amount, currency and status.
7. If valid, the order moves to `paid` in a single database transaction, the receipt email is sent once, and the download link is created.
8. The return page shows the result by reading the order status, so it is correct even if the browser redirect was slow or missing.
9. A scheduled reconciliation job re-checks `pending` orders older than a threshold against the gateway.

Rules:

- Never mark an order paid based only on the redirect.
- Verify amount and currency against the order, not against values sent by the browser.
- Make steps 6 and 7 idempotent.
- Log every gateway event with the raw payload for disputes.

### 9.4 Data model (simplified)

- `Product` (in Sanity): slug, name, tagline, description, media, price BDT, price USD, status, repo URL, license, requirements, FAQ
- `Release` (in Sanity or DB): product, version, release date, notes, file key, checksum, signed flag, min OS
- `Order` (DB): id, reference, email, product, release, amount, currency, gateway, gateway reference, status, created, paid at
- `Download` (DB): order, token hash, expires, count, last used
- `Refund` (DB): order, amount, reason, date
- `WebhookEvent` (DB): gateway, event id, payload, processed flag (for idempotency)
- `LicenseRecord` (Sanity): product, license, dependency review, content-legality review, reviewed date

### 9.5 Delivery security

- Files are never in a public folder or public bucket.
- Download endpoint checks the order, status, expiry and count, then redirects to a short-lived signed URL.
- Download tokens are random, stored hashed, and single-purpose.
- Magic links expire quickly and reveal only that email's orders.
- The checksum and signature let buyers verify what they received.

### 9.6 Release and signing pipeline

1. Tag a release in the app repo (for example `v1.2.0`).
2. GitHub Actions builds the Windows installer, runs the test suite, signs the installer, computes SHA-256, and generates release notes from the changelog.
3. The workflow creates the public GitHub Release (free route) and uploads the same signed installer to private storage.
4. A call to the store's publish endpoint (authenticated) registers the release. A manual approval step can gate publishing at first.
5. The product page updates, and optionally an email goes to past buyers of that app.

Notes:

- Unsigned installers trigger SmartScreen warnings, which kill trust and sales. Plan for code signing early, and confirm which signing options are available to an individual developer in Bangladesh and what they cost.
- Publish a malware scan result or at least run an automated scan on each build.

### 9.7 Integration with existing portfolio

- Keep the portfolio pages as they are and add `/store` and `/store/[slug]`.
- Reuse the design tokens, themes and components.
- Add product and release schemas to the Sanity studio, and keep the admin password-protected as it is today.
- Add server routes: `/api/checkout`, `/api/webhooks/[gateway]`, `/api/download/[token]`, `/api/orders/lookup`.

---

## 10. Legal, tax and compliance

None of this is legal or tax advice. Confirm with a qualified accountant or lawyer in Bangladesh before accepting money.

| Topic | What to confirm |
|---|---|
| Business form | Whether to operate as a sole proprietorship, and which licenses (trade license, tax registration, DBID) the chosen gateway requires |
| Gateway onboarding | Exact documents, fees, settlement time, and whether selling digital software is an accepted category |
| Income and tax | How income from digital product sales is declared, VAT applicability on digital goods, and whether sales to foreign buyers count as export of services |
| Foreign receipts | Which channels legally bring foreign currency into a Bangladeshi bank account |
| Open-source licenses | Obligations for each app (notices, source offer, attribution) |
| Third-party terms | Commercial-use terms of every API and asset (see section 5) |
| Consumer terms | Refund policy, terms of sale, privacy policy |
| Data protection | Storing only what is needed (email and order data) and securing it |
| Name and branding | No misuse of other trademarks, check the store name is available as a domain |

Documents to prepare: Terms of Sale, Refund Policy (a short, fair policy for digital goods), Privacy Policy, an Open Source and License page, and a Contact and Support page.

---

## 11. Metrics and success criteria

Launch is successful if, within the first three months:

- At least one app is listed with a complete product page and a working paid checkout.
- A test purchase works end to end in under two minutes using bKash or card.
- Zero orders lost: every successful payment results in a delivered file.
- Gateway fees and hosting costs are covered by sales (or are near zero before the first sale).
- Every release goes through the pipeline without manual file handling.

Metrics to watch: visitors, product page to checkout conversion, paid orders, revenue after fees, refund rate, download success rate, support requests, GitHub stars and clones (to see whether the store helps the open-source side too).

---

## 12. Delivery plan

| # | Milestone | Outcome | Acceptance check |
|---|---|---|---|
| M0 | Decisions and setup | Choose gateway, confirm onboarding needs, pick name and domain, set up database, storage and email accounts | Written decisions, accounts created, sandbox credentials in hand |
| M1 | Catalog | Product and release schemas, store pages, product page template, legal pages | One real app presented properly, content editable from the studio |
| M2 | Release pipeline | GitHub Actions build, test, sign, checksum, publish to storage and GitHub Releases | A tagged release appears on the store with no manual steps |
| M3 | Checkout (sandbox) | Order creation, gateway session, return page, webhook, verification, idempotency | Full sandbox purchase works, duplicate callbacks handled |
| M4 | Delivery | Signed download URLs, limits, magic-link re-download, receipt email | Buyer receives email and can download, links expire correctly |
| M5 | Admin and operations | Orders dashboard, refunds, resend, reconciliation job, alerts | I can handle a refund and a stuck order without touching the database |
| M6 | Hardening | Rate limiting, security review, error pages, accessibility pass, performance pass, backup plan | Checklist passes, test with real low-value live payment |
| **v1.0** | **Public launch** | **First app on sale** | **Real payment from a real buyer completes and downloads** |
| M7 | Growth | More apps, bundles, update emails, optional license keys, optional international checkout | Driven by what the first sales teach me |

Order of work inside each milestone: schema and interfaces, tests, implementation, then UI.

---

## 13. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| Gateway onboarding takes longer or has stricter requirements than expected | Launch delay | Start the application early (M0), run a free-only store in the meantime |
| Low prices make fixed transaction fees painful | Thin or negative margin | Set a minimum price, test bundles, compare gateways |
| Source is public so others rehost builds | Lower sales | Compete on trust, signed builds, updates, support and clear value, accept the model honestly |
| Unsigned installers scare buyers | Low conversion | Code signing in the pipeline, checksums, malware scan results |
| Payment succeeds but delivery fails | Angry buyer, chargeback or refund | Webhook-driven fulfillment, reconciliation job, email resend, manual override |
| Fake or duplicate callbacks | Free downloads or duplicate orders | Server-side verification and idempotency |
| License or API terms violated | Takedown or legal trouble | Catalog checklist (section 5), per-product license record |
| Selling an app tied to unlicensed content sources | Legal exposure and gateway account loss | Policy: do not list such apps |
| Tax or regulatory surprises | Fines or frozen funds | Confirm with an accountant before launch, keep clean records |
| Support burden grows | Time drain | Clear FAQ, documented install guide, support hours, status page for known issues |
| Dependence on a single platform (Vercel, gateway, storage) | Outage or lock-in | Keep exports of products, orders and files, document recovery steps |

---

## 14. Open questions for the owner

1. Store name and domain: part of the portfolio or a separate brand?
2. Which apps are first in line, and which have clean licenses and dependencies today?
3. Do I have, or can I get, the business documents a gateway will ask for (trade license, tax registration, DBID, business bank account)?
4. Preferred pricing: fixed, pay-what-you-want, bundles? Currency: BDT first, with USD display?
5. Target buyers: mostly local, or international from day one?
6. Should buyers need an account, or is email-only guest checkout enough? (Recommendation: email-only.)
7. Refund window: 7 days, 14 days, or case by case?
8. Do I want a simple license key later, or keep it fully key-free?
9. Code signing: what budget and which route is realistic?
10. Do I want a free apps section (no payment) at launch to build trust?
11. Support channel: email only, or also a community space?

---

## 15. Instructions for the implementing assistant (for ChatGPT or any developer)

- Build in milestone order (section 12). Do not wire up a live gateway before the sandbox flow passes tests.
- Extend the existing `portfolio-cms-ismail` codebase. Reuse its design tokens, layout and Sanity setup.
- Create database tables and Sanity schemas first, with migrations, and keep money values as integers in the smallest currency unit.
- Treat every gateway as an adapter behind one interface (`createSession`, `verifyPayment`, `refund`), so gateways can be added or swapped without touching order logic.
- Never trust the browser redirect for payment status. Always verify server-side and keep processing idempotent.
- Store secrets only in environment variables, provide an `.env.example`, and never commit keys.
- Never expose files by public URL. Use signed, expiring links only.
- Write tests for the order state machine, webhook idempotency, amount and currency checks, and download limits.
- Keep each milestone small and runnable, and end each one with a short "how to run and verify" note.
- Do not list or build anything that streams or fetches content from unlicensed sources.
- Do not use em-dashes in documentation, UI text or comments.
- When a decision is unclear, choose the safest default, state the assumption, and continue.

---

## 16. Glossary

- **Aggregator (payment):** a provider that offers many payment methods (cards, mobile wallets, net banking) through one integration.
- **IPN / webhook:** a server-to-server notification from the gateway telling my server that a payment event happened.
- **Idempotent:** safe to run more than once with the same result, which prevents duplicate orders.
- **Merchant of record (MoR):** a platform that is the legal seller and handles sales tax and VAT on my behalf.
- **Signed URL:** a link to a private file that works only for a short time.
- **Code signing:** a digital signature on an installer that proves who published it and that it was not altered.
- **Reconciliation:** comparing my order records with the gateway's records to catch mismatches.
- **DBID:** Digital Business Identification number issued in Bangladesh for online businesses.


## Build operations

See [docs/OPERATIONS.md](docs/OPERATIONS.md) for the implemented admin screens, local demo setup, production configuration, verification and launch acceptance boundaries. Product intent and milestone requirements above remain authoritative. Real merchant approval, service credentials and signed app artifacts are required before launch.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Dev server (binds 0.0.0.0:3000, uses Turbopack)
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint (flat config, Next.js core-web-vitals + TypeScript)
```

No test framework is configured.

## Architecture

This is a **Next.js 16 App Router** storefront for Felten Shop (Milwaukee tools reseller), built with React 19, TypeScript, and Tailwind CSS 4.

### Shopify Integration

Two API layers talk to Shopify:

- **Storefront API** (`src/lib/shopify/client.ts`): Public-facing reads via `@shopify/hydrogen-react`. Uses `shopifyFetch()` with 300s cache revalidation. GraphQL queries in `queries.ts`, high-level functions (`getProducts`, `getCollectionProducts`) in `index.ts`.
- **Admin API** (`src/lib/shopify/admin.ts`): Server-side mutations via OAuth client_credentials flow. Token cached with 5-min safety window. Used by the `/admin` panel and API routes for product management.

Both use Shopify API version `2025-10` (Storefront) / `2025-01` (Admin).

### State Management (React Context)

All global state lives in `src/context/`, composed in `src/components/providers.tsx`:

- **CustomerProvider** > **VATProvider** > **ViewModeProvider** > **CartProvider** > **CompareProvider**

Key contexts:
- `cart-context.tsx` — Shopify cart CRUD, persists cart ID in localStorage
- `vat-context.tsx` — VAT logic: `particulier` (17% LU), `pro_local` (17% LU), `pro_eu` (reverse charge 0%), `pro_non_eu` (export 0%). Controls HT/TTC display mode
- `view-mode-context.tsx` — Pro vs Particulier UI mode toggle
- `customer-context.tsx` — Shopify customer auth with token + expiry in localStorage
- `compare-context.tsx` — Product comparison (max 4 items)

### Routing

- `/` — Homepage
- `/collections/[handle]` — Collection pages with filters/sorting
- `/products/[handle]` — Product detail pages
- `/account` — Customer login/register/dashboard
- `/admin` — Admin panel (requires `SHOPIFY_CLIENT_ID` + `SHOPIFY_CLIENT_SECRET`)
- `/api/*` — API routes: `customer/`, `search`, `vat/validate`, `warranty/`, `invoice/[orderId]`, `machines`, `verify-email`

### Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

### Styling

Tailwind CSS 4 via PostCSS. Primary red: `#DB0000` (Milwaukee brand). Font: Inter via `next/font/google`.

### Large Static Data Files

- `src/lib/product-specs.ts` (~283KB) — Product specification database
- `src/lib/box-contents.ts` (~284KB) — Box/kit contents definitions

### Language

The storefront UI is in **French**. Pricing is EUR with Luxembourg 17% VAT as the base rate.

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=xxxxx
SHOPIFY_CLIENT_ID=xxxxx          # Admin API (optional, for /admin)
SHOPIFY_CLIENT_SECRET=shpss_xxx  # Admin API (optional, for /admin)
```

## Scripts Directory

`/scripts/` contains TypeScript and Python data import/migration utilities (CSV import, variant image upload, bulk title updates, specs metafield application). These are excluded from tsconfig compilation.

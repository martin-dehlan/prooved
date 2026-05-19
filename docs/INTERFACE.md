# Prooved External Interface Reference

This document describes the externally visible interfaces of the Prooved web application: the user-facing routes, the HTTP API surface, OAuth callbacks, and webhooks.

The canonical deployment runs at <https://prooved.xyz>. All examples below use that origin.

---

## 1. Public Web Routes (localized)

Routes are prefixed with a locale (`/de` or `/en`). The default locale is `de`.

| Route | Purpose | Auth |
|---|---|---|
| `/{locale}` | Landing page | none |
| `/{locale}/register` | Magic-link sign-in / sign-up | none |
| `/{locale}/dashboard` | Authenticated dashboard | session cookie |
| `/{locale}/dashboard/connect` | Platform-connection grid | session cookie |
| `/{locale}/dashboard/connect/{platform}` | Per-platform onboarding flow | session cookie |
| `/{locale}/dashboard/settings` | Account settings | session cookie |
| `/{locale}/{slug}` | Public reputation profile | none |
| `/{locale}/{slug}/report` | Submit an abuse report | none |
| `/{locale}/about`, `/imprint`, `/privacy`, `/terms`, `/security`, `/how-it-works`, `/data-deletion` | Static legal/info pages | none |

Supported `platform` values today: `ebay`, `paypal`, `vinted`, `kleinanzeigen`, `etsy`, `willhaben`, `linkedin`, `github`, `discogs`, `reverb`, `shpock`, `facebook`, `website`, `custom`.

---

## 2. HTTP API

All API routes live under `/api`. They are **not** locale-prefixed.

Requests use JSON (`Content-Type: application/json`) unless noted. Authenticated routes require the Supabase auth session cookie set by `/auth/callback`.

### 2.1 Auth and Session

| Method | Path | Input | Output | Auth |
|---|---|---|---|---|
| `GET` | `/auth/callback?code=...&next=...` | PKCE code from magic link | `302` to `next` on success, to `/{locale}/register?error=...` on failure | none |

### 2.2 Account

| Method | Path | Input | Output | Auth |
|---|---|---|---|---|
| `POST` | `/api/account/email` | `{ email: string }` | `{ ok: true }` or `{ error: string }` | session |

### 2.3 Connections

| Method | Path | Input | Output | Auth |
|---|---|---|---|---|
| `GET` | `/api/connections` | — | `Connection[]` | session |
| `POST` | `/api/connections` | `{ platform, platform_url, method }` | `Connection` | session |
| `DELETE` | `/api/connections?id=...` | — | `{ ok: true }` | session |
| `POST` | `/api/refresh/{connectionId}` | — | `{ ok: true, lastFetched: string }` | session |

### 2.4 Verification

| Method | Path | Input | Output | Auth |
|---|---|---|---|---|
| `POST` | `/api/verify/bio-code` | `{ connectionId: string }` | `{ verified: boolean, tier?: string }` | session |
| `POST` | `/api/verify/domain` | `{ connectionId: string }` | `{ verified: boolean }` | session |
| `POST` | `/api/verify/custom` | `{ connectionId: string }` | `{ verified: boolean }` | session |

### 2.5 Profile

| Method | Path | Input | Output | Auth |
|---|---|---|---|---|
| `GET` | `/api/profile/{slug}` | — | Public profile JSON | none |

### 2.6 Reports

| Method | Path | Input | Output | Auth |
|---|---|---|---|---|
| `POST` | `/api/report` | `{ target_slug, reason, evidence?, description }` | `{ ok: true }` | none, rate-limited by IP |

### 2.7 Activity

| Method | Path | Input | Output | Auth |
|---|---|---|---|---|
| `GET` | `/api/activity` | — | `Activity[]` for current user | session |

### 2.8 Export

| Method | Path | Input | Output | Auth |
|---|---|---|---|---|
| `GET` | `/api/export/signed` | — | Signed JSON export of the user's profile | session |

### 2.9 Wallet (Solana, optional)

| Method | Path | Input | Output | Auth |
|---|---|---|---|---|
| `GET` | `/api/wallet/nonce` | — | `{ nonce: string, expiresAt: string }` | session |
| `POST` | `/api/wallet/verify` | `{ address, signature, nonce }` | `{ ok: true }` | session |

---

## 3. OAuth Callbacks

Inbound from external identity providers.

| Path | Provider | Notes |
|---|---|---|
| `/api/oauth/ebay/callback` | eBay | Authorization-Code flow, redirects to `/{locale}/dashboard/connect/ebay` |
| `/api/oauth/paypal/callback` | PayPal | Identity API, no transaction data |
| `/api/oauth/etsy/callback` | Etsy | Authorization-Code flow |
| `/api/oauth/github/callback` | GitHub | For platform verification |
| `/api/oauth/linkedin/callback` | LinkedIn | For platform verification |
| `/api/oauth/facebook/start` and `/callback` | Facebook | App-level OAuth |

---

## 4. Webhooks (inbound)

| Path | Source | Auth model |
|---|---|---|
| `/api/ebay/marketplace-account-deletion` | eBay | Signed challenge / verification token per eBay spec |

---

## 5. Cron

Scheduled by Vercel Cron (see `vercel.json`).

| Path | Schedule | Purpose |
|---|---|---|
| `/api/cron/refresh-connections` | `0 4 * * *` (daily, 04:00 UTC) | Re-fetch platform stats for all connections |

---

## 6. Public Static Files

| Path | Purpose |
|---|---|
| `/.well-known/security.txt` | Security-contact disclosure per [RFC 9116](https://www.rfc-editor.org/rfc/rfc9116) |
| `/robots.txt` | Crawler directives |
| `/sitemap.xml` | Sitemap (generated by Next.js) |
| `/opengraph-image` | OG share image for the canonical URL |
| `/icon.png`, `/logo.png` | Brand assets |

---

## 7. Response Conventions

- **Status codes** follow HTTP semantics: `200` success, `201` create, `400` validation error, `401` unauthenticated, `403` forbidden, `404` not found, `429` rate-limited, `500` server error.
- **Errors** return JSON `{ error: string, code?: string }`.
- **Rate limiting**:
  - `/api/verify/*`: 3 requests/hour/user
  - `/api/wallet/verify`: 5 requests/hour/user
  - `/api/report`: 3 requests/day/IP
  - `/api/export/signed`: 10 requests/day/user

---

## 8. Versioning

The API is **unversioned** while the project is in beta. Breaking changes will be announced in the [changelog](https://github.com/martin-dehlan/prooved/releases) once releases begin.

For machine consumers that depend on `/api/profile/{slug}` JSON, watch the GitHub releases page.

---

## 9. Authentication Model

- **Sessions**: Supabase Auth session cookie, set by `/auth/callback` after PKCE exchange. Cookie is `HttpOnly`, `Secure`, `SameSite=Lax`.
- **Public reads**: profile pages and `/api/profile/{slug}` require no authentication.
- **OAuth tokens**: stored encrypted (AES-256) server-side. Never returned to clients.

For the security policy and vulnerability disclosure, see [SECURITY.md](../SECURITY.md).

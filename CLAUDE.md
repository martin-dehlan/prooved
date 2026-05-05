# Prooved — Claude Code Master Prompt

Du baust **Prooved** — eine Web-App die es Privatverkäufern auf Marktplätzen ermöglicht,
ihre Reputation von mehreren Plattformen (eBay, Vinted, Kleinanzeigen, PayPal) an einem Ort
zu bündeln und als verifizierten, teilbaren Link zu teilen.

**Kernprinzip:** Prooved erstellt keine eigenen Bewertungen. Es verifiziert nur, dass ein
Account wirklich der Person gehört, und zeigt dann die Bewertungen der jeweiligen Plattform an.

---

## Kontext & MCP-Nutzung

Du hast Zugriff auf die **Supabase MCP** und **Vercel MCP**.
Nutze diese aktiv — lege Tabellen, RLS-Policies, Edge Functions und ENV-Variablen
direkt über die MCPs an, anstatt manuelle Anweisungen zu geben.

Reihenfolge beim Setup:
1. Supabase MCP: Datenbank-Schema anlegen + RLS-Policies setzen
2. Next.js Projekt aufbauen
3. Vercel MCP: ENV-Variablen setzen + deployen

---

## Tech Stack

- **Framework:** Next.js 14 (App Router), TypeScript strict mode
- **Styling:** Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Auth + PostgreSQL + Edge Functions + Realtime)
- **State:** Zustand (Client State) + React Query (Server State)
- **Forms:** React Hook Form + Zod
- **Wallet:** @solana/wallet-adapter-react, Phantom, Solflare
- **Chain:** Solana (Devnet → Mainnet), Metaplex für SBTs
- **Hosting:** Vercel
- **Sprache:** Deutsch (UI), Englisch (Code + Kommentare)

---

## Architektur-Prinzipien

Befolge exakt diese Architektur — kein Abweichen:

```
Feature-First Structure:
src/
├── app/                          # Next.js App Router (nur Routing)
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/useAuth.ts      # Supabase session
│   │   └── services/authService.ts
│   ├── connections/
│   │   ├── components/
│   │   ├── hooks/useConnections.ts
│   │   └── services/connectionService.ts
│   ├── profile/
│   │   ├── components/
│   │   └── hooks/useProfile.ts   # public, kein Auth nötig
│   ├── verify/
│   │   ├── hooks/useVerify.ts
│   │   └── services/verifyService.ts
│   ├── wallet/                   # Solana — optional
│   │   ├── components/WalletConnectButton.tsx
│   │   ├── components/WalletBadge.tsx
│   │   ├── hooks/useWalletVerify.ts
│   │   └── services/walletService.ts
│   └── export/
│       └── services/exportService.ts
├── shared/
│   ├── components/               # Plattform-Cards, Trust-Profile, etc.
│   ├── hooks/
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts         # Browser client
│   │   │   └── server.ts         # Server client (RSC)
│   │   ├── solana/
│   │   │   └── mintVerificationSBT.ts
│   │   ├── platforms/
│   │   │   ├── ebay.ts
│   │   │   ├── paypal.ts
│   │   │   ├── vinted.ts
│   │   │   └── kleinanzeigen.ts
│   │   ├── crypto.ts             # AES-256 token encryption
│   │   └── rate-limit.ts
│   └── types/
│       ├── database.types.ts     # Supabase generated types
│       └── platform.types.ts
└── config/
```

### State Management Regeln

| State-Typ | Tool |
|-----------|------|
| API / DB Daten | React Query (`useQuery`, `useMutation`) |
| UI State (Sidebar, Modal) | Zustand |
| Formular-Eingaben | React Hook Form + Zod |
| Navigation / URL | Next.js Router |
| Auth Session | Supabase Auth (kein eigener Store) |

### Client vs Server Components

- Server Components (default): SEO-Seiten, initiales Data Fetching, `/[slug]` Profil
- Client Components (`'use client'`): alle Hooks, Event Handler, Wallet-Integration
- Supabase Server Client für RSC, Browser Client für Client Components

---

## Datenbank-Schema (via Supabase MCP anlegen)

```sql
-- Users (Supabase Auth ergänzen)
CREATE TABLE users (
  id TEXT PRIMARY KEY,                        -- entspricht auth.users.id
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  slug TEXT UNIQUE NOT NULL,                  -- z.B. "max-mustermann"
  wallet_address TEXT UNIQUE,                 -- Solana public key, optional
  wallet_verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Connections (verknüpfte Plattformen)
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('ebay','vinted','kleinanzeigen','paypal')),
  platform_user_id TEXT,
  platform_url TEXT NOT NULL,
  verify_token TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  method TEXT NOT NULL CHECK (method IN ('oauth','bio_code','scrape')),
  tier TEXT NOT NULL CHECK (tier IN ('gold','silver','bronze')),
  -- Gecachte Plattformdaten
  rating_score FLOAT,
  rating_count INT,
  positive_count INT,
  negative_count INT,
  member_since TIMESTAMPTZ,
  last_fetched TIMESTAMPTZ,
  -- Crypto-Felder (optional)
  on_chain_tx_id TEXT,
  signed_payload TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- Reports
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  target_id TEXT REFERENCES users(id),
  reporter_ip TEXT NOT NULL,
  reason TEXT NOT NULL,
  evidence TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed BOOLEAN DEFAULT FALSE
);

-- Wallet Proofs (Solana Verifikation)
CREATE TABLE wallet_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  nonce TEXT NOT NULL,
  signature TEXT NOT NULL,
  verified_at TIMESTAMPTZ DEFAULT NOW(),
  chain TEXT DEFAULT 'solana'
);

-- Data Exports (Log)
CREATE TABLE data_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  exported_at TIMESTAMPTZ DEFAULT NOW(),
  payload_hash TEXT NOT NULL                  -- SHA-256 des signierten JSON
);
```

### RLS Policies (alle via Supabase MCP setzen)

```sql
-- users: nur eigene Zeile lesen/schreiben; public slug+name lesbar
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own" ON users FOR ALL USING (auth.uid()::text = id);
CREATE POLICY "users_public_read" ON users FOR SELECT USING (true);

-- connections: nur eigene; public lesen für verifizierte
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "connections_own" ON connections FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "connections_public_read" ON connections FOR SELECT USING (verified_at IS NOT NULL);

-- reports: insert für alle, lesen nur eigene (kein public read)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_insert" ON reports FOR INSERT WITH CHECK (true);

-- wallet_proofs: nur eigene
ALTER TABLE wallet_proofs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallet_own" ON wallet_proofs FOR ALL USING (auth.uid()::text = user_id);

-- data_exports: nur eigene
ALTER TABLE data_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exports_own" ON data_exports FOR ALL USING (auth.uid()::text = user_id);
```

---

## Routing

```
/                              → Landing Page (Server Component)
/register                      → Registrierung (Magic Link via Supabase Auth)
/dashboard                     → Eigenes Dashboard (geschützt)
/dashboard/connect             → Plattform-Übersicht
/dashboard/connect/ebay        → eBay OAuth Flow
/dashboard/connect/paypal      → PayPal OAuth Flow
/dashboard/connect/vinted      → Vinted Bio-Code Flow
/dashboard/connect/kleinanzeigen → Kleinanzeigen Bio-Code Flow
/dashboard/privacy             → Datenkontrolle (Export, Wallet trennen, Löschen)
/[slug]                        → Öffentliches Profil (KEIN Auth nötig, Server Component)
/[slug]/report                 → Meldung einreichen
/api/oauth/ebay/callback       → eBay OAuth Callback
/api/oauth/paypal/callback     → PayPal OAuth Callback
/api/verify/bio-code           → Bio-Code Prüfung
/api/refresh/[connectionId]    → Plattformdaten neu laden
/api/wallet/nonce              → Nonce für Wallet-Signatur generieren
/api/wallet/verify             → Wallet-Signatur verifizieren
/api/export/signed             → Signierten JSON-Export generieren
```

---

## Phase 1 — MVP (vollständig bauen)

### A) Auth (Supabase Magic Link)

- Supabase Auth mit Magic Link (kein Passwort)
- Nach Login: prüfe ob `users` Eintrag existiert → sonst Onboarding (Slug wählen)
- Slug-Validierung: nur `a-z`, `0-9`, `-`, min 3 Zeichen, unveränderlich nach Erstellung
- Route Guard: `/dashboard/*` nur mit aktiver Session

```typescript
// shared/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// shared/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export function createSupabaseServer() { ... }
```

### B) eBay OAuth (Tier: Gold)

- OAuth 2.0 Authorization Code Flow
- Callback: `/api/oauth/ebay/callback`
- API: eBay Trading API → `GetFeedback` Endpoint
- Speichert: FeedbackScore, PositiveCount, NegativeCount, MemberSince
- Access Token AES-256 verschlüsselt in `connections.signed_payload`
- Re-Fetch alle 24h via Supabase Edge Function (Cron)

### C) PayPal OAuth (Tier: Gold)

- PayPal Identity API: `/v1/identity/openidconnect/userinfo`
- Holt: verified_account (boolean), name, account_type
- Keine Transaktionsdaten
- Token verschlüsselt speichern

### D) Vinted Bio-Code (Tier: Silver)

- Nutzer gibt Vinted-Profil-URL ein
- Token-Format: `PR-{userId_hash_5}-{random_5}` (kryptographisch an User gebunden)
- Anleitung: Code in Profilbeschreibung einfügen
- Server-Check: `https://www.vinted.de/api/v2/users/{id}` → prüft `about` Feld
- Ablauf: 30 Tage → Re-Verifizierung nötig
- Rate Limiting: max 3 Checks/Stunde/User

### E) Kleinanzeigen Bio-Code (Tier: Silver)

- Gleiche Logik wie Vinted
- HTML-Parsing der öffentlichen Profilseite (kein offizielles API)
- Bewertungszahl + Sternedurchschnitt aus HTML extrahieren
- Als "fragile dependency" markieren: Fallback-UX wenn Parsing fehlschlägt
- Rate Limiting: max 1 Abruf/Minute/IP

### F) Öffentliches Profil `/[slug]`

Server Component (SEO + kein Auth nötig):

```
┌─────────────────────────────────────┐
│  Max Mustermann                     │
│  Prooved seit März 2024           │
│  ◎ Wallet verifiziert    ← optional │
│                                     │
│  [eBay Gold]    [PayPal Gold]       │
│  ⭐4.9 · 234   ✓ Identität verf.   │
│  Quelle: eBay  Quelle: PayPal       │
│                                     │
│  [Vinted Silver] [Kleinanz. Silver] │
│  ⭐4.8 · 89    ⭐4.7 · 45           │
│  ⚠ läuft ab in 12 Tagen            │
│                                     │
│  [Profil melden]  [Link kopieren]   │
│  Powered by Prooved               │
└─────────────────────────────────────┘
```

- OG Meta-Tags für Chat-Preview (title, description, image)
- Kein eigener "Prooved Score" — nur Plattform-Daten
- Ablaufdatum bei Silver prominent (⚠ < 7 Tage → rot)
- "Quelle: eBay, verifiziert am 12.03.2025" unter jeder Card

### G) Melde-System

- `/[slug]/report`: Grund (Dropdown) + Beschreibung + optionaler Transaktionsnachweis
- Speichert IP + Timestamp (Spam-Schutz: max 3/Tag/IP)
- E-Mail-Benachrichtigung an ADMIN_EMAIL via Supabase Edge Function
- Kein öffentlicher Melde-Counter

### H) Dashboard

- Liste aller Connections mit Status + Ablaufdatum
- Re-Verifizierung starten
- Profil-Link kopieren
- QR-Code (qrcode.react)
- "Profil öffnen" Button

---

## Phase 2 — Erweiterungen

### 2.1 Automatische Re-Verifizierungs-Reminder

Supabase Edge Function als Cron (täglich):
- Prüft alle Connections mit `expires_at < NOW() + 7 days`
- Sendet E-Mail: "Deine Vinted-Verknüpfung läuft in 7 Tagen ab"
- OAuth-Tokens automatisch refreshen wenn möglich

### 2.2 Etsy Integration (Tier: Gold)

- Offizielles Etsy OAuth API
- `GET /v3/application/users/{user_id}/feedback`
- Gleiche Logik wie eBay

### 2.3 Willhaben AT (Tier: Silver)

- Bio-Code + HTML-Parsing
- DACH-Expansion nach Österreich

### 2.4 Embed-Widget

- `<script>` Snippet für externe Websites
- Mini-Version des Prooved-Profils
- Für gewerbliche Privatverkäufer

### 2.5 Freemium (Stripe)

```
Free:    3 Plattformen · Standard-Slug
Premium: Unbegrenzt · Custom Slug · QR-Download · Widget · 4,99€/Monat
```

- `is_premium` Boolean auf `users`
- `/api/stripe/checkout` + `/api/stripe/webhook`

### 2.6 Admin Dashboard

- `/admin` (passwortgeschützt, nur ADMIN_EMAIL)
- Gemeldete Profile reviewen
- User sperren: `suspended_at` Feld auf `users`
- Basis-Statistiken

---

## Phase 3 — Solana Crypto Layer (optional)

### Prinzip

Vollständig optional. Ein User ohne Wallet merkt nichts.
Wer verbindet: kryptographischer Eigentumsnachweis + optionales Soulbound Token.
Prooved könnte abschalten — das Token bleibt in der Wallet.

### 3.1 Wallet-Verbindung

```typescript
// Sign-in with Solana Flow:
// 1. Frontend: Wallet connect (Phantom / Solflare)
// 2. Frontend: GET /api/wallet/nonce → einmaliger Nonce
// 3. User: signiert Nonce mit Wallet (Ed25519)
// 4. Frontend: POST /api/wallet/verify { address, signature, nonce }
// 5. Supabase Edge Fn: verifiziert Signatur → schreibt wallet_proofs
// 6. users.wallet_address + users.wallet_verified_at gesetzt

// Rate limiting: max 5 Versuche/Stunde/User
// Nonce-Expiry: 5 Minuten
```

Dependencies:
```bash
npm install @solana/web3.js @solana/wallet-adapter-react
npm install @solana/wallet-adapter-phantom @solana/wallet-adapter-solflare
npm install @solana/wallet-adapter-base
```

### 3.2 Soulbound Token (SBT) minten

```typescript
// lib/solana/mintVerificationSBT.ts

interface SBTMetadata {
  platform: 'ebay' | 'vinted' | 'kleinanzeigen' | 'paypal'
  tier: 'gold' | 'silver'
  verifiedAt: string
  proovedSlug: string
  ratingCount?: number
}

// Metaplex Token Metadata Program
// isMutable: false (Soulbound = unveränderlich)
// primarySaleHappened: false (nicht transferierbar)
// txId → connections.on_chain_tx_id
```

Dependencies:
```bash
npm install @metaplex-foundation/mpl-token-metadata
npm install @metaplex-foundation/umi
npm install @metaplex-foundation/umi-bundle-defaults
```

### 3.3 Portable Signed Export

```typescript
// features/export/services/exportService.ts

interface SignedExport {
  version: '1.0'
  exportedAt: string
  subject: {
    slug: string
    walletAddress?: string
  }
  connections: {
    platform: string
    tier: string
    ratingScore?: number
    ratingCount?: number
    verifiedAt: string
    onChainTxId?: string        // Solana Explorer Link
  }[]
  signature: string             // Ed25519, Prooved Server Key
  publicKey: string             // Zum selbst verifizieren ohne Prooved
}

// Server signiert mit PROOVED_SIGNING_KEY
// User kann JSON archivieren und unabhängig verifizieren
```

### 3.4 Privacy Dashboard `/dashboard/privacy`

```
Datenkontrolle:
├── Welche Daten wir speichern (transparent)
├── [Daten exportieren als JSON] → signiertes Paket
├── [Wallet trennen] → wallet_address = null, wallet_proofs gelöscht
└── [Account löschen]
    ├── Supabase: User + Connections + Reports gelöscht (DSGVO)
    ├── On-chain: bleibt (Blockchain immutable — User wird vorab informiert)
    └── Bestätigungs-E-Mail mit Lösch-Zeitstempel
```

---

## Sicherheits-Anforderungen

```typescript
// Bio-Code: kryptographisch an User gebunden
// Format: PR-{SHA256(userId).slice(0,5)}-{crypto.randomBytes(3).toString('hex')}

// Rate Limiting (via Supabase Edge Function oder Upstash Redis)
const limits = {
  bioCodeCheck:    '3 pro Stunde pro User',
  walletVerify:    '5 pro Stunde pro User',
  profileView:     '60 pro Minute pro IP',
  reportSubmit:    '3 pro Tag pro IP',
  exportRequest:   '10 pro Tag pro User',
}

// Alle externen HTTP-Calls:
// - Timeout: 5 Sekunden
// - User-Agent setzen
// - Nur HTTPS
// - try/catch mit sinnvollen Error-Messages

// Tokens: AES-256 verschlüsselt (ENCRYPTION_KEY env var)
// Keine Secrets im Code — nur process.env

// Kleinanzeigen HTML-Parsing als "fragile dependency" markieren:
// Bei Parse-Fehler: Connection-Status = "temporarily_unavailable"
// Nicht als verifiziert anzeigen bis nächster erfolgreicher Check
```

---

## Code-Qualität

- TypeScript strict mode — keine `any` Types
- Zod für alle User-Inputs und API-Responses
- Alle DB-Queries mit `.catch()` Handler
- Alle externen API-Calls in try/catch
- Mobile-first Design (Profil wird hauptsächlich auf Handy geteilt)
- Kommentare auf Englisch: `// Source: eBay Trading API — GetFeedback`
- Jeder API-Wrapper kommentiert: Quelle, Zweck, mögliche Fehler

---

## Projekt-Setup (Schritt für Schritt)

```bash
# 1. Next.js Projekt
npx create-next-app@latest prooved --typescript --tailwind --app --src-dir

cd prooved

# 2. Core Dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install @tanstack/react-query zustand
npm install react-hook-form @hookform/resolvers zod
npm install shadcn-ui qrcode.react

# 3. Solana (Phase 3)
npm install @solana/web3.js @solana/wallet-adapter-react
npm install @solana/wallet-adapter-phantom @solana/wallet-adapter-solflare
npm install @solana/wallet-adapter-base
npm install @metaplex-foundation/mpl-token-metadata
npm install @metaplex-foundation/umi @metaplex-foundation/umi-bundle-defaults

# 4. shadcn/ui init
npx shadcn-ui@latest init

# 5. Supabase Typen generieren (nach Schema-Anlage)
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/shared/types/database.types.ts
```

---

## ENV-Variablen (Vercel MCP setzt diese automatisch)

Alle Variablen sind in `ARCHITECTURE.md` dokumentiert.
Setze sie via Vercel MCP nach dem ersten Deploy.

---

## Starte hier

1. Lege das Supabase-Schema via Supabase MCP an (alle Tabellen + RLS-Policies)
2. Generiere die TypeScript-Typen: `npx supabase gen types typescript`
3. Baue `shared/lib/supabase/client.ts` und `server.ts`
4. Baue `features/auth/` komplett (Magic Link + Slug-Onboarding)
5. Baue `features/connections/` + alle Plattform-Wrapper in `shared/lib/platforms/`
6. Baue `app/[slug]/page.tsx` (öffentliches Profil, Server Component)
7. Baue Dashboard + Connect-Flows
8. Phase 3 (Wallet) erst nach stabilem MVP

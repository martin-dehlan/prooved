# Prooved — Architektur & Setup

---

## Deine Checkliste — Was du VOR Claude Code erledigen musst

Alles was einen echten Account oder API-Key erfordert.
Claude Code (mit Supabase + Vercel MCP) erledigt den Rest automatisch.

---

### 1. Supabase Projekt

- [ ] Account anlegen: https://supabase.com
- [ ] Neues Projekt erstellen (Name: `prooved`, Region: `eu-central-1`)
- [ ] Warten bis Projekt bereit ist (~2 Minuten)
- [ ] **Notiere dir:**
  - Project URL: `https://xxxx.supabase.co`
  - Anon Key (public): Settings → API → `anon public`
  - Service Role Key (privat!): Settings → API → `service_role`
  - Project ID: in der URL sichtbar

> Supabase Auth ist bereits aktiv. Magic Link funktioniert out-of-the-box.
> Nur SMTP für eigene E-Mail-Domain konfigurieren (optional für MVP):
> Settings → Auth → SMTP Settings

---

### 2. Vercel Account

- [ ] Account anlegen: https://vercel.com (falls noch nicht vorhanden)
- [ ] Vercel CLI installieren: `npm i -g vercel`
- [ ] Einmal einloggen: `vercel login`

> Vercel MCP erledigt danach alles (Projekt anlegen, ENV setzen, deployen).

---

### 3. eBay Developer Account (~1-2 Tage Wartezeit)

- [ ] Registrieren: https://developer.ebay.com
- [ ] Neue App anlegen: "My eBay Developer Account" → "Create an Application"
- [ ] **Production Keys anfordern** (Sandbox reicht für MVP-Tests)
- [ ] OAuth Redirect URI eintragen: `https://prooved.de/api/oauth/ebay/callback`
  (für lokale Entwicklung: `http://localhost:3000/api/oauth/ebay/callback`)
- [ ] **Notiere dir:**
  - App ID (Client ID)
  - Cert ID (Client Secret)
  - Dev ID
  - RuName (Redirect URL Name) — wird bei OAuth gebraucht

---

### 4. PayPal Developer Account (sofort verfügbar)

- [ ] Registrieren: https://developer.paypal.com
- [ ] "My Apps & Credentials" → "Create App"
- [ ] App-Typ: "Default Application"
- [ ] Sandbox-Modus für MVP (Live später aktivieren)
- [ ] **Notiere dir:**
  - Client ID
  - Client Secret
  - Redirect URI eintragen: `https://prooved.de/api/oauth/paypal/callback`

---

### 5. Resend für transaktionale E-Mails (optional, empfohlen)

- [ ] Account anlegen: https://resend.com
- [ ] Domain verifizieren (oder `onboarding@resend.dev` für Tests)
- [ ] API Key generieren
- [ ] **Notiere dir:** API Key

> Alternative: Supabase nutzt standardmäßig seinen eigenen SMTP.
> Für eigene Absender-Domain (noreply@prooved.de) → Resend empfohlen.

---

### 6. Encryption Key generieren (lokal, einmalig)

Führe das einmalig in deinem Terminal aus:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Ergebnis ist dein `ENCRYPTION_KEY` — **sicher aufbewahren, nie in Git committen**.

---

### 7. Solana Setup (nur für Phase 3)

Erst nach stabilem MVP angehen:

- [ ] Phantom Wallet installieren (Browser Extension): https://phantom.app
- [ ] Solana CLI installieren (optional): https://docs.solana.com/cli/install
- [ ] Devnet-Wallet für Tests: `solana-keygen new`
- [ ] Für Mainnet-Deployment: separater Deploy-Wallet mit SOL für Minting-Fees

---

## ENV-Variablen — Vollständige Übersicht

Claude Code setzt diese via Vercel MCP. Trotzdem hier dokumentiert
damit du weißt was wohin kommt.

### Lokal (`.env.local` — niemals in Git!)

```env
# ─── Supabase ───────────────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...           # public, NEXT_PUBLIC_ ist ok
SUPABASE_SERVICE_ROLE_KEY=eyJ...               # privat! nur serverseitig

# ─── App ────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000       # Prod: https://prooved.de

# ─── eBay ───────────────────────────────────────────────────────────
EBAY_APP_ID=                                   # Client ID
EBAY_CERT_ID=                                  # Client Secret
EBAY_DEV_ID=
EBAY_REDIRECT_URI=http://localhost:3000/api/oauth/ebay/callback
EBAY_RUNAME=                                   # RuName aus Developer Console

# ─── PayPal ─────────────────────────────────────────────────────────
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_ENV=sandbox                             # → live für Produktion

# ─── Security ───────────────────────────────────────────────────────
ENCRYPTION_KEY=                                # 64 hex chars (32 bytes AES-256)
ADMIN_EMAIL=deine@email.de                     # Wohin Meldungen gehen

# ─── E-Mail ─────────────────────────────────────────────────────────
RESEND_API_KEY=re_...                          # optional, sonst Supabase SMTP

# ─── Solana (Phase 3) ───────────────────────────────────────────────
NEXT_PUBLIC_SOLANA_NETWORK=devnet              # → mainnet-beta für Produktion
SOLANA_RPC_URL=https://api.devnet.solana.com
PROOVED_SIGNING_KEY=                         # Ed25519 privkey für Signed Exports
                                               # generieren: solana-keygen new
```

### Vercel Production (via Vercel MCP setzen)

Dieselben Variablen — außer:
```env
NEXT_PUBLIC_APP_URL=https://prooved.de
PAYPAL_ENV=live
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
EBAY_REDIRECT_URI=https://prooved.de/api/oauth/ebay/callback
PAYPAL_REDIRECT_URI=https://prooved.de/api/oauth/paypal/callback
```

---

## Architektur-Layer

```
┌─────────────────────────────────────────────────────┐
│                 Presentation Layer                   │
│     Next.js App Router · shadcn/ui · Tailwind        │
├─────────────────────────────────────────────────────┤
│                 Application Layer                    │
│   Zustand (UI) · React Query (Server) · RHF + Zod   │
├─────────────────────────────────────────────────────┤
│                   Domain Layer                       │
│         Zod Schemas · TypeScript Types               │
├──────────────────────────┬──────────────────────────┤
│      Data Layer (Web2)   │   Crypto Layer (opt.)    │
│  Supabase Auth + DB      │   Solana · Metaplex SBT  │
│  Edge Functions · RLS    │   Ed25519 Signed Export   │
├──────────────────────────┴──────────────────────────┤
│                  External APIs                       │
│  eBay Trading API · PayPal Identity · Vinted API     │
│  Kleinanzeigen HTML (fragile) · Etsy API (Phase 2)  │
└─────────────────────────────────────────────────────┘
```

---

## Feature-Folder Konvention

Jedes Feature ist ein eigenständiges Modul:

```
features/{name}/
├── components/         # Nur für dieses Feature
├── hooks/              # useXxx.ts — React Query oder Zustand
├── services/           # xxxService.ts — direkte API/DB-Calls
├── types/              # xxx.types.ts + xxx.schema.ts (Zod)
└── index.ts            # Public API — nur hierüber importieren
```

Imports nur über `index.ts`:
```typescript
// ✅ Richtig
import { useAuth } from '@/features/auth'

// ❌ Falsch
import { useAuth } from '@/features/auth/hooks/useAuth'
```

---

## Datenfluss

```
User Action
    ↓
React Component
    ↓
Custom Hook (z.B. useConnections)
    ↓
React Query (useQuery / useMutation) ← Caching, Refetch, Error States
    ↓
Service Layer (connectionService.ts)
    ↓
Supabase Client / API Route
    ↓
Zod Validation
    ↓
Type-safe Data → zurück zum Component
```

---

## Tier-System

| Tier | Methode | Plattformen | Vertrauensstufe |
|------|---------|-------------|-----------------|
| Gold | OAuth 2.0 | eBay, PayPal, Etsy | Höchste — direkt von Plattform |
| Silver | Bio-Code | Vinted, Kleinanzeigen, Willhaben | Mittel — manuell verifiziert |
| Bronze | Reserviert | — | Für zukünftige einfachere Methoden |

---

## Solana Crypto Layer — Technische Details

### Wallet-Verifikation Flow

```
1. GET  /api/wallet/nonce
        → Server generiert UUID-Nonce, speichert in Redis/Supabase (TTL: 5min)
        → Response: { nonce: "PR-verify-{uuid}" }

2. User signiert Nonce mit Wallet (Ed25519)
        → Phantom/Solflare: signMessage(Buffer.from(nonce))
        → Response: Uint8Array (64 bytes)

3. POST /api/wallet/verify
        → Body: { address: string, signature: string, nonce: string }
        → Server: nacl.sign.detached.verify(nonce, sig, publicKey)
        → Bei Erfolg: wallet_proofs INSERT, users UPDATE

4. Öffentliches Profil zeigt Wallet-Badge
        → Link zu Solana Explorer: https://explorer.solana.com/address/{address}
```

### SBT Metadaten-Struktur (Metaplex)

```json
{
  "name": "Prooved — eBay Gold Verification",
  "symbol": "PRVFY",
  "description": "Verifizierte eBay-Verbindung via Prooved",
  "attributes": [
    { "trait_type": "Platform",    "value": "eBay" },
    { "trait_type": "Tier",        "value": "Gold" },
    { "trait_type": "Method",      "value": "OAuth" },
    { "trait_type": "Verified At", "value": "2025-03-12" },
    { "trait_type": "Rating Count","value": "234" },
    { "trait_type": "Prooved",   "value": "max-mustermann" }
  ],
  "properties": {
    "category": "soulbound",
    "transferable": false
  }
}
```

### Signed Export Verifikation (ohne Prooved)

```typescript
// Jeder kann ein exportiertes JSON so verifizieren:
import { sign } from 'tweetnacl'

const isValid = sign.detached.verify(
  Buffer.from(JSON.stringify(export.connections)),
  Buffer.from(export.signature, 'hex'),
  Buffer.from(export.publicKey, 'hex')
)
```

---

## Sicherheits-Checkliste

- [ ] `.env.local` in `.gitignore` (Next.js macht das automatisch)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` nie in `NEXT_PUBLIC_*` Variablen
- [ ] `ENCRYPTION_KEY` min. 32 bytes (64 hex chars)
- [ ] RLS auf allen Tabellen aktiviert (Schema oben enthält alle Policies)
- [ ] Rate Limiting auf allen öffentlichen API-Routes
- [ ] Timeout 5s auf allen externen HTTP-Calls
- [ ] Kleinanzeigen-Scraping als fragile markiert — Fallback-UX vorhanden
- [ ] Nonce-Expiry bei Wallet-Verifikation: 5 Minuten
- [ ] SBT: `isMutable: false` damit Token nicht nachträglich geändert werden kann

---

## Was Claude Code via MCP erledigt (kein manuelles Handeln nötig)

**Supabase MCP:**
- Alle Tabellen anlegen
- RLS Policies setzen
- Edge Functions deployen (Bio-Code Check, E-Mail-Reminder, Wallet-Verify)
- TypeScript-Typen generieren

**Vercel MCP:**
- Vercel-Projekt anlegen und mit GitHub verknüpfen
- Alle ENV-Variablen setzen
- Erster Deploy
- Preview-Deployments für PRs

**Was du manuell machst:**
- API-Keys bei eBay, PayPal, Resend beantragen (externe Accounts)
- ENCRYPTION_KEY einmalig generieren
- Domain `prooved.de` in Vercel hinterlegen (DNS-Einträge setzen)

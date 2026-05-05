# Prooved

Web-App die es Privatverkäufern auf Marktplätzen ermöglicht, ihre Reputation von
mehreren Plattformen (eBay, Vinted, Kleinanzeigen, PayPal) an einem Ort zu bündeln
und als verifizierten, teilbaren Link zu teilen.

**Kernprinzip:** Prooved erstellt keine eigenen Bewertungen. Es verifiziert nur,
dass ein Account dir gehört, und zeigt dann die Bewertungen der jeweiligen
Plattform.

→ Vollständiger Master-Prompt: [`CLAUDE.md`](./CLAUDE.md)
→ Setup + Architektur: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
→ Detail-Docs: [`docs/`](./docs)

---

## Stack

- Next.js 16 (App Router, Server Components, Node.js Runtime)
- TypeScript strict mode
- Tailwind CSS v4
- Supabase (Auth Magic Link + Postgres + RLS)
- React Query · Zustand · React Hook Form + Zod
- Solana (`@solana/web3.js`, Phantom/Solflare adapters) — Phase 3, optional

## Setup

```bash
npm install                 # already done by scaffold
cp .env.example .env.local  # fill in keys
npm run dev
```

### Env-Keys ausfüllen

1. **Supabase** — Projekt anlegen → URL + Anon Key + Service Role Key in `.env.local`.
2. **ENCRYPTION_KEY** — `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
3. **eBay / PayPal** — Developer Accounts anlegen (siehe `ARCHITECTURE.md` Schritt 3+4).
4. **Solana Signing Key** — `node -e "console.log(Buffer.from(require('tweetnacl').sign.keyPair().secretKey).toString('hex'))"`.

### Supabase Schema anlegen

```bash
# über Supabase MCP oder manuell im SQL editor:
supabase/migrations/0001_init.sql
```

Danach Typen generieren:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/shared/types/database.types.ts
```

## Routes

| Pfad                                     | Zweck                                  |
|------------------------------------------|----------------------------------------|
| `/`                                      | Landing                                 |
| `/register`                              | Magic Link + Slug-Onboarding            |
| `/dashboard`                             | Connection Übersicht                    |
| `/dashboard/connect`                     | Plattform wählen                        |
| `/dashboard/connect/{ebay,paypal,vinted,kleinanzeigen}` | Connect-Flow         |
| `/dashboard/privacy`                     | Export, Wallet trennen, Account löschen |
| `/[slug]`                                | Öffentliches Profil (Server Component)  |
| `/[slug]/report`                         | Profil melden                           |
| `/api/oauth/{ebay,paypal}/{start,callback}` | OAuth flows                          |
| `/api/connections/start-bio-code`        | Bio-Code generieren                     |
| `/api/verify/bio-code`                   | Bio-Code prüfen                         |
| `/api/refresh/[connectionId]`            | Plattformdaten refreshen                |
| `/api/wallet/{nonce,verify,disconnect}`  | Wallet-Verifikation (Phase 3)           |
| `/api/export/signed`                     | Signiertes JSON exportieren             |
| `/api/report`                            | Profil-Meldung                          |
| `/api/account/delete`                    | DSGVO Account-Löschung                  |

## Phase

- **Phase 1 (MVP)** — Magic-Link Auth, eBay + PayPal OAuth, Vinted + Kleinanzeigen Bio-Code, Public Profile, Reports.
- **Phase 2** — Re-Verify Cron, Etsy, Willhaben, Embed Widget, Stripe Premium, Admin Dashboard.
- **Phase 3** — Solana Wallet-Verifikation, Soulbound Tokens, signierter portabler Export.

## Status

- ✅ Code-Skelett gebaut, alle Features als stubs/working code implementiert
- ⏳ Pending: Supabase-Projekt anlegen, ENV ausfüllen, eBay/PayPal Apps registrieren, Phase-3 SBT mint impl.
- ⚠️ Kleinanzeigen-Scraping ist fragile — markiert sich self-disable bei Parse-Failure.

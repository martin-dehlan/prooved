# Deployment & Build Strategy

## Overview

Diese Dokumentation beschreibt den Build-, Test- und Deployment-Prozess für die App-Website.

---

## Development Workflow

### 1. Local Development

```bash
# Installation
pnpm install

# Development Server (http://localhost:3000)
pnpm dev

# Type Checking
pnpm type-check

# Linting
pnpm lint

# Testing
pnpm test
pnpm test:watch
pnpm test:e2e

# Build (Production)
pnpm build

# Start Production Build lokal
pnpm start
```

**package.json Scripts:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

---

## Build Process

### Next.js Build

```bash
pnpm build
```

**Was passiert:**
1. TypeScript Compilation
2. Code Bundling & Minification
3. Static Generation (SSG) für statische Pages
4. Server Components Pre-rendering
5. Image Optimization Setup
6. CSS Processing (Tailwind)
7. Output: `.next/` Directory

**Build Output:**
```
.next/
├── static/              # Static Assets (JS, CSS)
├── server/              # Server-side Code
│   ├── app/            # App Router Pages
│   └── chunks/         # Shared Code Chunks
└── cache/              # Build Cache
```

---

## Environment Variables

### Environment Files

```
.env.local              # Local Development (gitignored)
.env.development        # Development Environment
.env.production         # Production Environment
.env.example            # Template (committed to git)
```

### Variable Types

**Public (Client-side zugänglich):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://myapp.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
```

**Private (Server-side only):**
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Validation (config/env.ts)

```typescript
import { z } from 'zod';

const envSchema = z.object({
  // Public
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  
  // Private
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  STRIPE_SECRET_KEY: z.string().optional(),
  
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']),
});

export const env = envSchema.parse(process.env);
```

---

## Deployment Platforms

### Option 1: Vercel (Empfohlen)

**Warum Vercel?**
- Built von Next.js Team
- Zero-Config Deployment
- Automatisches CI/CD
- Edge Functions
- Image Optimization
- Preview Deployments
- Free Tier für Hobby-Projekte

**Setup:**
```bash
# 1. Install Vercel CLI
pnpm add -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel

# 4. Production Deploy
vercel --prod
```

**Automatisches Deployment (Git Integration):**
1. Verbinde GitHub/GitLab Repo mit Vercel
2. Jeder Push zu `main` → Production Deploy
3. Jeder PR → Preview Deploy

**Environment Variables in Vercel:**
- Dashboard → Project Settings → Environment Variables
- Getrennte Werte für Development, Preview, Production

**vercel.json (Optional):**
```json
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["fra1"]
}
```

---

### Option 2: Netlify

**Setup:**
```bash
# netlify.toml
[build]
  command = "pnpm build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

### Option 3: Self-Hosted (Docker)

**Dockerfile:**
```dockerfile
FROM node:20-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN pnpm build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    restart: unless-stopped
```

**next.config.js (für Docker):**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};

module.exports = nextConfig;
```

---

## CI/CD Pipeline

### GitHub Actions

**.github/workflows/ci.yml:**
```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8
          
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
        
      - name: Type check
        run: pnpm type-check
        
      - name: Lint
        run: pnpm lint
        
      - name: Unit tests
        run: pnpm test
        
      - name: Build
        run: pnpm build
        
      - name: E2E tests
        run: pnpm test:e2e
```

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Database Migrations

### Supabase Migrations

**Entwicklung:**
```bash
# Neue Migration erstellen
supabase migration new add_users_table

# Migration anwenden (lokal)
supabase db push

# Schema zu TypeScript Types
supabase gen types typescript --local > types/supabase.ts
```

**Production:**
```bash
# Migration zu Supabase Cloud pushen
supabase db push --db-url $DATABASE_URL

# Oder via Supabase Dashboard
# → Database → Migrations → Run
```

**Migration File Beispiel (supabase/migrations/xxx_add_users.sql):**
```sql
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own data
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);
```

---

## Monitoring & Analytics

### 1. Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Error Tracking (Sentry)

```bash
pnpm add @sentry/nextjs
```

**sentry.client.config.ts:**
```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

### 3. Logging

```typescript
// lib/logger.ts
export const logger = {
  info: (message: string, meta?: object) => {
    if (process.env.NODE_ENV === 'production') {
      // Send to logging service
    } else {
      console.log(message, meta);
    }
  },
  error: (error: Error, meta?: object) => {
    if (process.env.NODE_ENV === 'production') {
      // Send to error tracking
      Sentry.captureException(error, { extra: meta });
    } else {
      console.error(error, meta);
    }
  },
};
```

---

## Performance Optimization

### 1. Next.js Config

**next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image Optimization
  images: {
    domains: ['supabase.co', 'yourcdn.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Compression
  compress: true,
  
  // React Strict Mode
  reactStrictMode: true,
  
  // SWC Minification (schneller als Terser)
  swcMinify: true,
  
  // Experimental Features
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

module.exports = nextConfig;
```

### 2. Bundle Analysis

```bash
# Install
pnpm add -D @next/bundle-analyzer

# Analyze
ANALYZE=true pnpm build
```

**next.config.js:**
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
  // ... config
});
```

### 3. Caching Strategy

**React Query:**
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 min
      cacheTime: 10 * 60 * 1000,     // 10 min
      refetchOnWindowFocus: false,
    },
  },
});
```

**HTTP Caching (API Routes):**
```typescript
export async function GET() {
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
```

---

## Security Checklist

### Pre-Deployment

- [ ] Environment Variables validiert (Zod Schema)
- [ ] Keine Secrets in Code committed
- [ ] Content Security Policy konfiguriert
- [ ] CORS Settings überprüft
- [ ] Rate Limiting implementiert
- [ ] Input Validation (Zod) überall
- [ ] SQL Injection Prevention (Prepared Statements)
- [ ] XSS Prevention (React escaping + DOMPurify)
- [ ] CSRF Protection (Next.js built-in)
- [ ] HTTPS erzwungen (Vercel macht automatisch)

**Security Headers (next.config.js):**
```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

---

## Deployment Checklist

### Pre-Launch
- [ ] Tests passing (Unit + E2E)
- [ ] TypeScript errors: 0
- [ ] ESLint warnings behoben
- [ ] Performance getestet (Lighthouse Score >90)
- [ ] Mobile Responsiveness geprüft
- [ ] Browser Compatibility getestet
- [ ] SEO Meta Tags konfiguriert
- [ ] Favicon & Assets optimiert
- [ ] 404 & Error Pages erstellt
- [ ] Analytics installiert
- [ ] Error Tracking konfiguriert (Sentry)

### Environment Setup
- [ ] Production Environment Variables gesetzt
- [ ] Database Migrations applied
- [ ] Supabase Production Setup
- [ ] Stripe (oder Payment) Production Keys
- [ ] Domain konfiguriert
- [ ] SSL/TLS aktiviert

### Post-Deployment
- [ ] Smoke Tests durchgeführt
- [ ] Monitoring aktiv
- [ ] Backup Strategy definiert
- [ ] Incident Response Plan

---

## Rollback Strategy

### Vercel
```bash
# Automatisches Rollback via Dashboard
# Deployments → Previous Deployment → Promote to Production

# Oder via CLI
vercel rollback
```

### Docker/Self-Hosted
```bash
# Tag previous image
docker tag myapp:v1.0.1 myapp:latest

# Restart container
docker-compose up -d
```

---

## Backup & Recovery

### Database Backups (Supabase)
- Automatische Backups täglich (Supabase Pro+)
- Point-in-Time Recovery (PITR)

**Manual Backup:**
```bash
# PostgreSQL Dump
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Code Backups
- Git Repository (GitHub/GitLab)
- Deployment History (Vercel speichert alle Deployments)

---

## Scaling Strategy

### Phase 1: Landing Page
- Static Hosting
- CDN (Vercel Edge Network)
- Keine DB nötig

### Phase 2: Authentication
- Supabase (Auto-scales)
- Server Components + Client Components Mix

### Phase 3: Features
- React Query Caching
- Incremental Static Regeneration (ISR)
- Edge Functions für API Routes

### Phase 4: High Traffic
- Redis für Session Storage
- Database Read Replicas
- CDN für Assets
- Rate Limiting

---

## Kosten-Übersicht (Estimated)

### Free Tier (Startup Phase)
- **Vercel**: Free (Hobby Plan)
  - 100 GB Bandwidth
  - Unlimited Deployments
  - Custom Domain
  
- **Supabase**: Free
  - 500 MB Database
  - 1 GB File Storage
  - 50.000 Auth Users
  - 2 GB Bandwidth

- **GitHub**: Free (Public Repo)

**Total:** €0/Monat

### Production (Small Scale)
- **Vercel Pro**: €20/Monat
- **Supabase Pro**: €25/Monat
- **Domain**: €10/Jahr

**Total:** ~€45/Monat

---

**Zusammenfassung:**
- Vercel für einfaches Deployment
- GitHub Actions für CI/CD
- Supabase für Backend & DB
- Monitoring & Analytics von Anfang an
- Security Best Practices einhalten

**Ready to deploy!** 🚀

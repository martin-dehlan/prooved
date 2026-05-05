# Folder Structure & Konventionen

## Gesamtstruktur

```
app-website/
├── .github/                    # GitHub Actions, Workflows
├── .husky/                     # Git Hooks
├── .vscode/                    # VSCode Settings (optional)
├── docs/                       # Diese Dokumentation
├── public/                     # Static Assets
│   ├── images/
│   ├── fonts/
│   └── favicon.ico
├── src/
│   ├── app/                    # Next.js App Router (Pages & API Routes)
│   ├── features/               # Feature Modules
│   ├── shared/                 # Shared Code
│   └── config/                 # Configuration
├── tests/                      # E2E & Integration Tests
├── .env.local                  # Environment Variables (gitignored)
├── .env.example                # Example Env File
├── .eslintrc.json             # ESLint Config
├── .gitignore
├── .prettierrc                # Prettier Config
├── next.config.js             # Next.js Config
├── package.json
├── pnpm-lock.yaml
├── tailwind.config.ts         # Tailwind Config
├── tsconfig.json              # TypeScript Config
└── vitest.config.ts           # Test Config
```

---

## `/src` Directory (Hauptcode)

### `/src/app` - Next.js App Router

**File-based Routing:**

```
src/app/
├── layout.tsx                 # Root Layout (Wrapper für alle Pages)
├── page.tsx                   # Homepage (/)
├── loading.tsx                # Loading UI
├── error.tsx                  # Error UI
├── not-found.tsx              # 404 Page
│
├── (marketing)/               # Route Group (kein URL Segment)
│   ├── about/
│   │   └── page.tsx          # /about
│   └── pricing/
│       └── page.tsx          # /pricing
│
├── register/
│   └── page.tsx              # /register (Magic Link Form)
│
├── dashboard/                 # Protected Routes (auth required)
│   ├── layout.tsx            # Dashboard Layout (Auth Guard)
│   ├── page.tsx              # /dashboard (Connection Overview)
│   ├── connect/
│   │   ├── page.tsx          # /dashboard/connect (Plattform-Übersicht)
│   │   ├── ebay/page.tsx     # eBay OAuth Flow
│   │   ├── paypal/page.tsx   # PayPal OAuth Flow
│   │   ├── vinted/page.tsx   # Vinted Bio-Code Flow
│   │   └── kleinanzeigen/page.tsx  # Kleinanzeigen Bio-Code Flow
│   └── privacy/
│       └── page.tsx          # /dashboard/privacy (Export, Wallet trennen, Löschen)
│
├── [slug]/                    # Public Profile (KEIN Auth, Server Component)
│   ├── page.tsx              # /[slug]
│   └── report/
│       └── page.tsx          # /[slug]/report
│
└── api/                       # API Routes
    ├── oauth/
    │   ├── ebay/callback/route.ts
    │   └── paypal/callback/route.ts
    ├── verify/
    │   └── bio-code/route.ts        # POST — Bio-Code prüfen
    ├── refresh/
    │   └── [connectionId]/route.ts  # POST — Plattformdaten neu laden
    ├── wallet/
    │   ├── nonce/route.ts            # GET — Nonce für Wallet-Signatur
    │   └── verify/route.ts           # POST — Signatur verifizieren
    └── export/
        └── signed/route.ts           # GET — Signiertes JSON
```

**Wichtige Konventionen:**
- `page.tsx` = Route Page Component
- `layout.tsx` = Shared Layout
- `loading.tsx` = Loading State (Suspense Fallback)
- `error.tsx` = Error Boundary
- `route.ts` = API Route Handler
- `(folder)` = Route Group (URL nicht betroffen)
- `[param]` = Dynamic Route

**Beispiel page.tsx:**
```typescript
// src/app/dashboard/page.tsx
import { ConnectionList } from '@/features/connections';

export default async function DashboardPage() {
  return <ConnectionList />;
}
```

**Beispiel API Route:**
```typescript
// src/app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const users = await fetchUsers();
  return NextResponse.json(users);
}
```

---

### `/src/features` - Feature Modules

**Feature-First Architektur:**

```
src/features/
├── landing/                   # Landing Page Feature
│   ├── components/
│   │   ├── Hero.tsx
│   │   ├── FeatureGrid.tsx
│   │   └── CTASection.tsx
│   ├── index.ts              # Public API
│   └── LandingPage.tsx       # Main Component
│
├── auth/                      # Supabase Magic Link Auth
│   ├── components/
│   │   ├── MagicLinkForm.tsx
│   │   └── SlugOnboardingForm.tsx
│   ├── hooks/
│   │   ├── useAuth.ts        # Supabase session
│   │   └── useSlugAvailability.ts
│   ├── services/
│   │   └── authService.ts    # Supabase Auth wrapper
│   ├── types/
│   │   ├── auth.types.ts
│   │   └── auth.schemas.ts   # Zod schemas (slug rules)
│   └── index.ts
│
├── connections/               # Plattform-Verknüpfungen (eBay, PayPal, Vinted, Kleinanzeigen)
│   ├── components/
│   │   ├── ConnectionList.tsx
│   │   ├── PlatformCard.tsx
│   │   ├── ConnectEbayButton.tsx
│   │   ├── ConnectPayPalButton.tsx
│   │   ├── BioCodeFlow.tsx           # Vinted + Kleinanzeigen shared UI
│   │   └── ConnectionStatusBadge.tsx
│   ├── hooks/
│   │   ├── useConnections.ts
│   │   └── useRefreshConnection.ts
│   ├── services/
│   │   └── connectionService.ts
│   ├── types/
│   │   ├── connection.types.ts
│   │   └── connection.schemas.ts
│   └── index.ts
│
├── profile/                   # Öffentliches /[slug] Profil (kein Auth)
│   ├── components/
│   │   ├── PublicProfile.tsx        # Server Component
│   │   ├── PlatformBadge.tsx
│   │   ├── TierIndicator.tsx
│   │   ├── ExpiryWarning.tsx
│   │   └── WalletBadge.tsx          # optional
│   ├── hooks/
│   │   └── useProfile.ts
│   ├── services/
│   │   └── profileService.ts
│   └── index.ts
│
├── verify/                    # Bio-Code & OAuth Verify-Flows
│   ├── hooks/
│   │   └── useVerify.ts
│   ├── services/
│   │   └── verifyService.ts         # Token-Generierung, Server-Check
│   └── index.ts
│
├── report/                    # Profil-Meldesystem
│   ├── components/
│   │   └── ReportForm.tsx
│   ├── hooks/
│   │   └── useReport.ts
│   ├── services/
│   │   └── reportService.ts
│   └── index.ts
│
├── wallet/                    # Solana Wallet-Verifikation (optional, Phase 3)
│   ├── components/
│   │   ├── WalletConnectButton.tsx
│   │   └── WalletBadge.tsx
│   ├── hooks/
│   │   └── useWalletVerify.ts
│   ├── services/
│   │   └── walletService.ts         # nonce + signature verify
│   └── index.ts
│
└── export/                    # Signed Data Export (DSGVO + portable proof)
    ├── components/
    │   └── ExportButton.tsx
    ├── hooks/
    │   └── useExport.ts
    ├── services/
    │   └── exportService.ts         # Ed25519-signiertes JSON
    └── index.ts
```

**Feature Module Pattern:**

```typescript
// src/features/auth/index.ts - Public API
export { MagicLinkForm, SlugOnboardingForm } from './components';
export { useAuth, useSlugAvailability } from './hooks';
export type { User, AuthState } from './types/auth.types';
export { slugSchema, magicLinkSchema } from './types/auth.schemas';
```

**Verwendung in anderen Features:**
```typescript
// src/features/connections/components/ConnectionList.tsx
import { useAuth } from '@/features/auth';

export function ConnectionList() {
  const { user } = useAuth();
  // ...
}
```

---

### `/src/shared` - Shared Code

```
src/shared/
├── components/                # Reusable UI Components
│   ├── ui/                    # Basic UI Components
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── index.ts
│   ├── layout/                # Layout Components
│   │   ├── Container.tsx
│   │   ├── Section.tsx
│   │   └── Grid.tsx
│   └── feedback/              # Feedback Components
│       ├── Toast.tsx
│       ├── Spinner.tsx
│       └── ErrorMessage.tsx
│
├── hooks/                     # Shared Custom Hooks
│   ├── useLocalStorage.ts
│   ├── useMediaQuery.ts
│   ├── useDebounce.ts
│   └── index.ts
│
├── lib/                       # Utility Functions & Helpers
│   ├── api/
│   │   ├── client.ts         # Base API Client
│   │   └── errorHandling.ts
│   ├── utils/
│   │   ├── cn.ts             # classnames utility
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── constants/
│   │   ├── routes.ts
│   │   └── config.ts
│   └── index.ts
│
├── stores/                    # Global Zustand Stores
│   ├── uiStore.ts            # UI State (theme, sidebar, etc.)
│   ├── userPreferencesStore.ts
│   └── index.ts
│
├── types/                     # Shared TypeScript Types
│   ├── global.types.ts
│   ├── api.types.ts
│   └── index.ts
│
└── providers/                 # React Context Providers
    ├── QueryProvider.tsx     # React Query Provider
    ├── ThemeProvider.tsx
    └── index.ts
```

**Beispiel Shared Component:**
```typescript
// src/shared/components/ui/Button/Button.tsx
import { forwardRef } from 'react';
import { cn } from '@/shared/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'rounded-md font-medium transition-colors',
          {
            'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
            'bg-gray-200 text-gray-900 hover:bg-gray-300': variant === 'secondary',
            'px-3 py-1.5 text-sm': size === 'sm',
            'px-4 py-2 text-base': size === 'md',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';
```

**Beispiel Shared Hook:**
```typescript
// src/shared/hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}
```

---

### `/src/config` - Configuration

```
src/config/
├── env.ts                     # Environment Variables (typed)
├── site.ts                    # Site Metadata
├── queryClient.ts            # React Query Config
└── supabase.ts               # Supabase Client
```

**Beispiel env.ts:**
```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  STRIPE_SECRET_KEY: z.string().optional(),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
});
```

**Beispiel site.ts:**
```typescript
// src/config/site.ts
export const siteConfig = {
  name: 'My App',
  description: 'An awesome app built with Next.js',
  url: 'https://myapp.com',
  ogImage: 'https://myapp.com/og.jpg',
  links: {
    twitter: 'https://twitter.com/myapp',
    github: 'https://github.com/myapp',
  },
};
```

---

## Naming Conventions

### Files & Folders

**React Components:**
```
PascalCase.tsx         # Hero.tsx, LoginForm.tsx
```

**Hooks:**
```
camelCase.ts           # useAuth.ts, useLocalStorage.ts
```

**Utilities & Services:**
```
camelCase.ts           # formatDate.ts, authService.ts
```

**Types & Schemas:**
```
camelCase.types.ts     # auth.types.ts
camelCase.schemas.ts   # user.schemas.ts
```

**Constants:**
```
SCREAMING_SNAKE_CASE   # MAX_FILE_SIZE, API_ENDPOINTS
```

### Components

```typescript
// ✅ Good - PascalCase, beschreibend
export function UserProfileCard() {}
export function DashboardLayout() {}

// ❌ Bad
export function userCard() {}
export function layout() {}
```

### Variables & Functions

```typescript
// ✅ Good - camelCase, beschreibend
const userName = 'John';
function fetchUserData() {}

// ❌ Bad
const UserName = 'John';
function fetch_user_data() {}
```

### Types & Interfaces

```typescript
// ✅ Good - PascalCase, Interface prefix optional
interface User {}
type UserRole = 'admin' | 'user';

// ❌ Bad
interface IUser {}  // Kein I-Prefix (TypeScript Convention)
type userRole = 'admin' | 'user';
```

---

## Import Aliases

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/config/*": ["./src/config/*"]
    }
  }
}
```

**Verwendung:**
```typescript
// ✅ Good - Absolute Imports
import { Button } from '@/shared/components/ui';
import { useAuth } from '@/features/auth';
import { env } from '@/config/env';

// ❌ Bad - Relative Imports über mehrere Ebenen
import { Button } from '../../../shared/components/ui';
```

---

## Import Order

**Reihenfolge:**
```typescript
// 1. External Libraries
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal Absolute Imports (Features)
import { useAuth } from '@/features/auth';

// 3. Internal Absolute Imports (Shared)
import { Button } from '@/shared/components/ui';
import { cn } from '@/shared/lib/utils';

// 4. Types
import type { User } from '@/shared/types';

// 5. Relative Imports (innerhalb des Features)
import { UserCard } from './UserCard';

// 6. Styles (wenn nötig)
import styles from './Component.module.css';
```

---

## Feature Isolation Rules

### ✅ Erlaubt

```typescript
// Feature kann shared verwenden
import { Button } from '@/shared/components/ui';

// Feature kann config verwenden
import { env } from '@/config/env';
```

### ❌ Nicht erlaubt

```typescript
// Feature darf NICHT direkt andere Features importieren
// ❌ Bad
import { LoginForm } from '@/features/auth';

// ✅ Good - Über shared, falls nötig
// Entweder: Feature-Unabhängigkeit wahren
// Oder: Shared Component/Hook erstellen
```

**Ausnahme:** Wenn Features wirklich abhängig sind, dann explizit dokumentieren.

---

## Code Organization Rules

### 1. Gruppierung nach Funktion, nicht nach Typ

```
// ✅ Good - Feature-based
/features/auth/
  components/
  hooks/
  services/

// ❌ Bad - Layer-based (für Features)
/components/
  LoginForm.tsx
  RegisterForm.tsx
/hooks/
  useAuth.ts
/services/
  authService.ts
```

### 2. Index Files für Clean Exports

```typescript
// features/auth/index.ts
export { LoginForm, RegisterForm } from './components';
export { useAuth } from './hooks';
export type { User, AuthState } from './types/auth.types';
```

### 3. Maximal 3 Ordner-Ebenen in Features

```
// ✅ Good
/features/auth/components/LoginForm.tsx

// ❌ Bad - zu tief verschachtelt
/features/auth/components/forms/login/LoginForm.tsx
```

---

## File Size Guidelines

- **Components:** Max 300 Zeilen → Split in kleinere Components
- **Hooks:** Max 150 Zeilen → Extract Logic
- **Services:** Max 200 Zeilen → Split by Responsibility
- **Types:** Beliebig (aber gruppiert nach Zusammengehörigkeit)

---

## Testing Structure

```
src/features/auth/
├── components/
│   ├── LoginForm.tsx
│   └── __tests__/
│       └── LoginForm.test.tsx
├── hooks/
│   ├── useAuth.ts
│   └── __tests__/
│       └── useAuth.test.ts
└── services/
    ├── authService.ts
    └── __tests__/
        └── authService.test.ts
```

**Alternativ:**
```
tests/
├── unit/
│   └── features/
│       └── auth/
├── integration/
└── e2e/
    └── auth.spec.ts
```

---

## Environment Files

```
.env.local              # Local Development (gitignored)
.env.development        # Development
.env.production         # Production
.env.example            # Template (committed)
```

---

**Zusammenfassung:**
- Features sind isoliert und in sich geschlossen
- Shared Code ist wirklich geteilt
- Klare Naming Conventions
- Absolute Imports mit Aliases
- Tests nahe am Code

**Nächste Schritte:**
1. Lese `CODING_STANDARDS.md` für Code-Style
2. Lese `COMPONENT_GUIDELINES.md` für React Patterns

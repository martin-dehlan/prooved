# Tech Stack Dokumentation

## Overview

Unser Stack ist optimiert für:
- **Type Safety** (wie du es aus Dart/Flutter kennst)
- **Developer Experience** (ähnlich wie Riverpod, Drift, Retrofit)
- **Scalability** (von Landing Page zu komplexer Enterprise-App)
- **Modern Best Practices** (2024/2025 Standards)

---

## Core Framework

### Next.js 14+ (App Router)

**Warum Next.js?**
- React Framework mit File-based Routing
- Server + Client Components (Performance)
- Built-in API Routes (Backend in derselben App)
- SEO Optimierung (SSR/SSG)
- Automatisches Code Splitting
- Image Optimization

**Flutter-Vergleich:**
- Flutter Router → Next.js App Router (File-based)
- Flutter Widgets → React Components
- StatelessWidget → React Function Component
- StatefulWidget → React Component mit Hooks

**App Router vs Pages Router:**
```
✅ Wir nutzen: App Router (Modern, 2023+)
❌ Nicht Pages Router (Legacy, vor 2023)
```

**Beispiel Routing:**
```
/app/page.tsx              → /
/app/dashboard/page.tsx    → /dashboard
/app/blog/[slug]/page.tsx  → /blog/dynamic-slug
```

**Installation:**
```bash
npx create-next-app@latest my-app --typescript --tailwind --app
```

---

## Programming Language

### TypeScript (Strict Mode)

**Warum TypeScript?**
- Ähnlich zu Dart: Static Typing, Type Inference
- Compile-time Error Detection
- Best-in-class IDE Support
- Industry Standard für große Apps

**Flutter (Dart) → Next.js (TypeScript) Vergleich:**

```dart
// Dart
class User {
  final String id;
  final String? displayName;
  
  User({required this.id, this.displayName});
}

List<User> users = [];
```

```typescript
// TypeScript
interface User {
  id: string;
  displayName?: string;
}

const users: User[] = [];
```

**tsconfig.json (Strict Mode):**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## State Management

### 1. TanStack Query (React Query) - Server State

**Ersetzt:** Retrofit + FutureProvider in Flutter

**Warum React Query?**
- Caching, Refetching, Background Updates
- Optimistic Updates
- Pagination, Infinite Scroll
- Request Deduplication
- Automatic Retry Logic

**Features:**
```typescript
const { 
  data,           // Die Daten
  isLoading,      // Lädt gerade
  isError,        // Fehler aufgetreten
  error,          // Error Object
  refetch,        // Manuell neu laden
  isFetching,     // Background Refresh
} = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000,    // 5 min fresh
  cacheTime: 10 * 60 * 1000,   // 10 min cache
  retry: 3,
});
```

**Mutations (POST, PUT, DELETE):**
```typescript
const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries(['users']); // Refresh Liste
  },
  onError: (error) => {
    toast.error('Failed to create user');
  },
});

mutation.mutate({ name: 'John' });
```

**Installation:**
```bash
npm install @tanstack/react-query
```

---

### 2. Zustand - Client State

**Ersetzt:** StateNotifierProvider in Riverpod

**Warum Zustand?**
- Minimaler Boilerplate (einfacher als Redux)
- Kein Provider Wrapping nötig
- TypeScript-friendly
- React Hooks basiert
- Klein (1kb)

**Beispiel Store:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      sidebarOpen: false,
      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: 'ui-store' } // LocalStorage key
  )
);

// In Component:
const { theme, setTheme } = useUIStore();
```

**Wann Zustand nutzen?**
- UI State (Modals, Sidebars)
- User Preferences (Theme, Language)
- App-wide Configuration
- Temporary State (nicht in DB)

**Wann NICHT Zustand nutzen?**
- Server Daten → React Query
- Form State → React Hook Form
- URL State → Next.js Router

**Installation:**
```bash
npm install zustand
```

---

## Backend & Database

### Supabase - Backend as a Service

**Ersetzt:** Drift (SQLite) + Custom Backend

**Warum Supabase?**
- PostgreSQL Database (besser als SQLite für Web)
- Built-in Authentication
- Real-time Subscriptions (wie Drift Streams)
- Row Level Security (RLS)
- File Storage
- Edge Functions
- Auto-generated TypeScript Types

**Features:**
```typescript
// Database Query
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false });

// Realtime Subscription (wie Drift Stream)
const channel = supabase
  .channel('users-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'users' },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();

// Authentication
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
});

// File Upload
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('user-123.png', file);
```

**Type Generation:**
```bash
# Generiert TypeScript Types aus DB Schema
npx supabase gen types typescript --project-id "your-project" > types/supabase.ts
```

**Alternativen:**
- Firebase (Google Ecosystem)
- Prisma + Custom Backend (mehr Kontrolle)
- PocketBase (Self-hosted, ähnlich Supabase)

**Installation:**
```bash
npm install @supabase/supabase-js
```

---

## Validation & Schemas

### Zod - Runtime Type Validation

**Ersetzt:** Freezed + json_serializable in Flutter

**Warum Zod?**
- Runtime Validation (TypeScript ist nur compile-time)
- Schema → TypeScript Types (Inference)
- Form Validation
- API Response Validation
- Composable Schemas

**Beispiel:**
```typescript
import { z } from 'zod';

// Schema Definition
const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().min(2).max(50).optional(),
  age: z.number().int().positive().max(150),
  role: z.enum(['user', 'admin', 'moderator']),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime(),
});

// Type Inference
type User = z.infer<typeof userSchema>;

// Validation
function parseUser(data: unknown): User {
  return userSchema.parse(data); // Throws ZodError if invalid
}

// Safe Parsing (kein Throw)
const result = userSchema.safeParse(apiResponse);
if (result.success) {
  const user: User = result.data;
} else {
  console.error(result.error.errors);
}

// Partial Updates
const updateSchema = userSchema.partial();
```

**Flutter (Freezed) Vergleich:**
```dart
// Flutter
@freezed
class User with _$User {
  factory User({
    required String id,
    required String email,
    String? displayName,
  }) = _User;
  
  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}
```

```typescript
// Next.js
const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
});

type User = z.infer<typeof UserSchema>;

const user = UserSchema.parse(json);
```

**Installation:**
```bash
npm install zod
```

---

## Forms

### React Hook Form + Zod

**Warum React Hook Form?**
- Performance (minimale Re-renders)
- Built-in Validation
- Zod Integration
- Type-safe

**Beispiel:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    await login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}
      
      <button disabled={isSubmitting}>Login</button>
    </form>
  );
}
```

**Installation:**
```bash
npm install react-hook-form @hookform/resolvers
```

---

## Styling

### Tailwind CSS

**Warum Tailwind?**
- Utility-First (schnelles Prototyping)
- Kein CSS-in-JS Runtime Overhead
- Design System built-in
- Responsive Design einfach
- Dark Mode Support
- Tree-shaking (nur genutztes CSS)

**Beispiel:**
```tsx
<div className="flex flex-col gap-4 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
    Welcome
  </h1>
  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
    Click me
  </button>
</div>
```

**Responsive Design:**
```tsx
<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Mobile: 100%, Tablet: 50%, Desktop: 33.33% */}
</div>
```

**Custom Theme (tailwind.config.ts):**
```typescript
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c4a6e',
        },
      },
    },
  },
};
```

**Alternativen:**
- CSS Modules (mehr Isolation)
- Styled Components (CSS-in-JS)
- Vanilla CSS (maximale Kontrolle)

**Installation:**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

---

## UI Components (Optional)

### shadcn/ui

**Warum shadcn/ui?**
- Copy-Paste Components (kein NPM Package)
- Tailwind-basiert
- Radix UI Primitives (Accessibility)
- Anpassbar (du besitzt den Code)

**Beispiel Components:**
- Button, Dialog, Dropdown, Toast
- Form Components
- Data Tables
- Charts

**Installation:**
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
```

**Alternativen:**
- Headless UI (Tailwind Team)
- Radix UI (Primitives only)
- Material UI (Google Design)
- Chakra UI (All-in-one)

---

## Additional Tools

### 1. Date Handling - date-fns

```typescript
import { format, parseISO, addDays } from 'date-fns';

const formatted = format(new Date(), 'yyyy-MM-dd');
const nextWeek = addDays(new Date(), 7);
```

**Alternativen:** Day.js, Luxon

---

### 2. HTTP Client - Fetch API (Native)

```typescript
// Native Fetch mit TypeScript
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error('Failed to fetch');
  const data = await response.json();
  return UserSchema.parse(data); // Zod Validation
}
```

**Mit React Query:**
```typescript
const { data: user } = useQuery({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
});
```

**Alternativen:** Axios (mehr Features)

---

### 3. Icons - Lucide React

```typescript
import { Home, User, Settings } from 'lucide-react';

<Home className="w-6 h-6" />
```

**Alternativen:** React Icons, Heroicons

---

### 4. Payments - Stripe

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

```typescript
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_...');
```

---

### 5. Analytics - Vercel Analytics / PostHog

```bash
npm install @vercel/analytics
```

```typescript
import { Analytics } from '@vercel/analytics/react';

<Analytics />
```

---

## Development Tools

### 1. ESLint + Prettier

```bash
npm install -D eslint prettier eslint-config-prettier
```

**eslint.config.js:**
```javascript
export default {
  extends: ['next/core-web-vitals', 'prettier'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
  },
};
```

---

### 2. Testing

**Vitest (Unit Tests):**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Playwright (E2E Tests):**
```bash
npm install -D @playwright/test
```

---

### 3. Git Hooks - Husky

```bash
npm install -D husky lint-staged
npx husky init
```

**Pre-commit:** Lint + Format

---

## Package Manager

### pnpm (Empfohlen)

**Warum pnpm?**
- Schneller als npm/yarn
- Disk Space Effizienz
- Strict Node Modules
- Monorepo Support

```bash
npm install -g pnpm
pnpm install
pnpm dev
```

**Alternativen:** npm, yarn, bun

---

## Deployment

### Vercel (Empfohlen für Next.js)

**Warum Vercel?**
- Next.js Creator
- Automatisches Deployment (Git Push)
- Edge Functions
- Image Optimization
- Analytics
- Kostenlos für Hobby

**Alternative:** Netlify, Railway, Fly.io

---

## Complete Package List

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    
    "@tanstack/react-query": "^5.28.0",
    "zustand": "^4.5.0",
    
    "@supabase/supabase-js": "^2.40.0",
    
    "zod": "^3.22.0",
    "react-hook-form": "^7.51.0",
    "@hookform/resolvers": "^3.3.0",
    
    "tailwindcss": "^3.4.0",
    
    "date-fns": "^3.3.0",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@types/react": "^18.2.0",
    "typescript": "^5.3.0",
    
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.2.0",
    "prettier": "^3.2.0",
    
    "vitest": "^1.3.0",
    "@testing-library/react": "^14.2.0",
    "@playwright/test": "^1.42.0"
  }
}
```

---

## Stack Vergleich: Flutter vs Next.js

| Funktion | Flutter | Next.js (Unser Stack) |
|----------|---------|----------------------|
| State Management | Riverpod | Zustand + React Query |
| Database | Drift (SQLite) | Supabase (PostgreSQL) |
| API Client | Retrofit | Fetch + React Query |
| Data Classes | Freezed | Zod + TypeScript |
| Routing | go_router | Next.js App Router |
| UI Framework | Flutter Widgets | React + Tailwind |
| Forms | flutter_form_builder | React Hook Form |
| Validation | Built-in + custom | Zod |
| Testing | flutter_test | Vitest + Playwright |
| Package Manager | pub | pnpm |

---

**Nächste Schritte:**
1. Lese `FOLDER_STRUCTURE.md` für Projektorganisation
2. Lese `CODING_STANDARDS.md` für Code-Konventionen

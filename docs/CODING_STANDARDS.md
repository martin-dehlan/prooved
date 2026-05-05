# Coding Standards & Best Practices

## TypeScript Standards

### 1. Strict Mode (Immer aktiviert)

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 2. Type Annotations

**✅ Good - Explizite Return Types für Functions:**
```typescript
// Public APIs immer mit Return Type
export function fetchUser(id: string): Promise<User> {
  return apiClient.get(`/users/${id}`);
}

// Interne Helper können inference nutzen
function formatName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`;
}
```

**✅ Good - Interfaces für Object Shapes:**
```typescript
interface User {
  id: string;
  email: string;
  displayName?: string;
  createdAt: Date;
}
```

**✅ Good - Type für Unions & Primitives:**
```typescript
type Status = 'idle' | 'loading' | 'success' | 'error';
type ID = string | number;
```

**❌ Bad - any verwenden:**
```typescript
// ❌ Niemals any!
function processData(data: any) { }

// ✅ Nutze unknown für unbekannte Daten
function processData(data: unknown) {
  if (typeof data === 'string') {
    // Type Guard
  }
}
```

### 3. Type Guards & Narrowing

```typescript
// Type Guard Function
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value
  );
}

// Verwendung
function processData(data: unknown) {
  if (isUser(data)) {
    console.log(data.email); // Type ist jetzt User
  }
}
```

### 4. Generics

```typescript
// ✅ Good - Generic Response Type
interface ApiResponse<T> {
  data: T;
  error: string | null;
  meta: {
    timestamp: string;
  };
}

// Verwendung
type UserResponse = ApiResponse<User>;

// Generic Function
function createStore<T>(initialState: T) {
  // ...
  return {
    getState: (): T => { /* ... */ },
    setState: (state: T) => { /* ... */ },
  };
}
```

### 5. Utility Types

```typescript
// Partial - Alle Properties optional
type PartialUser = Partial<User>;

// Pick - Nur bestimmte Properties
type UserPreview = Pick<User, 'id' | 'displayName'>;

// Omit - Bestimmte Properties weglassen
type UserWithoutEmail = Omit<User, 'email'>;

// Required - Alle Properties required
type CompleteUser = Required<User>;

// Record - Key-Value Map
type UserMap = Record<string, User>;
```

---

## React & Next.js Standards

### 1. Component Definition

**✅ Good - Named Function (empfohlen):**
```typescript
export function UserCard({ user }: UserCardProps) {
  return <div>{user.name}</div>;
}
```

**✅ Good - Arrow Function (akzeptabel):**
```typescript
export const UserCard = ({ user }: UserCardProps) => {
  return <div>{user.name}</div>;
};
```

**❌ Bad - Default Export ohne Namen:**
```typescript
export default ({ user }) => <div>{user.name}</div>;
```

### 2. Props Definition

**✅ Good - Interface für Props:**
```typescript
interface UserCardProps {
  user: User;
  onEdit?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function UserCard({ user, onEdit, className, children }: UserCardProps) {
  // ...
}
```

**✅ Good - Destructuring mit Default Values:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  variant = 'primary', 
  size = 'md',
  ...props 
}: ButtonProps) {
  // ...
}
```

### 3. Server vs Client Components

**Server Component (Default):**
```typescript
// Keine 'use client' Directive = Server Component
// Kann async sein
export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await fetchUser(params.id);
  return <UserProfile user={user} />;
}
```

**Client Component:**
```typescript
'use client'; // Explizit markieren

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**Wann Client Component?**
- `useState`, `useEffect`, andere Hooks
- Event Handlers (`onClick`, `onChange`)
- Browser APIs (`window`, `localStorage`)
- React Context Consumer
- Third-party Libraries die Browser APIs nutzen

**Wann Server Component?**
- Daten fetching (direkt in Component)
- Statischer Content
- SEO-relevant
- Keine Interaktivität

### 4. Hooks Rules

**✅ Good - Custom Hook Pattern:**
```typescript
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Auth Logic
  }, []);

  return {
    user,
    isLoading,
    login: async (credentials: LoginCredentials) => { },
    logout: async () => { },
  };
}
```

**✅ Good - Dependency Array korrekt:**
```typescript
useEffect(() => {
  fetchUser(userId);
}, [userId]); // userId in deps

// ❌ Bad
useEffect(() => {
  fetchUser(userId);
}, []); // Missing dependency
```

**✅ Good - Cleanup in useEffect:**
```typescript
useEffect(() => {
  const subscription = subscribeToUpdates();
  
  return () => {
    subscription.unsubscribe(); // Cleanup
  };
}, []);
```

### 5. State Management

**React Query für Server State:**
```typescript
export function useUser(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000, // 5 min
    cacheTime: 10 * 60 * 1000, // 10 min
  });
}

// Verwendung
const { data: user, isLoading, error } = useUser('123');
```

**Zustand für Client State:**
```typescript
import { create } from 'zustand';

interface UIStore {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIStore>((set) => ({
  theme: 'dark',
  setTheme: (theme) => set({ theme }),
}));

// Verwendung
const theme = useUIStore((state) => state.theme);
const setTheme = useUIStore((state) => state.setTheme);
```

---

## Code Style

### 1. Formatting (Prettier)

**.prettierrc:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

### 2. ESLint Rules

**.eslintrc.json:**
```json
{
  "extends": ["next/core-web-vitals", "prettier"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

### 3. Naming

```typescript
// ✅ Components - PascalCase
export function UserCard() {}

// ✅ Functions - camelCase
export function formatDate() {}

// ✅ Constants - SCREAMING_SNAKE_CASE
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

// ✅ Types/Interfaces - PascalCase
interface User {}
type Status = 'active' | 'inactive';

// ✅ Boolean Variables - is/has prefix
const isLoading = true;
const hasError = false;
const canEdit = true;

// ✅ Event Handlers - handle/on prefix
const handleClick = () => {};
const onSubmit = () => {};
```

### 4. File Organization

```typescript
// 1. Imports
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Types/Interfaces
interface UserCardProps {
  user: User;
}

// 3. Constants (außerhalb Component)
const MAX_RETRIES = 3;

// 4. Helper Functions (außerhalb Component)
function formatUserName(user: User): string {
  return `${user.firstName} ${user.lastName}`;
}

// 5. Component
export function UserCard({ user }: UserCardProps) {
  // 5a. Hooks
  const [isExpanded, setIsExpanded] = useState(false);
  const { data } = useQuery(/* ... */);
  
  // 5b. Event Handlers
  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };
  
  // 5c. Derived State
  const fullName = formatUserName(user);
  
  // 5d. Render
  return (
    <div onClick={handleToggle}>
      {fullName}
    </div>
  );
}
```

---

## Error Handling

### 1. Try-Catch Pattern

```typescript
// ✅ Good - Spezifische Error Handling
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return UserSchema.parse(data); // Zod Validation
  } catch (error) {
    if (error instanceof ZodError) {
      console.error('Validation error:', error.errors);
      throw new ValidationError('Invalid user data');
    }
    
    if (error instanceof Error) {
      console.error('Fetch error:', error.message);
    }
    
    throw error;
  }
}
```

### 2. Custom Error Classes

```typescript
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}
```

### 3. React Error Boundaries

```typescript
'use client';

import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>;
    }

    return this.props.children;
  }
}
```

---

## Performance Best Practices

### 1. Memoization

```typescript
import { memo, useMemo, useCallback } from 'react';

// Component Memoization
export const UserCard = memo(function UserCard({ user }: UserCardProps) {
  return <div>{user.name}</div>;
});

// Value Memoization
function UserList({ users }: { users: User[] }) {
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);
  
  return <div>{/* ... */}</div>;
}

// Function Memoization
function UserForm() {
  const handleSubmit = useCallback((data: FormData) => {
    // Submit logic
  }, []); // Nur neu erstellen wenn deps ändern
  
  return <form onSubmit={handleSubmit}>{/* ... */}</form>;
}
```

**Wann Memoization?**
- Teure Berechnungen (Filter, Sort von großen Arrays)
- Callbacks an memoized Child Components
- Nicht standardmäßig! Nur bei Performance-Problemen

### 2. Code Splitting

```typescript
// Dynamic Import
import dynamic from 'next/dynamic';

const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <div>Loading chart...</div>,
  ssr: false, // Optional: disable SSR
});

export function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <HeavyChart />
    </div>
  );
}
```

### 3. Image Optimization

```typescript
import Image from 'next/image';

// ✅ Good - Next.js Image Component
<Image
  src="/profile.jpg"
  alt="User profile"
  width={200}
  height={200}
  priority // Für above-the-fold images
/>

// ❌ Bad
<img src="/profile.jpg" alt="User profile" />
```

---

## Security Best Practices

### 1. Input Validation

```typescript
// ✅ Always validate user input
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function login(data: unknown) {
  const validated = loginSchema.parse(data); // Throws if invalid
  // Process validated.email, validated.password
}
```

### 2. XSS Prevention

```typescript
// ✅ React escapes by default
<div>{userInput}</div> // Safe

// ⚠️ Vorsicht mit dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />

// Nutze DOMPurify für HTML Sanitization
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(dirtyHTML);
```

### 3. API Routes Security

```typescript
// app/api/admin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  // 1. Authentication
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // 2. Authorization
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // 3. Input Validation
  const body = await request.json();
  const validated = schema.parse(body);
  
  // 4. Business Logic
  // ...
}
```

### 4. Environment Variables

```typescript
// ✅ Nutze Zod für Validation
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(32),
});

export const env = envSchema.parse(process.env);

// ⚠️ NEXT_PUBLIC_ prefix macht Vars client-sichtbar!
// Nur für wirklich public Daten:
NEXT_PUBLIC_SUPABASE_URL=...

// Private Vars OHNE Prefix:
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Comments & Documentation

### 1. JSDoc für Public APIs

```typescript
/**
 * Fetches a user by ID from the database.
 * 
 * @param id - The unique user identifier
 * @returns A Promise resolving to the User object
 * @throws {NotFoundError} If user doesn't exist
 * @throws {ValidationError} If ID format is invalid
 * 
 * @example
 * ```ts
 * const user = await fetchUser('user-123');
 * console.log(user.email);
 * ```
 */
export async function fetchUser(id: string): Promise<User> {
  // ...
}
```

### 2. Inline Comments

```typescript
// ✅ Good - Erklärt WARUM, nicht WAS
// We need to debounce because the API rate limits us to 10 req/sec
const debouncedSearch = debounce(search, 100);

// ❌ Bad - Erklärt offensichtliches
// Set user to null
const user = null;
```

### 3. TODO Comments

```typescript
// TODO: Add pagination support (Issue #123)
// FIXME: Race condition when rapid clicking (Issue #456)
// NOTE: This is a temporary workaround until API v2 is ready
```

---

## Testing Guidelines

### 1. Test File Naming

```
Component.tsx       → Component.test.tsx
useAuth.ts          → useAuth.test.ts
authService.ts      → authService.test.ts
```

### 2. Test Structure

```typescript
import { render, screen } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('renders user name', () => {
    const user = { id: '1', name: 'John Doe' };
    render(<UserCard user={user} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
  
  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    const user = { id: '1', name: 'John Doe' };
    
    render(<UserCard user={user} onEdit={onEdit} />);
    screen.getByRole('button', { name: /edit/i }).click();
    
    expect(onEdit).toHaveBeenCalledWith(user.id);
  });
});
```

---

## Git Commit Messages

```
feat: Add user authentication
fix: Resolve infinite loop in dashboard
docs: Update API documentation
style: Format code with prettier
refactor: Simplify auth logic
test: Add tests for UserCard component
chore: Update dependencies
```

---

## Code Review Checklist

- [ ] TypeScript strict mode enabled, no `any`
- [ ] Props properly typed
- [ ] Error handling implemented
- [ ] Server/Client components correctly used
- [ ] Performance optimizations where needed
- [ ] Security best practices followed
- [ ] Tests added/updated
- [ ] No console.logs in production code
- [ ] Accessibility considered (a11y)
- [ ] Responsive design implemented

---

**Nächste Schritte:**
1. Lese `COMPONENT_GUIDELINES.md` für React Component Patterns
2. Lese `DEPLOYMENT.md` für Build & Deploy Strategie

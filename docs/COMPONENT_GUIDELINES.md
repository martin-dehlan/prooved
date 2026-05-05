# Component Guidelines & Patterns

## Component Architecture

### Component Hierarchie

```
Page Component (Server Component)
    ↓
Feature Container (Client Component)
    ↓
Feature-specific Components
    ↓
Shared UI Components (Button, Input, etc.)
```

---

## Component Types

### 1. Page Components (Next.js App Router)

**Server Component (Default):**
```typescript
// app/dashboard/page.tsx
import { DashboardView } from '@/features/dashboard';

export default async function DashboardPage() {
  // Server-side data fetching
  const stats = await fetchDashboardStats();
  
  return <DashboardView initialStats={stats} />;
}
```

**Metadata Export:**
```typescript
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your personal dashboard',
};

export default function DashboardPage() {
  // ...
}
```

**Dynamic Metadata:**
```typescript
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const user = await fetchUser(params.id);
  
  return {
    title: `${user.name}'s Profile`,
    description: user.bio,
  };
}
```

---

### 2. Layout Components

```typescript
// app/dashboard/layout.tsx
import { Sidebar } from '@/features/dashboard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
```

---

### 3. Container Components (Smart Components)

**Client Component mit Business Logic:**
```typescript
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { UserList } from './UserList';
import { UserFilters } from './UserFilters';

export function UserManagement() {
  const [filters, setFilters] = useState({ role: 'all', status: 'active' });
  
  const { data: users, isLoading } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => fetchUsers(filters),
  });
  
  return (
    <div>
      <UserFilters filters={filters} onChange={setFilters} />
      <UserList users={users} isLoading={isLoading} />
    </div>
  );
}
```

**Characteristics:**
- Hat Business Logic
- Managed State
- Data Fetching
- Verbindet mehrere Presentation Components
- Minimal UI Code

---

### 4. Presentation Components (Dumb Components)

```typescript
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-bold">{user.name}</h3>
      <p className="text-sm text-gray-600">{user.email}</p>
      
      <div className="mt-4 flex gap-2">
        <Button onClick={() => onEdit(user.id)}>Edit</Button>
        <Button variant="danger" onClick={() => onDelete(user.id)}>
          Delete
        </Button>
      </div>
    </div>
  );
}
```

**Characteristics:**
- Keine Business Logic
- Empfängt Daten via Props
- Ruft Callbacks auf (keine eigene Logic)
- Fokus auf UI/Rendering
- Leicht testbar

---

### 5. Compound Components Pattern

```typescript
// Card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div className={cn('rounded-lg border bg-white shadow', className)}>
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="border-b p-4">{children}</div>;
};

Card.Body = function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="p-4">{children}</div>;
};

Card.Footer = function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="border-t p-4">{children}</div>;
};

// Usage
<Card>
  <Card.Header>
    <h2>Title</h2>
  </Card.Header>
  <Card.Body>
    <p>Content</p>
  </Card.Body>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

---

## Component Patterns

### 1. Render Props Pattern

```typescript
interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, isLoading: boolean, error: Error | null) => React.ReactNode;
}

export function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const { data, isLoading, error } = useQuery({
    queryKey: [url],
    queryFn: () => fetch(url).then((r) => r.json()),
  });
  
  return <>{children(data, isLoading, error)}</>;
}

// Usage
<DataFetcher<User[]> url="/api/users">
  {(users, isLoading, error) => {
    if (isLoading) return <Spinner />;
    if (error) return <Error message={error.message} />;
    return <UserList users={users} />;
  }}
</DataFetcher>
```

---

### 2. Custom Hook Pattern (Bevorzugt)

```typescript
// hooks/useUsers.ts
export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: ['users', filters],
    queryFn: () => fetchUsers(filters),
    staleTime: 5 * 60 * 1000,
  });
}

// Component
export function UserManagement() {
  const { data: users, isLoading, error } = useUsers();
  
  if (isLoading) return <Spinner />;
  if (error) return <Error />;
  
  return <UserList users={users} />;
}
```

---

### 3. Higher-Order Component (HOC) - Selten nutzen

```typescript
// ⚠️ Nur wenn wirklich nötig - Custom Hooks sind meist besser!
function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { user, isLoading } = useAuth();
    
    if (isLoading) return <Spinner />;
    if (!user) return <Navigate to="/login" />;
    
    return <Component {...props} />;
  };
}

// Usage
const ProtectedDashboard = withAuth(Dashboard);
```

**Besser mit Custom Hook:**
```typescript
export function Dashboard() {
  const { user, isLoading } = useRequireAuth(); // Redirect in Hook
  
  if (isLoading) return <Spinner />;
  
  return <div>Dashboard for {user.name}</div>;
}
```

---

### 4. Controlled vs Uncontrolled Components

**Controlled (Empfohlen für Forms):**
```typescript
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

**Uncontrolled (mit React Hook Form - Empfohlen für komplexe Forms):**
```typescript
import { useForm } from 'react-hook-form';

export function LoginForm() {
  const { register, handleSubmit } = useForm<LoginFormData>();
  
  const onSubmit = (data: LoginFormData) => {
    login(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      <input type="password" {...register('password')} />
      <button type="submit">Login</button>
    </form>
  );
}
```

---

## Props Patterns

### 1. Children Props

```typescript
interface ContainerProps {
  children: React.ReactNode;
}

export function Container({ children }: ContainerProps) {
  return <div className="container mx-auto px-4">{children}</div>;
}
```

### 2. Render Props

```typescript
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
}

export function List<T>({ items, renderItem, renderEmpty }: ListProps<T>) {
  if (items.length === 0) {
    return <>{renderEmpty?.() || <p>No items</p>}</>;
  }
  
  return (
    <ul>
      {items.map((item, index) => (
        <li key={index}>{renderItem(item, index)}</li>
      ))}
    </ul>
  );
}

// Usage
<List
  items={users}
  renderItem={(user) => <UserCard user={user} />}
  renderEmpty={() => <EmptyState />}
/>
```

### 3. Component Props

```typescript
interface ModalProps {
  trigger: React.ReactElement;
  content: React.ReactNode;
}

export function Modal({ trigger, content }: ModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      {React.cloneElement(trigger, { onClick: () => setIsOpen(true) })}
      {isOpen && <ModalContent onClose={() => setIsOpen(false)}>{content}</ModalContent>}
    </>
  );
}

// Usage
<Modal
  trigger={<Button>Open</Button>}
  content={<UserForm />}
/>
```

### 4. Spread Props Pattern

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded px-4 py-2',
        variant === 'primary' && 'bg-blue-600 text-white',
        className
      )}
      {...props}
    />
  );
}

// Usage - Alle HTML Button Props funktionieren
<Button onClick={handleClick} disabled={isLoading} type="submit">
  Submit
</Button>
```

---

## State Management in Components

### 1. Local State (useState)

```typescript
export function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

### 2. Form State (React Hook Form)

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function UserForm() {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });
  
  const onSubmit = async (data: UserFormData) => {
    await saveUser(data);
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('name')} />
      {errors.name && <span>{errors.name.message}</span>}
      
      <button disabled={isSubmitting}>Save</button>
    </form>
  );
}
```

### 3. Server State (React Query)

```typescript
export function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
  
  const updateMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['user', userId]);
    },
  });
  
  if (isLoading) return <Spinner />;
  
  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={() => updateMutation.mutate({ ...user, name: 'New Name' })}>
        Update
      </button>
    </div>
  );
}
```

### 4. Global State (Zustand)

```typescript
// store
const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

// Component
export function Layout() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  
  return (
    <div>
      <button onClick={toggleSidebar}>Toggle</button>
      {sidebarOpen && <Sidebar />}
    </div>
  );
}
```

---

## Composition Patterns

### 1. Layout Composition

```typescript
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// Usage in app/dashboard/layout.tsx
export default function Layout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
```

### 2. Slot Pattern

```typescript
interface PageProps {
  header: React.ReactNode;
  sidebar: React.ReactNode;
  content: React.ReactNode;
  footer?: React.ReactNode;
}

export function Page({ header, sidebar, content, footer }: PageProps) {
  return (
    <div className="grid grid-cols-[250px_1fr] grid-rows-[auto_1fr_auto] h-screen">
      <div className="col-span-2">{header}</div>
      <aside>{sidebar}</aside>
      <main>{content}</main>
      {footer && <div className="col-span-2">{footer}</div>}
    </div>
  );
}

// Usage
<Page
  header={<Header />}
  sidebar={<Sidebar />}
  content={<MainContent />}
  footer={<Footer />}
/>
```

---

## Performance Optimization

### 1. React.memo

```typescript
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
}

export const UserCard = memo(function UserCard({ user, onEdit }: UserCardProps) {
  console.log('Rendering UserCard for', user.id);
  
  return (
    <div>
      <h3>{user.name}</h3>
      <button onClick={() => onEdit(user.id)}>Edit</button>
    </div>
  );
});

// Optional: Custom comparison
export const UserCard = memo(
  UserCard,
  (prevProps, nextProps) => prevProps.user.id === nextProps.user.id
);
```

### 2. useMemo for Expensive Calculations

```typescript
export function UserList({ users }: { users: User[] }) {
  const sortedUsers = useMemo(() => {
    console.log('Sorting users');
    return [...users].sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);
  
  return (
    <ul>
      {sortedUsers.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

### 3. useCallback for Stable Functions

```typescript
export function ParentComponent() {
  const [count, setCount] = useState(0);
  
  // ❌ Ohne useCallback - neue Funktion bei jedem Render
  const handleClick = () => {
    console.log('Clicked');
  };
  
  // ✅ Mit useCallback - stabile Referenz
  const handleClickStable = useCallback(() => {
    console.log('Clicked');
  }, []);
  
  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      
      {/* MemoizedChild wird nicht neu gerendert wenn count sich ändert */}
      <MemoizedChild onClick={handleClickStable} />
    </>
  );
}
```

### 4. Code Splitting

```typescript
import dynamic from 'next/dynamic';

// Lazy load heavy component
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Spinner />,
  ssr: false, // Optional
});

export function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <HeavyChart data={chartData} />
    </div>
  );
}
```

---

## Accessibility (a11y)

### 1. Semantic HTML

```typescript
// ✅ Good
<nav>
  <ul>
    <li><a href="/home">Home</a></li>
  </ul>
</nav>

<main>
  <article>
    <h1>Title</h1>
    <p>Content</p>
  </article>
</main>

// ❌ Bad
<div className="nav">
  <div className="nav-item">Home</div>
</div>
```

### 2. ARIA Attributes

```typescript
export function Modal({ isOpen, onClose, children }: ModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <h2 id="modal-title">Modal Title</h2>
      <div id="modal-description">{children}</div>
      <button onClick={onClose} aria-label="Close modal">
        ×
      </button>
    </div>
  );
}
```

### 3. Keyboard Navigation

```typescript
export function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
    if (e.key === 'Enter' || e.key === ' ') {
      setIsOpen(!isOpen);
    }
  };
  
  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        Menu
      </button>
      {isOpen && (
        <ul role="menu">
          <li role="menuitem"><a href="/profile">Profile</a></li>
        </ul>
      )}
    </div>
  );
}
```

---

## Error Handling in Components

### 1. Error Boundary

```typescript
'use client';

export function FeatureErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <h2 className="text-red-800 font-bold">Something went wrong</h2>
          <p className="text-red-600">Please try refreshing the page.</p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
```

### 2. Loading & Error States

```typescript
export function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, error } = useUser(userId);
  
  if (isLoading) {
    return <Skeleton />;
  }
  
  if (error) {
    return (
      <ErrorState
        title="Failed to load user"
        message={error.message}
        retry={() => refetch()}
      />
    );
  }
  
  if (!user) {
    return <EmptyState message="User not found" />;
  }
  
  return <div>{user.name}</div>;
}
```

---

## Component Testing

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  };
  
  it('renders user information', () => {
    render(<UserCard user={mockUser} onEdit={vi.fn()} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
  
  it('calls onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();
    render(<UserCard user={mockUser} onEdit={onEdit} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    await userEvent.click(editButton);
    
    expect(onEdit).toHaveBeenCalledWith(mockUser.id);
  });
});
```

---

## Best Practices Summary

### ✅ DO
- Keep components small and focused (Single Responsibility)
- Use TypeScript for all components
- Prefer function components over class components
- Use custom hooks to extract logic
- Implement proper error boundaries
- Add loading and error states
- Use semantic HTML
- Make components accessible (a11y)
- Write tests for complex logic
- Use React Query for server state
- Memoize only when needed (measure first)

### ❌ DON'T
- Don't use inline styles (use Tailwind)
- Don't mutate state directly
- Don't use index as key in lists (if order can change)
- Don't put business logic in presentation components
- Don't forget cleanup in useEffect
- Don't overuse useCallback/useMemo without profiling
- Don't use class components (unless legacy)
- Don't ignore TypeScript errors
- Don't skip error handling

---

**Nächste Schritte:**
1. Lese `DEPLOYMENT.md` für Build & Deployment
2. Beginne mit der Implementierung der Landing Page

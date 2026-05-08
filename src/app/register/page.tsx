import { Suspense } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';
import { Logo } from '@/shared/components/ui/Logo';
import { RegisterFlow } from './RegisterFlow';

export const metadata = {
  title: 'Anmelden — Prooved',
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-bg">
      <header className="mx-auto flex max-w-md items-center justify-between px-5 py-6">
        <Link href="/" aria-label="Startseite">
          <Logo size={28} />
        </Link>
        <ThemeToggle />
      </header>
      <div className="mx-auto max-w-md px-5 pb-10">
        <Suspense fallback={<p className="text-base text-muted">Lade…</p>}>
          <RegisterFlow />
        </Suspense>
      </div>
    </main>
  );
}

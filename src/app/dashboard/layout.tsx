import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServer } from '@/shared/lib/supabase/server';
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle';
import { Logo } from '@/shared/components/ui/Logo';
import { LegalFooter } from '@/shared/components/LegalFooter';
import { SignOutButton } from './SignOutButton';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/register?redirect=/dashboard');

  const { data: appUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();
  if (!appUser) redirect('/register?redirect=/dashboard');

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-10 border-b border-elevated bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3">
          <Link href="/dashboard" aria-label="Dashboard">
            <Logo size={28} />
          </Link>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-5 py-8">{children}</main>
      <LegalFooter />
    </div>
  );
}

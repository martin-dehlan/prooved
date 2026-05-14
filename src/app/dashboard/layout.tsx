import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Settings } from 'lucide-react';
import { createSupabaseServer } from '@/shared/lib/supabase/server';
import { Logo } from '@/shared/components/ui/Logo';
import { LegalFooter } from '@/shared/components/LegalFooter';

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
          <Link
            href="/dashboard/settings"
            aria-label="Einstellungen"
            title="Einstellungen"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-text transition hover:bg-elevated"
          >
            <Settings size={18} aria-hidden />
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-5 py-8">{children}</main>
      <LegalFooter />
    </div>
  );
}

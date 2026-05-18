import { Settings } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link, redirect } from '@/i18n/navigation';
import { createSupabaseServer } from '@/shared/lib/supabase/server';
import { Logo } from '@/shared/components/ui/Logo';
import { LegalFooter } from '@/shared/components/LegalFooter';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer();
  const locale = await getLocale();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect({ href: '/register?redirect=/dashboard', locale });
    return null;
  }

  const { data: appUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();
  if (!appUser) {
    redirect({ href: '/register?redirect=/dashboard', locale });
    return null;
  }

  const t = await getTranslations('Dashboard');

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-10 border-b border-elevated bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3">
          <Link href="/dashboard" aria-label={t('ariaDashboard')}>
            <Logo size={28} />
          </Link>
          <Link
            href="/dashboard/settings"
            aria-label={t('ariaSettings')}
            title={t('ariaSettings')}
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

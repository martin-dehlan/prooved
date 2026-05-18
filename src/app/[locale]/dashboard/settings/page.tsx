import type { Metadata } from 'next';
import { ChevronLeft } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link, redirect } from '@/i18n/navigation';
import { createSupabaseServer } from '@/shared/lib/supabase/server';
import { ThemeSetting } from './ThemeSetting';
import { SignOutButton } from './SignOutButton';
import { DeleteAccountButton } from './DeleteAccountButton';
import { ChangeEmailButton } from './ChangeEmailButton';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'DashboardSettings' });
  return { title: t('metaTitle') };
}

export default async function SettingsPage() {
  const supabase = await createSupabaseServer();
  const locale = await getLocale();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect({ href: '/register?redirect=/dashboard/settings', locale });
    return null;
  }

  const { data: appUser } = await supabase
    .from('users')
    .select('email, slug, created_at')
    .eq('id', user.id)
    .maybeSingle();
  if (!appUser) {
    redirect({ href: '/register?redirect=/dashboard/settings', locale });
    return null;
  }

  const t = await getTranslations('DashboardSettings');
  const memberSince = new Date(appUser.created_at).toLocaleDateString(
    locale === 'en' ? 'en-US' : 'de-DE',
    { month: 'long', year: 'numeric' },
  );

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-text"
      >
        <ChevronLeft size={16} aria-hidden />
        {t('back')}
      </Link>

      <h1 className="text-2xl font-bold tracking-tight text-text">{t('h1')}</h1>

      <Section title={t('sectionAccount')}>
        <Row
          label={t('fieldEmail')}
          value={
            <div className="flex flex-col items-end gap-1">
              <span>{appUser.email}</span>
              <ChangeEmailButton currentEmail={appUser.email} />
            </div>
          }
        />
        <Row
          label={t('fieldProfileUrl')}
          value={
            <Link
              href={`/${appUser.slug}`}
              className="text-accent hover:underline"
            >
              prooved.xyz/{appUser.slug}
            </Link>
          }
        />
        <Row label={t('fieldMemberSince')} value={memberSince} />
      </Section>

      <Section title={t('sectionAppearance')}>
        <ThemeSetting />
      </Section>

      <SignOutButton />

      <Section title={t('sectionDanger')} tone="danger">
        <p className="text-sm text-muted">{t('dangerText')}</p>
        <div className="mt-3">
          <DeleteAccountButton />
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  tone = 'default',
  children,
}: {
  title: string;
  tone?: 'default' | 'danger';
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border bg-surface p-5 ${
        tone === 'danger' ? 'border-danger/40' : 'border-elevated'
      }`}
    >
      <h2
        className={`text-base font-semibold ${
          tone === 'danger' ? 'text-danger' : 'text-text'
        }`}
      >
        {title}
      </h2>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-elevated/50 py-2 last:border-0">
      <span className="text-sm text-muted">{label}</span>
      <span className="text-sm text-text text-right">{value}</span>
    </div>
  );
}

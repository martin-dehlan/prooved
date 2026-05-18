import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/shared/components/ui/Logo';
import { LegalFooter } from '@/shared/components/LegalFooter';

const EFFECTIVE_DATE = '09.05.2026';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Privacy' });
  return { title: t('metaTitle') };
}

export default async function PrivacyPage() {
  const t = await getTranslations('Privacy');
  const tCommon = await getTranslations('Common');
  const rich = { strong: (c: React.ReactNode) => <strong>{c}</strong> };
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-elevated bg-surface/80">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3">
          <Link href="/" aria-label={tCommon('home')}>
            <Logo size={28} />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-muted hover:text-text"
          >
            {tCommon('back')}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-text">
          {t('h1')}
        </h1>
        <p className="mt-1 text-sm text-muted">{t('effective', { date: EFFECTIVE_DATE })}</p>

        <Section n="1" title={t('s1Title')}>
          <p>
            {t('s1Text')}{' '}
            <a
              href="mailto:support@prooved.xyz"
              className="text-accent hover:underline"
            >
              support@prooved.xyz
            </a>
          </p>
        </Section>

        <Section n="2" title={t('s2Title')}>
          <ul className="list-inside list-disc space-y-1">
            <li>{t.rich('s2Account', rich)}</li>
            <li>{t.rich('s2Connections', rich)}</li>
            <li>{t.rich('s2Wallet', rich)}</li>
            <li>{t.rich('s2Reports', rich)}</li>
            <li>{t.rich('s2Logs', rich)}</li>
          </ul>
        </Section>

        <Section n="3" title={t('s3Title')}>
          <ul className="list-inside list-disc space-y-1">
            <li>{t.rich('s3Vercel', rich)}</li>
            <li>{t.rich('s3Supabase', rich)}</li>
            <li>{t.rich('s3Resend', rich)}</li>
            <li>{t.rich('s3Posthog', rich)}</li>
            <li>{t.rich('s3Third', rich)}</li>
          </ul>
        </Section>

        <Section n="4" title={t('s4Title')}>
          <p>{t('s4Oauth')}</p>
          <p>{t('s4Bio')}</p>
        </Section>

        <Section n="5" title={t('s5Title')}>
          <p>{t('s5Cookies')}</p>
          <p>{t('s5Posthog')}</p>
        </Section>

        <Section n="6" title={t('s6Title')}>
          <p>
            {t.rich('s6Text', {
              code: (c) => <code>{c}</code>,
            })}
          </p>
        </Section>

        <Section n="7" title={t('s7Title')}>
          <ul className="list-inside list-disc space-y-1">
            <li>{t('s7Account')}</li>
            <li>{t('s7Connections')}</li>
            <li>{t('s7Logs')}</li>
            <li>{t('s7Reports')}</li>
          </ul>
        </Section>

        <Section n="8" title={t('s8Title')}>
          <p>
            {t.rich('s8Rights', {
              link: (c) => (
                <a
                  href="https://www.datenschutz-berlin.de"
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline"
                >
                  {c}
                </a>
              ),
            })}
          </p>
          <p>
            {t.rich('s8Account', {
              settings: (c) => (
                <Link
                  href="/dashboard/settings"
                  className="text-accent hover:underline"
                >
                  {c}
                </Link>
              ),
            })}{' '}
            <a
              href="mailto:support@prooved.xyz"
              className="text-accent hover:underline"
            >
              support@prooved.xyz
            </a>
            .
          </p>
        </Section>

        <Section n="9" title={t('s9Title')}>
          <p>{t('s9Text')}</p>
        </Section>

        <Section n="10" title={t('s10Title')}>
          <p>{t('s10Text')}</p>
        </Section>
      </main>

      <LegalFooter />
    </div>
  );
}

function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold text-text">
        {n}. {title}
      </h2>
      <div className="mt-2 space-y-2 text-sm text-muted">{children}</div>
    </section>
  );
}

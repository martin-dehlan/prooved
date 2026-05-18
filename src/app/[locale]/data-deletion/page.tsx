import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Logo } from '@/shared/components/ui/Logo';
import { LegalFooter } from '@/shared/components/LegalFooter';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'DataDeletion' });
  return { title: t('metaTitle') };
}

export default async function DataDeletionPage() {
  const t = await getTranslations('DataDeletion');
  const tCommon = await getTranslations('Common');
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-elevated bg-surface/80">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3">
          <Link href="/" aria-label={tCommon('home')}>
            <Logo size={28} />
          </Link>
          <Link href="/" className="text-sm font-medium text-muted hover:text-text">
            {tCommon('back')}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-10">
        <h1 className="text-2xl font-bold tracking-tight text-text">{t('h1')}</h1>
        <p className="mt-2 text-sm text-muted">{t('intro')}</p>

        <Section title={t('s1Title')}>
          <ol className="list-inside list-decimal space-y-1">
            <li>{t('s1Step1')}</li>
            <li>
              {t.rich('s1Step2', {
                settings: (c) => (
                  <Link href="/dashboard/settings" className="text-accent hover:underline">
                    {c}
                  </Link>
                ),
              })}
            </li>
            <li>{t('s1Step3')}</li>
          </ol>
          <p>
            {t.rich('s1Effect', {
              code: (c) => <code>{c}</code>,
            })}
          </p>
        </Section>

        <Section title={t('s2Title')}>
          <p>{t('s2Text')}</p>
          <p>{t('s2Alt')}</p>
        </Section>

        <Section title={t('s3Title')}>
          <p>
            {t('s3Text')}{' '}
            <a
              href="mailto:support@prooved.xyz"
              className="text-accent hover:underline"
            >
              support@prooved.xyz
            </a>
            .
          </p>
          <p>{t('s3Sla')}</p>
        </Section>

        <Section title={t('s4Title')}>
          <ul className="list-inside list-disc space-y-1">
            <li>{t('s4Onchain')}</li>
            <li>{t('s4Logs')}</li>
          </ul>
        </Section>
      </main>

      <LegalFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-base font-semibold text-text">{title}</h2>
      <div className="mt-2 space-y-2 text-sm text-muted">{children}</div>
    </section>
  );
}

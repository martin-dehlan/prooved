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
  const t = await getTranslations({ locale, namespace: 'Imprint' });
  return { title: t('metaTitle') };
}

export default async function ImprintPage() {
  const t = await getTranslations('Imprint');
  const tCommon = await getTranslations('Common');
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
        <p className="mt-1 text-sm text-muted">{t('subline')}</p>

        <Section title={t('providerTitle')}>
          <p>{t('providerName')}</p>
          <p>{t('providerStreet')}</p>
          <p>{t('providerCity')}</p>
          <p>{t('providerCountry')}</p>
        </Section>

        <Section title={t('contactTitle')}>
          <p>
            {t('contactEmail')}{' '}
            <a
              href="mailto:support@prooved.xyz"
              className="text-accent hover:underline"
            >
              support@prooved.xyz
            </a>
          </p>
        </Section>

        <Section title={t('vatTitle')}>
          <p>{t('vatText')}</p>
        </Section>

        <Section title={t('responsibleTitle')}>
          <p>{t('providerName')}</p>
          <p>{t('responsibleAddress')}</p>
        </Section>

        <Section title={t('euDisputeTitle')}>
          <p>
            {t.rich('euDisputeText', {
              link: (c) => (
                <a
                  href="https://ec.europa.eu/consumers/odr/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:underline"
                >
                  {c}
                </a>
              ),
            })}
          </p>
        </Section>

        <Section title={t('liabilityContentTitle')}>
          <p>{t('liabilityContentText')}</p>
        </Section>

        <Section title={t('liabilityLinksTitle')}>
          <p>{t('liabilityLinksText')}</p>
        </Section>

        <Section title={t('trademarkTitle')}>
          <p>{t('trademarkText')}</p>
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
      <div className="mt-2 space-y-1 text-sm text-muted">{children}</div>
    </section>
  );
}

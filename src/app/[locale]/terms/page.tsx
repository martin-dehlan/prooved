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
  const t = await getTranslations({ locale, namespace: 'Terms' });
  return { title: t('metaTitle') };
}

export default async function TermsPage() {
  const t = await getTranslations('Terms');
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
        <p className="mt-1 text-sm text-muted">{t('effective', { date: EFFECTIVE_DATE })}</p>

        <Section n="1" title={t('s1Title')}>
          <p>{t('s1Text')}</p>
        </Section>

        <Section n="2" title={t('s2Title')}>
          <p>{t('s2Text1')}</p>
          <p>{t('s2Text2')}</p>
        </Section>

        <Section n="3" title={t('s3Title')}>
          <p>{t('s3Text1')}</p>
          <p>{t('s3Text2')}</p>
        </Section>

        <Section n="4" title={t('s4Title')}>
          <p>{t('s4Intro')}</p>
          <ul className="list-inside list-disc space-y-1">
            <li>{t('s4Fake')}</li>
            <li>{t('s4Bypass')}</li>
            <li>{t('s4Share')}</li>
            <li>{t('s4Scrape')}</li>
            <li>{t('s4ThirdParty')}</li>
          </ul>
        </Section>

        <Section n="5" title={t('s5Title')}>
          <p>{t('s5Text')}</p>
        </Section>

        <Section n="6" title={t('s6Title')}>
          <p>{t('s6Text')}</p>
        </Section>

        <Section n="7" title={t('s7Title')}>
          <p>{t('s7Text1')}</p>
          <p>{t('s7Text2')}</p>
        </Section>

        <Section n="8" title={t('s8Title')}>
          <p>
            {t.rich('s8Text', {
              settings: (c) => (
                <Link
                  href="/dashboard/settings"
                  className="text-accent hover:underline"
                >
                  {c}
                </Link>
              ),
            })}
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

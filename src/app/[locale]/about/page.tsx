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
  const t = await getTranslations({ locale, namespace: 'AboutPage' });
  return { title: t('metaTitle'), description: t('metaDescription') };
}

export default async function AboutPage() {
  const t = await getTranslations('AboutPage');
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

      <main className="mx-auto max-w-2xl space-y-8 px-5 py-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">
            {t('h1')}
          </h1>
          <p className="mt-3 text-base text-muted">
            {t('tagline')}
          </p>
        </div>

        <Section title={t('whatIsTitle')}>
          <p>{t('whatIs')}</p>
        </Section>

        <Section title={t('whatIsNotTitle')}>
          <p>{t.rich('whatIsNot', { strong: (c) => <strong>{c}</strong> })}</p>
        </Section>

        <Section title={t('howVerifyTitle')}>
          <ul className="list-inside list-disc space-y-1">
            <li>{t.rich('howVerifyGold', { strong: (c) => <strong>{c}</strong> })}</li>
            <li>{t.rich('howVerifySilver', { strong: (c) => <strong>{c}</strong> })}</li>
            <li>{t.rich('howVerifyBronze', { strong: (c) => <strong>{c}</strong> })}</li>
          </ul>
        </Section>

        <Section title={t('privacyTitle')}>
          <p>
            {t.rich('privacyText', {
              link: (c) => (
                <Link href="/privacy" className="text-accent hover:underline">
                  {c}
                </Link>
              ),
            })}
          </p>
        </Section>

        <Section title={t('contactTitle')}>
          <p>
            {t('contactText')}{' '}
            <a
              href="mailto:support@prooved.xyz"
              className="text-accent hover:underline"
            >
              support@prooved.xyz
            </a>
          </p>
        </Section>

        <div className="pt-4">
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-text px-6 text-sm font-semibold text-bg hover:opacity-90"
          >
            {t('cta')}
          </Link>
        </div>
      </main>

      <LegalFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      <div className="mt-2 space-y-2 text-sm text-muted">{children}</div>
    </section>
  );
}

import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { HeaderMenu } from '@/shared/components/ui/HeaderMenu';
import { Logo } from '@/shared/components/ui/Logo';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HowItWorks' });
  return { title: t('metaTitle'), description: t('metaDescription') };
}

export default async function HowItWorksPage() {
  const t = await getTranslations('HowItWorks');
  const tCommon = await getTranslations('Common');
  const rich = { strong: (c: React.ReactNode) => <strong>{c}</strong> };
  return (
    <main className="min-h-screen bg-bg">
      <header className="mx-auto flex max-w-2xl items-center justify-between px-5 py-6">
        <Link href="/" aria-label={tCommon('home')}>
          <Logo size={28} />
        </Link>
        <HeaderMenu />
      </header>

      <article className="mx-auto max-w-2xl space-y-8 px-5 pb-16">
        <section className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-text">
            {t('h1')}
          </h1>
          <p className="text-base text-muted">
            {t('intro')}
          </p>
        </section>

        <Section title={t('checkTitle')}>
          <ul className="list-disc space-y-2 pl-5 text-text">
            <li>{t.rich('checkOwnership', rich)}</li>
            <li>{t.rich('checkData', rich)}</li>
            <li>{t.rich('checkKyc', rich)}</li>
          </ul>
        </Section>

        <Section title={t('noGuaranteeTitle')}>
          <ul className="list-disc space-y-2 pl-5 text-text">
            <li>{t.rich('noGuaranteeAuth', rich)}</li>
            <li>{t.rich('noGuaranteeTx', rich)}</li>
            <li>{t.rich('noGuaranteeLive', rich)}</li>
          </ul>
        </Section>

        <Section title={t('scoreTitle')}>
          <p className="text-text">{t('scoreIntro')}</p>
          <dl className="mt-3 space-y-2 rounded-2xl border border-elevated bg-surface p-5">
            <ScoreRow
              label={t('scoreIdentity')}
              max={30}
              detail={t('scoreIdentityDetail')}
              maxLabel={t('scoreMax', { max: 30 })}
            />
            <ScoreRow
              label={t('scoreMarketplace')}
              max={40}
              detail={t('scoreMarketplaceDetail')}
              maxLabel={t('scoreMax', { max: 40 })}
            />
            <ScoreRow
              label={t('scoreVolume')}
              max={15}
              detail={t('scoreVolumeDetail')}
              maxLabel={t('scoreMax', { max: 15 })}
            />
            <ScoreRow
              label={t('scoreLongevity')}
              max={10}
              detail={t('scoreLongevityDetail')}
              maxLabel={t('scoreMax', { max: 10 })}
            />
            <ScoreRow
              label={t('scoreActivity')}
              max={5}
              detail={t('scoreActivityDetail')}
              maxLabel={t('scoreMax', { max: 5 })}
            />
          </dl>
          <p className="mt-3 text-sm text-muted">
            {t.rich('tierExplain', { strong: (c) => <strong className="text-text">{c}</strong> })}
          </p>
        </Section>

        <Section title={t('readingTitle')}>
          <ul className="list-disc space-y-2 pl-5 text-text">
            <li>{t.rich('readingHeader', rich)}</li>
            <li>{t.rich('readingMismatch', rich)}</li>
            <li>{t.rich('readingCards', rich)}</li>
            <li>{t.rich('readingBreakdown', rich)}</li>
          </ul>
        </Section>

        <Section title={t('securityTitle')}>
          <ul className="list-disc space-y-2 pl-5 text-text">
            <li>{t('securityTokens')}</li>
            <li>{t.rich('securityReadonly', rich)}</li>
            <li>{t('securityBio')}</li>
            <li>{t('securityMagic')}</li>
            <li>{t('securityControl')}</li>
            <li>{t('securityNotify')}</li>
          </ul>
        </Section>

        <Section title={t('limitsTitle')}>
          <ul className="list-disc space-y-2 pl-5 text-text">
            <li>{t('limitsSandbox')}</li>
            <li>{t('limitsCustom')}</li>
            <li>{t('limitsBio')}</li>
            <li>{t('limitsKyc')}</li>
          </ul>
        </Section>

        <p className="border-t border-elevated pt-6 text-center text-sm text-muted">
          {t('questions')}{' '}
          <a
            href="mailto:hi@prooved.xyz"
            className="text-accent hover:underline"
          >
            hi@prooved.xyz
          </a>
        </p>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold text-text">{title}</h2>
      {children}
    </section>
  );
}

function ScoreRow({
  label,
  max,
  detail,
  maxLabel,
}: {
  label: string;
  max: number;
  detail: string;
  maxLabel: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
      <div className="flex items-baseline gap-2">
        <dt className="font-semibold text-text">{label}</dt>
        <span className="text-sm text-muted">{maxLabel}</span>
      </div>
      <dd className="text-sm text-muted sm:max-w-[60%] sm:text-right">{detail}</dd>
      <span className="sr-only">{max}</span>
    </div>
  );
}

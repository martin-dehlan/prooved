import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { HeaderMenu } from '@/shared/components/ui/HeaderMenu';
import { Logo } from '@/shared/components/ui/Logo';
import { LegalFooter } from '@/shared/components/LegalFooter';
import { TrustSection } from './TrustSection';

export async function Hero() {
  const t = await getTranslations('Hero');
  return (
    <>
    <section className="mx-auto flex min-h-screen max-w-md flex-col justify-between px-5 py-10">
      <header className="flex items-center justify-between">
        <Logo size={28} />
        <HeaderMenu />
      </header>

      <div className="flex flex-col items-center text-center">
        <Image
          src="/logo.png"
          alt=""
          width={88}
          height={88}
          priority
          className="mb-4"
        />
        <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
          {t('betaBadge')}
        </span>
        <h1 className="mt-5 text-4xl font-bold tracking-tight text-text sm:text-5xl">
          {t('headlineLine1')} <br />
          {t('headlineLine2')}
        </h1>
        <p className="mt-5 text-base text-muted sm:text-lg">
          {t('subline')}
        </p>
        <Link
          href="/register"
          className="mt-8 inline-flex h-14 w-full items-center justify-center rounded-xl bg-text px-6 text-base font-semibold text-bg transition hover:opacity-90 active:scale-[0.98]"
        >
          {t('cta')}
        </Link>
        <p className="mt-3 text-xs text-muted">
          {t('ctaHint')}
        </p>
      </div>

      <footer className="space-y-3 text-center">
        <ol className="space-y-2 text-left text-sm text-text">
          <li className="flex gap-3">
            <span className="font-bold text-text">1.</span>
            <span>{t('step1')}</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-text">2.</span>
            <span>{t('step2')}</span>
          </li>
          <li className="flex gap-3">
            <span className="font-bold text-text">3.</span>
            <span>{t('step3')}</span>
          </li>
        </ol>
        <p className="text-xs text-muted">
          {t('disclaimer')}
        </p>
      </footer>
    </section>
    <TrustSection />
    <LegalFooter />
    </>
  );
}

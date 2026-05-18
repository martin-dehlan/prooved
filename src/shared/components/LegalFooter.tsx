import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export async function LegalFooter() {
  const t = await getTranslations('LegalFooter');
  return (
    <footer className="mx-auto max-w-2xl px-5 py-8 text-center text-xs text-muted">
      <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        <Link href="/about" className="hover:text-text hover:underline">
          {t('about')}
        </Link>
        <span aria-hidden>·</span>
        <Link href="/privacy" className="hover:text-text hover:underline">
          {t('privacy')}
        </Link>
        <span aria-hidden>·</span>
        <Link href="/terms" className="hover:text-text hover:underline">
          {t('terms')}
        </Link>
        <span aria-hidden>·</span>
        <Link href="/imprint" className="hover:text-text hover:underline">
          {t('imprint')}
        </Link>
      </nav>
      <p className="mt-3 text-muted/70">{t('copyright', { year: new Date().getFullYear() })}</p>
    </footer>
  );
}

import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

const TRUST_BADGES = [
  {
    label: 'OpenSSF Passing',
    href: 'https://www.bestpractices.dev/projects/12901',
  },
  {
    label: 'Hardenize Report',
    href: 'https://www.hardenize.com/report/prooved.xyz',
  },
  {
    label: 'Open Source · MIT',
    href: 'https://github.com/martin-dehlan/prooved',
  },
] as const;

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
        <span aria-hidden>·</span>
        <Link href="/security" className="hover:text-text hover:underline">
          {t('security')}
        </Link>
      </nav>

      <ul className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {TRUST_BADGES.map((b) => (
          <li key={b.label}>
            <a
              href={b.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-elevated bg-surface px-2.5 py-1 text-[11px] font-medium text-muted transition hover:border-text/40 hover:text-text"
            >
              {b.label}
            </a>
          </li>
        ))}
        <li>
          <span className="inline-flex items-center rounded-full border border-elevated bg-surface px-2.5 py-1 text-[11px] font-medium text-muted">
            {t('euHostedBadge')}
          </span>
        </li>
      </ul>

      <p className="mt-4 text-muted/70">{t('copyright', { year: new Date().getFullYear() })}</p>
    </footer>
  );
}

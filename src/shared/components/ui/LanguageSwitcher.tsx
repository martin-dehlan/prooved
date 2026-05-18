'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';

export function LanguageSwitcher() {
  const t = useTranslations('LanguageSwitcher');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onChange(next: Locale) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <label className="inline-flex h-9 items-center rounded-md text-text">
      <span className="sr-only">{t('label')}</span>
      <select
        aria-label={t('label')}
        value={locale}
        disabled={isPending}
        onChange={(e) => onChange(e.target.value as Locale)}
        className="h-9 cursor-pointer bg-transparent px-2 text-sm font-medium text-muted transition hover:text-text focus:outline-none disabled:opacity-50"
      >
        {routing.locales.map((l) => (
          <option key={l} value={l} className="bg-bg text-text">
            {l.toUpperCase()}
          </option>
        ))}
      </select>
    </label>
  );
}

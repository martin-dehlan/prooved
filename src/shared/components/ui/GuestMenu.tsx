'use client';

import { useEffect, useRef, useState } from 'react';
import { Settings } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';

export function GuestMenu() {
  const t = useTranslations('Header');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        aria-label={t('menu')}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-text transition hover:bg-elevated"
      >
        <Settings size={18} aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-elevated bg-surface shadow-lg"
        >
          <div className="flex items-center justify-between px-3 py-2 text-sm text-text">
            <span>{t('theme')}</span>
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-between border-t border-elevated/60 px-3 py-2 text-sm text-text">
            <span>{t('language')}</span>
            <LanguageSwitcher />
          </div>
          <Link
            href="/register"
            onClick={() => setOpen(false)}
            className="block border-t border-elevated/60 px-3 py-2.5 text-sm font-semibold text-accent transition hover:bg-elevated"
          >
            {t('signIn')}
          </Link>
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';

const STORAGE_KEY = 'prooved-theme';
type Theme = 'dark' | 'light';

function getInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.classList.contains('light') ? 'light' : 'dark';
}

export function ThemeSetting() {
  const t = useTranslations('DashboardSettings');
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  function set(next: Theme) {
    document.documentElement.classList.toggle('light', next === 'light');
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    setTheme(next);
  }

  return (
    <div className="inline-flex rounded-md border border-elevated p-0.5">
      <Option active={theme === 'light'} onClick={() => set('light')}>
        <Sun size={14} aria-hidden /> {t('themeLight')}
      </Option>
      <Option active={theme === 'dark'} onClick={() => set('dark')}>
        <Moon size={14} aria-hidden /> {t('themeDark')}
      </Option>
    </div>
  );
}

function Option({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition ${
        active
          ? 'bg-elevated text-text'
          : 'text-muted hover:text-text'
      }`}
    >
      {children}
    </button>
  );
}

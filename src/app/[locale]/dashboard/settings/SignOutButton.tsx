'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { signOut } from '@/features/auth';

export function SignOutButton() {
  const t = useTranslations('DashboardSettings');
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await signOut();
        window.location.href = '/';
      }}
      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-elevated bg-surface px-4 py-3 text-sm font-semibold text-text transition hover:bg-elevated disabled:opacity-50"
    >
      <LogOut size={16} aria-hidden />
      {busy ? t('signOutBusy') : t('signOut')}
    </button>
  );
}

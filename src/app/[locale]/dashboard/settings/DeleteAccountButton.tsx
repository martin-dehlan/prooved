'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function DeleteAccountButton() {
  const t = useTranslations('DashboardSettings');
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        redirect: 'follow',
      });
      if (res.redirected) {
        window.location.href = res.url;
        return;
      }
      if (!res.ok) throw new Error(t('deleteError'));
      window.location.href = '/';
    } catch (e) {
      setError(e instanceof Error ? e.message : t('deleteError'));
      setBusy(false);
    }
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-2 rounded-md border border-danger/40 px-3 py-2 text-sm font-semibold text-danger transition hover:bg-danger/10"
      >
        <Trash2 size={16} aria-hidden />
        {t('deleteButton')}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-text">{t('deleteConfirm')}</p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={handleDelete}
          className="rounded-md bg-danger px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? t('deleteBusy') : t('deleteYes')}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => setConfirming(false)}
          className="rounded-md border border-elevated px-3 py-2 text-sm font-medium text-text transition hover:bg-elevated disabled:opacity-50"
        >
          {t('deleteCancel')}
        </button>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function ChangeEmailButton({ currentEmail }: { currentEmail: string }) {
  const t = useTranslations('DashboardSettings');
  const [editing, setEditing] = useState(false);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/account/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        pending?: string;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        const code = data.error;
        if (code === 'same_email') setError(t('emailSameError'));
        else if (code === 'invalid_email') setError(t('emailInvalidError'));
        else setError(t('emailError'));
        return;
      }
      setPending(data.pending ?? email);
      setEditing(false);
      setEmail('');
    } catch {
      setError(t('emailError'));
    } finally {
      setBusy(false);
    }
  }

  if (pending) {
    return (
      <p className="text-xs text-muted">
        {t('emailPending', { email: pending })}
      </p>
    );
  }

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline"
      >
        <Pencil size={12} aria-hidden />
        {t('emailChange')}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <input
        type="email"
        required
        autoFocus
        placeholder={currentEmail}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-md border border-elevated bg-surface px-3 py-2 text-sm text-text outline-none focus:border-accent"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy || !email}
          className="rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? t('emailBusy') : t('emailSave')}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => {
            setEditing(false);
            setEmail('');
            setError(null);
          }}
          className="rounded-md border border-elevated px-3 py-1.5 text-xs font-medium text-text transition hover:bg-elevated disabled:opacity-50"
        >
          {t('emailCancel')}
        </button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </form>
  );
}

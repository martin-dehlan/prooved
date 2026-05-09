'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label } from '@/shared/components/ui';

export function ReverbTokenFlow() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function verify() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/connections/reverb/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push('/dashboard');
        router.refresh();
        return;
      }
      setError(data.error ?? 'Verifizierung fehlgeschlagen');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <ol className="space-y-3">
        <li className="rounded-lg border border-elevated bg-surface p-4">
          <p className="text-sm font-semibold text-text">
            1. Personal Access Token bei Reverb erstellen
          </p>
          <ol className="mt-2 space-y-1 text-sm text-muted">
            <li>
              1.{' '}
              <a
                href="https://reverb.com/my/api_settings"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-text underline underline-offset-2 hover:text-accent"
              >
                Reverb · API & Integrations
              </a>
            </li>
            <li>2. „Personal Access Tokens" → „Create New"</li>
            <li>
              3. Beliebiger Name (z.B. <code className="text-text">Prooved</code>) →
              Token kopieren
            </li>
          </ol>
        </li>

        <li className="space-y-3 rounded-lg border border-elevated bg-surface p-4">
          <Label htmlFor="reverb-token">2. Token einfügen</Label>
          <Input
            id="reverb-token"
            type="password"
            placeholder="Reverb-Token (beginnt meist mit 'rb_…')"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <p className="text-[11px] text-muted">
            Wir speichern den Token AES-256-verschlüsselt. Read-only — wir nutzen
            ihn nur, um deine Shop-Bewertungen abzufragen.
          </p>
        </li>

        <li className="rounded-lg border border-elevated bg-surface p-4">
          <p className="text-sm font-semibold text-text">3. Verifizieren</p>
          <Button
            onClick={verify}
            disabled={busy || token.trim().length < 20}
            block
            size="lg"
            className="mt-3"
          >
            {busy ? 'Prüfe Token…' : 'Verifizieren'}
          </Button>
        </li>
      </ol>

      {error && (
        <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

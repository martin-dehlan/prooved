'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label } from '@/shared/components/ui';

export function DomainVerifyFlow() {
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);
  const [domain, setDomain] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetch('/api/connections/website-code')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setCode(d.code))
      .catch(() => setError('Code konnte nicht geladen werden'));
  }, []);

  async function verify() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch('/api/connections/verify-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (data.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.reason ?? 'Verifizierung fehlgeschlagen');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unbekannter Fehler');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {code && (
        <div className="space-y-3 rounded-2xl border border-elevated bg-surface p-5">
          <div>
            <p className="text-sm font-semibold text-text">
              1. TXT-Record bei deinem DNS-Provider setzen
            </p>
            <div className="mt-2 space-y-1 rounded-xl bg-elevated p-3 font-mono text-sm">
              <div>
                <span className="text-muted">Name:</span> @ (oder _prooved)
              </div>
              <div>
                <span className="text-muted">Type:</span> TXT
              </div>
              <div className="break-all">
                <span className="text-muted">Value:</span>{' '}
                <span className="font-bold">prooved-verify={code}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowHelp((v) => !v)}
              className="mt-2 text-xs font-medium text-muted underline-offset-4 hover:text-text hover:underline"
            >
              {showHelp ? 'verbergen' : 'wie geht das?'}
            </button>
            {showHelp && (
              <div className="mt-2 space-y-1 rounded-xl bg-bg p-3 text-sm text-text">
                <p>Beispiele beim Provider:</p>
                <ul className="list-disc space-y-0.5 pl-5">
                  <li>
                    <strong>IONOS / Strato</strong>: Domains → Domain → DNS-Einstellungen
                  </li>
                  <li>
                    <strong>Cloudflare</strong>: DNS → Records → Add record
                  </li>
                  <li>
                    <strong>GoDaddy</strong>: My Domains → DNS → Records → Add
                  </li>
                </ul>
                <p className="mt-2 text-xs text-muted">
                  DNS-Propagation kann bis zu 1h dauern.
                </p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="domain">2. Domain eingeben</Label>
            <Input
              id="domain"
              type="text"
              placeholder="example.de"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-text">3. Klick auf "Verifizieren":</p>
            <Button
              onClick={verify}
              disabled={busy || domain.length < 3}
              block
              size="lg"
              className="mt-2"
            >
              {busy ? 'Prüfe DNS…' : 'Verifizieren'}
            </Button>
          </div>
        </div>
      )}

      {!code && !error && <p className="text-sm text-muted">Lade…</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

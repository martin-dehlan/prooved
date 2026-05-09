'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label } from '@/shared/components/ui';
import {
  getBioCode,
  verifyBioCode,
} from '@/features/connections/services/connectionService';

export function CustomVerifyFlow() {
  const router = useRouter();
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    getBioCode('custom')
      .then((r) => alive && setCode(r.code))
      .catch((e) =>
        alive && setError(e instanceof Error ? e.message : 'Code-Abruf fehlgeschlagen'),
      );
    return () => {
      alive = false;
    };
  }, []);

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  async function verify() {
    setError(null);
    setBusy(true);
    try {
      const res = await verifyBioCode({
        platform: 'custom',
        platformUrl: url,
        customLabel: label,
      });
      if (res.verified) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(res.reason ?? 'Code in der URL nicht gefunden.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <ol className="space-y-4">
        <li className="rounded-lg border border-elevated bg-surface p-4">
          <p className="text-sm font-semibold text-text">1. Kopier diesen Code</p>
          <p className="mt-1 text-sm text-muted">
            Pack ihn auf der Plattform deiner Wahl in Profil-Bio, Anzeigen-Titel,
            Beschreibung oder Posting — Hauptsache öffentlich erreichbar.
          </p>
          <button
            type="button"
            onClick={copyCode}
            disabled={!code}
            className="mt-3 flex w-full items-center justify-between rounded-xl bg-elevated px-4 py-3 transition hover:opacity-90 disabled:opacity-50"
          >
            <code className="font-mono text-base font-bold tracking-wide text-text">
              {code ?? '…'}
            </code>
            <span className="text-sm font-semibold text-muted">
              {copied ? '✓ kopiert' : 'kopieren'}
            </span>
          </button>
        </li>

        <li className="space-y-3 rounded-lg border border-elevated bg-surface p-4">
          <p className="text-sm font-semibold text-text">2. Plattform-Name + URL</p>
          <div className="space-y-2">
            <Label htmlFor="label">Wie heißt die Plattform?</Label>
            <Input
              id="label"
              type="text"
              placeholder="z.B. Booklooker, Mobile.de, Mein-Forum"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={60}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">URL der Seite mit dem Code</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://www.example.com/dein-profil"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-xs text-muted">
              Die Seite muss öffentlich (ohne Login) erreichbar sein. Wir lesen
              nur den HTML-Inhalt — keine Bewertungs-Daten werden extrahiert.
            </p>
          </div>
        </li>

        <li className="rounded-lg border border-elevated bg-surface p-4">
          <p className="text-sm font-semibold text-text">3. Verifizieren</p>
          <Button
            onClick={verify}
            disabled={busy || !code || label.trim().length < 1 || url.length < 10}
            block
            size="lg"
            className="mt-3"
          >
            {busy ? 'Prüfe…' : 'Verifizieren'}
          </Button>
        </li>
      </ol>

      {error && <p className="text-sm text-danger">{error}</p>}

      <p className="rounded-xl bg-warning/10 px-4 py-3 text-xs text-warning">
        Hinweis: Custom-Plattform liefert keine Bewertungsdaten — nur Eigentums-Beweis.
        Trust-Score erhält Marktplatz-Punkte, aber kein Quality-Bonus. Dynamische
        SPAs (Facebook, Instagram, TikTok) funktionieren oft nicht — User müssen
        eine HTML-Seite mit sichtbarem Code haben.
      </p>
    </div>
  );
}

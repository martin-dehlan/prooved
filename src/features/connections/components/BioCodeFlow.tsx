'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Label } from '@/shared/components/ui';
import { getBioCode, verifyBioCode } from '@/features/connections/services/connectionService';
import type { BioCodePlatform } from '@/features/connections/types/connection.schemas';

// BioCodeFlow handles platforms with predefined help-text + URL pattern.
// Custom uses its own CustomVerifyFlow with user-provided label.
type ScriptedPlatform = Exclude<BioCodePlatform, 'custom'>;

// Render `[label](url)` as <a>, plain text passes through.
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  const re = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > cursor) parts.push(text.slice(cursor, m.index));
    parts.push(
      <a
        key={`${m.index}`}
        href={m[2]}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-text underline underline-offset-2 hover:text-accent"
      >
        {m[1]}
      </a>,
    );
    cursor = re.lastIndex;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return parts.length ? parts : text;
}

interface PlatformConfig {
  label: string;
  placeholder: string;
  bioField: string;
  prerequisite?: string;
  steps: string[];
}

const CONFIG: Record<ScriptedPlatform, PlatformConfig> = {
  vinted: {
    label: 'Vinted',
    placeholder: 'https://www.vinted.de/member/12345678-handle',
    bioField: 'Über mich',
    steps: [
      'Auf [vinted.de](https://www.vinted.de) oben rechts auf dein Profil-Bild klicken',
      'Profil aufrufen — Adresszeile-URL kopieren',
    ],
  },
  kleinanzeigen: {
    label: 'Kleinanzeigen',
    placeholder: 'https://www.kleinanzeigen.de/s-anzeige/...',
    bioField: 'Anzeigen-Titel oder Beschreibung',
    prerequisite:
      'Kleinanzeigen-Profile haben kein Bio-Feld. Du brauchst mindestens eine aktive Anzeige — den Code packst du in deren Titel oder Beschreibung.',
    steps: [
      'Auf [kleinanzeigen.de](https://www.kleinanzeigen.de) eingeloggt: oben "Meins" → [Meine Anzeigen](https://www.kleinanzeigen.de/m-meine-anzeigen.html)',
      'Eine Anzeige öffnen (oder neue erstellen)',
      'Code unten in Titel oder Beschreibung einfügen — Anzeige speichern',
      'URL der Anzeige hier unten einfügen',
    ],
  },
  discogs: {
    label: 'Discogs',
    placeholder: 'https://www.discogs.com/user/dein-username',
    bioField: 'Profile / Bio',
    steps: [
      'Auf [discogs.com](https://www.discogs.com) einloggen → oben rechts Avatar → [Settings](https://www.discogs.com/settings/profile)',
      'Tab "Profile" → "Profile / Bio" Feld bearbeiten',
      'Code einfügen + speichern',
      'URL deines Profils kopieren (discogs.com/user/USERNAME)',
    ],
  },
  willhaben: {
    label: 'Willhaben',
    placeholder: 'https://www.willhaben.at/iad/seller-profile/...',
    bioField: 'Verkäufer-Beschreibung',
    steps: [
      'Auf [willhaben.at](https://www.willhaben.at) einloggen → "Mein willhaben" → "Verkäuferprofil"',
      'Beschreibung bearbeiten + Code einfügen + speichern',
      'URL deines Verkäufer-Profils kopieren (enthält /seller-profile/)',
    ],
  },
  shpock: {
    label: 'Shpock',
    placeholder: 'https://www.shpock.com/de-de/i/...',
    bioField: 'Anzeigen-Titel oder Beschreibung',
    prerequisite:
      'Shpock-Profile haben kein Bio-Feld. Du brauchst mindestens eine aktive Anzeige — den Code packst du in deren Titel oder Beschreibung.',
    steps: [
      'Auf [shpock.com](https://www.shpock.com/de-de) einloggen → Plus-Button → Anzeige erstellen (oder bestehende öffnen)',
      'Code in Titel oder Beschreibung einfügen, Anzeige veröffentlichen',
      'URL der Anzeige kopieren (enthält /i/...)',
    ],
  },
};

export function BioCodeFlow({ platform }: { platform: ScriptedPlatform }) {
  const router = useRouter();
  const cfg = CONFIG[platform];
  const [code, setCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    let alive = true;
    getBioCode(platform)
      .then((r) => {
        if (alive) setCode(r.code);
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e.message : 'Code-Abruf fehlgeschlagen');
      });
    return () => {
      alive = false;
    };
  }, [platform]);

  async function copyCode() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  async function verify() {
    setError(null);
    setBusy(true);
    try {
      const res = await verifyBioCode({ platform, platformUrl: url });
      if (res.verified) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(res.reason ?? `Code in deinem ${cfg.bioField} noch nicht gefunden.`);
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
        <li className="rounded-2xl border border-elevated bg-surface p-5">
          <p className="text-sm font-semibold text-text">
            1. Kopier diesen Code
          </p>
          <p className="mt-1 text-sm text-muted">
            Pack ihn auf {cfg.label} in dein{' '}
            <span className="font-medium text-text">{cfg.bioField}</span>.
          </p>
          <button
            type="button"
            onClick={copyCode}
            disabled={!code}
            className="mt-3 flex w-full items-center justify-between rounded-xl bg-elevated px-4 py-3 transition hover:bg-elevated disabled:opacity-50"
          >
            <code className="font-mono text-base font-bold tracking-wide text-text">
              {code ?? '…'}
            </code>
            <span className="text-sm font-semibold text-text">
              {copied ? '✓ kopiert' : 'kopieren'}
            </span>
          </button>
        </li>

        <li className="rounded-2xl border border-elevated bg-surface p-5">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-semibold text-text">
              2. {cfg.label}-URL hier einfügen
            </p>
            <button
              type="button"
              onClick={() => setShowHelp((v) => !v)}
              className="text-xs font-medium text-muted underline-offset-4 hover:text-text hover:underline"
            >
              {showHelp ? 'verbergen' : 'wo finde ich die?'}
            </button>
          </div>

          {showHelp && (
            <div className="mt-3 space-y-2 rounded-xl bg-bg p-4 text-sm">
              {cfg.prerequisite && (
                <p className="rounded-lg bg-warning/15 px-3 py-2 text-warning">
                  Hinweis: {cfg.prerequisite}
                </p>
              )}
              <ol className="space-y-1 text-text">
                {cfg.steps.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-bold text-text">{i + 1}.</span>
                    <span>{renderInline(s)}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div className="mt-3 space-y-2">
            <Label htmlFor="url" className="sr-only">
              {cfg.label}-URL
            </Label>
            <Input
              id="url"
              type="url"
              placeholder={cfg.placeholder}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button
              onClick={verify}
              disabled={busy || url.length < 10 || !code}
              block
              size="lg"
            >
              {busy ? 'Prüfe…' : 'Verifizieren'}
            </Button>
          </div>
        </li>
      </ol>

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

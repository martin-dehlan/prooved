'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button, Input, Label } from '@/shared/components/ui';
import { getBioCode, verifyBioCode } from '@/features/connections/services/connectionService';
import type { BioCodePlatform } from '@/features/connections/types/connection.schemas';

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

const PLATFORM_LABEL: Record<ScriptedPlatform, string> = {
  vinted: 'Vinted',
  kleinanzeigen: 'Kleinanzeigen',
  discogs: 'Discogs',
  willhaben: 'Willhaben',
  shpock: 'Shpock',
  reverb: 'Reverb',
};

// Each platform has a known number of steps (zero-indexed). Some have a "prerequisite" note.
const PLATFORM_STEPS: Record<ScriptedPlatform, number> = {
  vinted: 2,
  kleinanzeigen: 4,
  discogs: 3,
  willhaben: 3,
  shpock: 3,
  reverb: 3,
};
const PLATFORMS_WITH_PREREQ = new Set<ScriptedPlatform>(['kleinanzeigen', 'shpock', 'reverb']);

export function BioCodeFlow({ platform }: { platform: ScriptedPlatform }) {
  const router = useRouter();
  const t = useTranslations('BioCodeFlow');
  const tCfg = useTranslations('BioCodeFlowPlatforms');
  const label = PLATFORM_LABEL[platform];
  const placeholder = tCfg(`${platform}.placeholder` as `vinted.placeholder`);
  const bioField = tCfg(`${platform}.bioField` as `vinted.bioField`);
  const stepCount = PLATFORM_STEPS[platform];
  const prerequisite = PLATFORMS_WITH_PREREQ.has(platform)
    ? tCfg(`${platform}.prerequisite` as `kleinanzeigen.prerequisite`)
    : null;
  const steps = Array.from({ length: stepCount }, (_, i) =>
    tCfg(`${platform}.step.${i}` as `vinted.step.0`),
  );

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
        if (alive) setError(e instanceof Error ? e.message : t('codeFetchError'));
      });
    return () => {
      alive = false;
    };
  }, [platform, t]);

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
        setError(res.reason ?? t('codeNotFound', { field: bioField }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('genericError'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <ol className="space-y-4">
        <li className="rounded-lg border border-elevated bg-surface p-4">
          <p className="text-sm font-semibold text-text">{t('step1')}</p>
          <p className="mt-1 text-sm text-muted">
            {t.rich('step1Hint', {
              platform: label,
              field: bioField,
              b: (c) => <span className="font-medium text-text">{c}</span>,
            })}
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
              {copied ? t('copied') : t('copy')}
            </span>
          </button>
        </li>

        <li className="rounded-lg border border-elevated bg-surface p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-semibold text-text">
              {t('step2', { platform: label })}
            </p>
            <button
              type="button"
              onClick={() => setShowHelp((v) => !v)}
              className="text-xs font-medium text-muted underline-offset-4 hover:text-text hover:underline"
            >
              {showHelp ? t('hideHelp') : t('whereLink')}
            </button>
          </div>

          {showHelp && (
            <div className="mt-3 space-y-2 rounded-xl bg-bg p-4 text-sm">
              {prerequisite && (
                <p className="rounded-lg bg-warning/15 px-3 py-2 text-warning">
                  {t('hint', { text: prerequisite })}
                </p>
              )}
              <ol className="space-y-1 text-text">
                {steps.map((s, i) => (
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
              {t('urlSrLabel', { platform: label })}
            </Label>
            <Input
              id="url"
              type="url"
              placeholder={placeholder}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Button
              onClick={verify}
              disabled={busy || url.length < 10 || !code}
              block
              size="lg"
            >
              {busy ? t('verifying') : t('verify')}
            </Button>
          </div>
        </li>
      </ol>

      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

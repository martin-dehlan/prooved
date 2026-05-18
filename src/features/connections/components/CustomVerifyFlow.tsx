'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button, Input, Label } from '@/shared/components/ui';
import {
  getBioCode,
  verifyBioCode,
} from '@/features/connections/services/connectionService';

export function CustomVerifyFlow() {
  const router = useRouter();
  const t = useTranslations('CustomVerifyFlow');
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
      .catch(
        (e) => alive && setError(e instanceof Error ? e.message : t('codeFetchError')),
      );
    return () => {
      alive = false;
    };
  }, [t]);

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
        setError(res.reason ?? t('codeNotFound'));
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
          <p className="mt-1 text-sm text-muted">{t('step1Hint')}</p>
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
              {copied ? t('copied') : t('copy')}
            </span>
          </button>
        </li>

        <li className="space-y-3 rounded-lg border border-elevated bg-surface p-4">
          <p className="text-sm font-semibold text-text">{t('step2')}</p>
          <div className="space-y-2">
            <Label htmlFor="label">{t('labelQuestion')}</Label>
            <Input
              id="label"
              type="text"
              placeholder={t('labelPlaceholder')}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              maxLength={60}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">{t('urlLabel')}</Label>
            <Input
              id="url"
              type="url"
              placeholder={t('urlPlaceholder')}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-xs text-muted">{t('urlHint')}</p>
          </div>
        </li>

        <li className="rounded-lg border border-elevated bg-surface p-4">
          <p className="text-sm font-semibold text-text">{t('step3')}</p>
          <Button
            onClick={verify}
            disabled={busy || !code || label.trim().length < 1 || url.length < 10}
            block
            size="lg"
            className="mt-3"
          >
            {busy ? t('verifying') : t('verify')}
          </Button>
        </li>
      </ol>

      {error && <p className="text-sm text-danger">{error}</p>}

      <p className="rounded-xl bg-warning/10 px-4 py-3 text-xs text-warning">
        {t('warning')}
      </p>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { Button, Input, Label } from '@/shared/components/ui';

export function DomainVerifyFlow() {
  const router = useRouter();
  const t = useTranslations('DomainVerifyFlow');
  const [code, setCode] = useState<string | null>(null);
  const [domain, setDomain] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetch('/api/connections/website-code')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setCode(d.code))
      .catch(() => setError(t('codeLoadError')));
  }, [t]);

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
        setError(data.reason ?? t('verifyFailed'));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t('unknownError'));
    } finally {
      setBusy(false);
    }
  }

  const richB = { b: (c: React.ReactNode) => <strong>{c}</strong> };

  return (
    <div className="space-y-4">
      {code && (
        <div className="space-y-3 rounded-lg border border-elevated bg-surface p-4">
          <div>
            <p className="text-sm font-semibold text-text">{t('step1')}</p>
            <div className="mt-2 space-y-1 rounded-xl bg-elevated p-3 font-mono text-sm">
              <div>
                <span className="text-muted">{t('name')}</span> {t('nameValue')}
              </div>
              <div>
                <span className="text-muted">{t('type')}</span> TXT
              </div>
              <div className="break-all">
                <span className="text-muted">{t('value')}</span>{' '}
                <span className="font-bold">prooved-verify={code}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowHelp((v) => !v)}
              className="mt-2 text-xs font-medium text-muted underline-offset-4 hover:text-text hover:underline"
            >
              {showHelp ? t('hideHow') : t('showHow')}
            </button>
            {showHelp && (
              <div className="mt-2 space-y-1 rounded-xl bg-bg p-3 text-sm text-text">
                <p>{t('examples')}</p>
                <ul className="list-disc space-y-0.5 pl-5">
                  <li>{t.rich('providerIonos', richB)}</li>
                  <li>{t.rich('providerCloudflare', richB)}</li>
                  <li>{t.rich('providerGodaddy', richB)}</li>
                </ul>
                <p className="mt-2 text-xs text-muted">{t('propagationHint')}</p>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="domain">{t('step2')}</Label>
            <Input
              id="domain"
              type="text"
              placeholder={t('domainPlaceholder')}
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-text">{t('step3')}</p>
            <Button
              onClick={verify}
              disabled={busy || domain.length < 3}
              block
              size="lg"
              className="mt-2"
            >
              {busy ? t('verifying') : t('verify')}
            </Button>
          </div>
        </div>
      )}

      {!code && !error && <p className="text-sm text-muted">{t('loading')}</p>}
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/ui';

export function ExportButton() {
  const t = useTranslations('ExportButton');
  const [busy, setBusy] = useState(false);

  async function downloadExport() {
    setBusy(true);
    try {
      const res = await fetch('/api/export/signed');
      if (!res.ok) throw new Error(t('error', { status: res.status }));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prooved-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : t('unknownError'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={downloadExport} disabled={busy} variant="outline">
      {busy ? t('busy') : t('label')}
    </Button>
  );
}

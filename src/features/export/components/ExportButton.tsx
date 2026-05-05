'use client';

import { useState } from 'react';
import { Button } from '@/shared/components/ui';

export function ExportButton() {
  const [busy, setBusy] = useState(false);

  async function downloadExport() {
    setBusy(true);
    try {
      const res = await fetch('/api/export/signed');
      if (!res.ok) throw new Error(`Export fehlgeschlagen: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prooved-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Fehler');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button onClick={downloadExport} disabled={busy} variant="outline">
      {busy ? 'Erstelle…' : 'Daten exportieren als JSON'}
    </Button>
  );
}

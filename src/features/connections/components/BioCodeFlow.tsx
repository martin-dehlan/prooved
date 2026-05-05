'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, CardContent, Input, Label } from '@/shared/components/ui';
import { startBioCodeFlow, verifyBioCode } from '@/features/connections/services/connectionService';

export function BioCodeFlow({ platform }: { platform: 'vinted' | 'kleinanzeigen' }) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [bioCode, setBioCode] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setError(null);
    setBusy(true);
    try {
      const res = await startBioCodeFlow({ platform, platformUrl: url });
      setBioCode(res.bioCode);
      setConnectionId(res.connectionId);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler');
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    if (!connectionId) return;
    setError(null);
    setBusy(true);
    try {
      const res = await verifyBioCode(connectionId);
      if (res.verified) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError('Code in Bio noch nicht gefunden. Speichere dein Profil und versuche es erneut.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler');
    } finally {
      setBusy(false);
    }
  }

  const platformLabel = platform === 'vinted' ? 'Vinted' : 'Kleinanzeigen';

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">{platformLabel}-Profil-URL</Label>
          <Input
            id="url"
            type="url"
            placeholder={
              platform === 'vinted'
                ? 'https://www.vinted.de/member/12345678-handle'
                : 'https://www.kleinanzeigen.de/pro/handle'
            }
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={!!bioCode}
          />
          {!bioCode && (
            <Button onClick={start} disabled={busy || url.length < 10}>
              {busy ? 'Starte…' : 'Code generieren'}
            </Button>
          )}
        </div>

        {bioCode && (
          <div className="space-y-3 rounded-md bg-zinc-50 p-4">
            <div>
              <p className="text-sm font-medium">1. Kopiere diesen Code:</p>
              <code className="mt-1 block rounded bg-white p-2 font-mono text-sm">
                {bioCode}
              </code>
            </div>
            <div>
              <p className="text-sm font-medium">2. Füge ihn in deine {platformLabel}-Profilbeschreibung ein</p>
              <p className="mt-1 text-xs text-zinc-500">
                Speichere dein Profil. Der Code muss öffentlich sichtbar sein.
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">3. Klick auf &quot;Verifizieren&quot;:</p>
              <Button onClick={verify} disabled={busy} className="mt-2 w-full">
                {busy ? 'Prüfe…' : 'Verifizieren'}
              </Button>
            </div>
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </CardContent>
    </Card>
  );
}

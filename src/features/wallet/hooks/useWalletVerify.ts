'use client';

import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';

export function useWalletVerify() {
  const { publicKey, signMessage, connected } = useWallet();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function verify(): Promise<{ ok: boolean }> {
    setError(null);
    if (!connected || !publicKey || !signMessage) {
      setError('Wallet nicht verbunden');
      return { ok: false };
    }
    setBusy(true);
    try {
      const nonceRes = await fetch('/api/wallet/nonce');
      if (!nonceRes.ok) throw new Error(`Nonce konnte nicht geladen werden: ${nonceRes.status}`);
      const { nonce } = (await nonceRes.json()) as { nonce: string };

      const sig = await signMessage(new TextEncoder().encode(nonce));
      const verifyRes = await fetch('/api/wallet/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: publicKey.toBase58(),
          signature: bs58.encode(sig),
          nonce,
        }),
      });
      if (!verifyRes.ok) throw new Error(`Verify fehlgeschlagen: ${verifyRes.status}`);
      return { ok: true };
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Fehler');
      return { ok: false };
    } finally {
      setBusy(false);
    }
  }

  return { verify, busy, error, connected, publicKey };
}

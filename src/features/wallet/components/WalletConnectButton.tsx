'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/ui';
import { useWalletVerify } from '@/features/wallet/hooks/useWalletVerify';

export function WalletConnectButton() {
  const t = useTranslations('WalletConnect');
  const { verify, busy, error, connected } = useWalletVerify();

  return (
    <div className="space-y-2">
      <WalletMultiButton />
      {connected && (
        <Button onClick={verify} disabled={busy}>
          {busy ? t('verifying') : t('verify')}
        </Button>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

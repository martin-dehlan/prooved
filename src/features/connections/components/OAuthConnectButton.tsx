'use client';

import { Button } from '@/shared/components/ui';

export function OAuthConnectButton({ platform }: { platform: 'ebay' | 'paypal' }) {
  return (
    <a href={`/api/oauth/${platform}/start`}>
      <Button>Mit {platform === 'ebay' ? 'eBay' : 'PayPal'} verknüpfen</Button>
    </a>
  );
}

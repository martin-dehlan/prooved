'use client';

import { Button } from '@/shared/components/ui';

const LABELS = {
  ebay: 'eBay',
  paypal: 'PayPal',
  etsy: 'Etsy',
  github: 'GitHub',
  linkedin: 'LinkedIn',
} as const;

export function OAuthConnectButton({ platform }: { platform: keyof typeof LABELS }) {
  return (
    <a href={`/api/oauth/${platform}/start`} className="block">
      <Button block size="lg">
        Mit {LABELS[platform]} verknüpfen
      </Button>
    </a>
  );
}

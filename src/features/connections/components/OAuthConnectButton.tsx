'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/ui';

const LABELS = {
  ebay: 'eBay',
  paypal: 'PayPal',
  etsy: 'Etsy',
  github: 'GitHub',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
} as const;

export function OAuthConnectButton({ platform }: { platform: keyof typeof LABELS }) {
  const t = useTranslations('OAuthConnectButton');
  return (
    <a href={`/api/oauth/${platform}/start`} className="block">
      <Button block size="lg">
        {t('connect', { platform: LABELS[platform] })}
      </Button>
    </a>
  );
}

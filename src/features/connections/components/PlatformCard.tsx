import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent, Badge } from '@/shared/components/ui';
import { PlatformBadge } from '@/shared/components/profile/PlatformBadge';
import { ExpiryWarning } from '@/shared/components/profile/ExpiryWarning';
import { RatingDisplay } from '@/shared/components/profile/RatingDisplay';
import type { Connection } from '@/features/connections/types/connection.types';
import { deriveStatus } from '@/features/connections/types/connection.types';

const STATUS_VARIANT: Record<ReturnType<typeof deriveStatus>, 'success' | 'warning' | 'danger' | 'default'> = {
  verified: 'success',
  expiring: 'warning',
  expired: 'danger',
  temporarily_unavailable: 'warning',
  pending: 'default',
};

export function PlatformCard({ connection }: { connection: Connection }) {
  const t = useTranslations('PlatformCard');
  const locale = useLocale();
  const status = deriveStatus(connection);
  const statusKey: Record<ReturnType<typeof deriveStatus>, 'pending' | 'verified' | 'expiring' | 'expired' | 'unavailable'> = {
    pending: 'pending',
    verified: 'verified',
    expiring: 'expiring',
    expired: 'expired',
    temporarily_unavailable: 'unavailable',
  };
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <PlatformBadge platform={connection.platform} tier={connection.tier} />
          <Badge variant={STATUS_VARIANT[status]}>{t(statusKey[status])}</Badge>
        </div>
        <RatingDisplay
          score={connection.rating_score}
          count={connection.rating_count}
        />
        {connection.verified_at && (
          <p className="text-xs text-muted">
            {t('source', {
              platform: connection.platform,
              date: new Date(connection.verified_at).toLocaleDateString(
                locale === 'en' ? 'en-US' : 'de-DE',
              ),
            })}
          </p>
        )}
        <ExpiryWarning expiresAt={connection.expires_at} />
      </CardContent>
    </Card>
  );
}

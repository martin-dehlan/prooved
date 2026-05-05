import { Card, CardContent, Badge } from '@/shared/components/ui';
import { PlatformBadge } from '@/shared/components/profile/PlatformBadge';
import { ExpiryWarning } from '@/shared/components/profile/ExpiryWarning';
import { RatingDisplay } from '@/shared/components/profile/RatingDisplay';
import type { Connection } from '@/features/connections/types/connection.types';
import { deriveStatus } from '@/features/connections/types/connection.types';

const STATUS_LABEL = {
  pending: 'Ausstehend',
  verified: 'Verifiziert',
  expiring: 'Läuft ab',
  expired: 'Abgelaufen',
  temporarily_unavailable: 'Vorübergehend nicht verfügbar',
} as const;

const STATUS_VARIANT: Record<keyof typeof STATUS_LABEL, 'success' | 'warning' | 'danger' | 'default'> = {
  verified: 'success',
  expiring: 'warning',
  expired: 'danger',
  temporarily_unavailable: 'warning',
  pending: 'default',
};

export function PlatformCard({ connection }: { connection: Connection }) {
  const status = deriveStatus(connection);
  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <PlatformBadge platform={connection.platform} tier={connection.tier} />
          <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
        </div>
        <RatingDisplay
          score={connection.rating_score}
          count={connection.rating_count}
        />
        {connection.verified_at && (
          <p className="text-xs text-zinc-500">
            Quelle: {connection.platform}, verifiziert am{' '}
            {new Date(connection.verified_at).toLocaleDateString('de-DE')}
          </p>
        )}
        <ExpiryWarning expiresAt={connection.expires_at} />
      </CardContent>
    </Card>
  );
}

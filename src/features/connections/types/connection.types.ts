import type { Database } from '@/shared/types/database.types';
import type { Platform, Tier, VerifyMethod } from '@/shared/types/platform.types';

type RawConnection = Database['public']['Tables']['connections']['Row'];
type RawNewConnection = Database['public']['Tables']['connections']['Insert'];

export type Connection = Omit<RawConnection, 'platform' | 'tier' | 'method'> & {
  platform: Platform;
  tier: Tier;
  method: VerifyMethod;
};
export type NewConnection = Omit<RawNewConnection, 'platform' | 'tier' | 'method'> & {
  platform: Platform;
  tier: Tier;
  method: VerifyMethod;
};

export type { Platform, Tier, VerifyMethod };

export type ConnectionStatus =
  | 'pending'              // created, not yet verified
  | 'verified'             // verified_at set, expires_at in future
  | 'expiring'             // < 7 days
  | 'expired'              // expires_at in past
  | 'temporarily_unavailable'; // last fetch failed (Kleinanzeigen scrape etc.)

export function deriveStatus(c: Connection): ConnectionStatus {
  if (!c.verified_at) return 'pending';
  if (c.expires_at) {
    const diffDays = (new Date(c.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (diffDays < 0) return 'expired';
    if (diffDays < 7) return 'expiring';
  }
  return 'verified';
}
